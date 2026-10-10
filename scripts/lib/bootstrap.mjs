// CDK bootstrap orchestration for the workshop scripts.
//
// Workshop/sandbox accounts are frequently PRE-BOOTSTRAPPED by the event
// tooling: the CDK bootstrap roles, the asset bucket, the ECR repo and the
// `/cdk-bootstrap/hnb659fds/version` SSM parameter already exist. Running
// `cdk bootstrap` again in that situation makes CloudFormation try to IMPORT
// those pre-existing resources into a fresh CDKToolkit stack, which fails with:
//
//   Automatic import of existing resource ... needs a DeletionPolicy of
//   'Retain' or 'RetainExceptOnCreate'  (AutomaticImportNeedsRetain)
//
// A second failure mode is a CDKToolkit stack left in REVIEW_IN_PROGRESS: a
// change set was created but never executed, so the stack owns no resources.
// That empty stack blocks every future bootstrap attempt and must be removed
// (deleting a REVIEW_IN_PROGRESS stack never touches real resources).
//
// This module makes bootstrap idempotent and safe on those accounts:
//   1. Delete a stuck/empty CDKToolkit stack if present.
//   2. If the account already reports a usable bootstrap version, SKIP the
//      `cdk bootstrap` call entirely.
//   3. Otherwise run `cdk bootstrap` normally.

import {
  DescribeStacksCommand,
  DeleteStackCommand,
  waitUntilStackDeleteComplete,
} from '@aws-sdk/client-cloudformation';
import { GetParameterCommand } from '@aws-sdk/client-ssm';
import { cloudFormationClient, ssmClient } from './aws-clients.mjs';
import { run } from './exec.mjs';
import * as log from './console.mjs';

const BOOTSTRAP_STACK = 'CDKToolkit';

// Canonical signal of a bootstrapped environment: CDK itself reads this SSM
// parameter to decide the deployed bootstrap version. On workshop accounts the
// parameter can exist even when no CDKToolkit CloudFormation stack does.
const BOOTSTRAP_VERSION_PARAM = '/cdk-bootstrap/hnb659fds/version';

// The minimum bootstrap version the deploy flow needs. The modern default
// bootstrap template is well above this; workshop accounts observed at v32.
const MIN_BOOTSTRAP_VERSION = 6;

// Stack states that mean the CDKToolkit stack owns no usable resources and
// should be deleted before (re)bootstrapping.
const DELETABLE_STATES = new Set([
  'REVIEW_IN_PROGRESS',
  'ROLLBACK_COMPLETE',
  'CREATE_FAILED',
]);

/** Return the current CDKToolkit stack status, or null if it doesn't exist. */
async function getBootstrapStackStatus() {
  try {
    const res = await cloudFormationClient().send(
      new DescribeStacksCommand({ StackName: BOOTSTRAP_STACK }),
    );
    return res.Stacks?.[0]?.StackStatus ?? null;
  } catch (err) {
    if (
      err?.name === 'ValidationError' ||
      /does not exist/i.test(err?.message ?? '')
    ) {
      return null;
    }
    throw err;
  }
}

/** Read the deployed bootstrap version from SSM, or null if not bootstrapped. */
async function getBootstrapVersion() {
  try {
    const res = await ssmClient().send(
      new GetParameterCommand({ Name: BOOTSTRAP_VERSION_PARAM }),
    );
    const value = Number.parseInt(res.Parameter?.Value ?? '', 10);
    return Number.isNaN(value) ? null : value;
  } catch (err) {
    if (
      err?.name === 'ParameterNotFound' ||
      /ParameterNotFound/i.test(err?.name ?? '')
    ) {
      return null;
    }
    // Any other error (e.g. permissions) shouldn't be fatal here; let the
    // caller fall back to a normal bootstrap attempt.
    return null;
  }
}

/** Delete a stuck/empty CDKToolkit stack and wait for completion. */
async function deleteStuckBootstrapStack() {
  const cfn = cloudFormationClient();
  await cfn.send(new DeleteStackCommand({ StackName: BOOTSTRAP_STACK }));
  await waitUntilStackDeleteComplete(
    { client: cfn, maxWaitTime: 300 },
    { StackName: BOOTSTRAP_STACK },
  );
}

/**
 * Ensure the environment is CDK-bootstrapped without tripping over a
 * pre-bootstrapped workshop account. Logs what it does and only runs
 * `cdk bootstrap` when genuinely required.
 */
export async function ensureBootstrapped({ accountId, region, infraDir }) {
  // 1. Clear a stuck/empty CDKToolkit stack that would block bootstrap.
  const status = await getBootstrapStackStatus();
  if (status && DELETABLE_STATES.has(status)) {
    log.working(
      `Found an empty CDKToolkit stack (${status}); removing it (safe — it owns no resources)...`,
    );
    try {
      await deleteStuckBootstrapStack();
      log.ok('Removed the stuck CDKToolkit stack.');
    } catch (err) {
      log.warn(
        `Could not delete the stuck CDKToolkit stack automatically: ${err?.message ?? err}`,
      );
    }
  }

  // 2. If the account already has a usable bootstrap, skip bootstrap entirely.
  const version = await getBootstrapVersion();
  if (version !== null && version >= MIN_BOOTSTRAP_VERSION) {
    log.ok(
      `Account already CDK-bootstrapped (version ${version}); skipping bootstrap.`,
    );
    return;
  }

  // 3. Otherwise, bootstrap normally.
  log.working('Running cdk bootstrap...');
  await run('npx', ['cdk', 'bootstrap', `aws://${accountId}/${region}`], {
    cwd: infraDir,
  });
  log.ok('Bootstrap complete.');
}
