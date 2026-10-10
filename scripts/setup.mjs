#!/usr/bin/env node
// kiro-essentials — Cross-platform first-time workshop setup.
//
// The single, official way to go from a fresh clone to a running workshop
// environment. Runs native on Windows (PowerShell / Command Prompt), macOS and
// Linux with NO Bash, Git Bash or WSL required.
//
//   npm install
//   npm run setup
//
// What it does on a successful run:
//   1. Ensure a .env exists (created from .env.example on a fresh clone) and
//      load the AWS workshop credentials from it (incl. AWS_SESSION_TOKEN for
//      temporary sandbox credentials).
//   2. Validate the credentials with STS and resolve the AWS account + region.
//   3. Install dependencies if node_modules is missing.
//   4. Bootstrap the environment for CDK (idempotent) and deploy the stacks
//      (FrontendHosting -> Auth -> ApiGateway).
//   5. Resolve the CloudFormation outputs and write them back into .env as the
//      VITE_* frontend config, PRESERVING the AWS workshop credentials.
//   6. Create/reset a confirmed Cognito test user for immediate login.
//   7. Publish the built frontend to S3 + CloudFront.
//   8. Print a clear summary (local + production URLs, test credentials).
//   9. Optionally start the Vite dev server as the foreground process.
//
// Cross-platform options (preferred — work identically in every shell):
//   npm run setup -- --skip-deploy            Reuse deployed stacks; only
//                                             (re)write .env + test user. Also
//                                             skips frontend publication.
//   npm run setup -- --skip-frontend-deploy   Deploy infra but don't publish
//                                             the frontend to S3/CloudFront.
//   npm run setup -- --skip-dev-server        Finish without starting Vite.
//   npm run setup -- --skip-test-user         Don't create/update the test user.
//   npm run setup -- --test-user-email=<e>    Override the test user email.
//   npm run setup -- --test-user-password=<p> Override the test user password.
//
// Legacy environment-variable equivalents remain supported for backward
// compatibility: SKIP_DEPLOY, SKIP_FRONTEND_DEPLOY, SKIP_DEV_SERVER,
// SKIP_TEST_USER, TEST_USER_EMAIL, TEST_USER_PASSWORD.
//
// Secrets (AWS keys/tokens, Cognito tokens) are never logged.

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, resolveSkip, resolveString } from './lib/args.mjs';
import {
  envFileExists,
  loadAwsCredentials,
  loadExternalCognito,
  hasAwsCredentials,
  sessionToken,
} from './lib/env.mjs';
import { writeLocalEnv } from './lib/env.mjs';
import { validateIdentity } from './lib/identity.mjs';
import { run, runDevServer } from './lib/exec.mjs';
import { infraDir, repoRoot } from './lib/paths.mjs';
import { deployOrder, externalCognito, resolveFrontendConfig } from './lib/stacks.mjs';
import { ensureBootstrapped } from './lib/bootstrap.mjs';
import { provisionTestUser } from './lib/test-user.mjs';
import { buildFrontend, publishToS3 } from './lib/frontend-publish.mjs';
import { viteEnvFromConfig } from './lib/stacks.mjs';
import * as log from './lib/console.mjs';

const LOCAL_ORIGIN = 'http://localhost:5173';
const DEFAULT_TEST_EMAIL = 'testuser@example.com';
const DEFAULT_TEST_PASSWORD = 'TestPassw0rd!';

async function main() {
  const { flags } = parseArgs();

  const options = {
    skipDeploy: resolveSkip(flags, 'skipDeploy', 'SKIP_DEPLOY'),
    skipFrontendDeploy: resolveSkip(
      flags,
      'skipFrontendDeploy',
      'SKIP_FRONTEND_DEPLOY',
    ),
    skipDevServer: resolveSkip(flags, 'skipDevServer', 'SKIP_DEV_SERVER'),
    skipTestUser: resolveSkip(flags, 'skipTestUser', 'SKIP_TEST_USER'),
    testUserEmail: resolveString(
      flags,
      'testUserEmail',
      'TEST_USER_EMAIL',
      DEFAULT_TEST_EMAIL,
    ),
    testUserPassword: resolveString(
      flags,
      'testUserPassword',
      'TEST_USER_PASSWORD',
      DEFAULT_TEST_PASSWORD,
    ),
  };

  // ─── 1. Require that `npm run init` has prepared the workspace ──────────────
  // Dependency install and .env creation live in `npm run init` (run once after
  // cloning). setup starts from the credentials the participant already filled
  // in, so it never needs to be run twice.
  if (!envFileExists()) {
    log.fail('No .env found at the repo root.', [
      'Run the one-time initialization first:',
      '  npm run init',
      'Then fill in the AWS Access Keys section in .env and run: npm run setup',
    ]);
  }
  if (!fs.existsSync(path.join(repoRoot, 'node_modules'))) {
    log.fail('Dependencies are not installed.', [
      'Run the one-time initialization first:',
      '  npm run init',
      'Then run: npm run setup',
    ]);
  }

  // ─── 2. Load + validate AWS credentials ─────────────────────────────────────
  loadAwsCredentials();
  // Load an external Cognito pool from .env (VITE_COGNITO_* or COGNITO_*) into
  // process.env so `npx cdk` and the deploy scripts reuse it instead of
  // creating a new one. No-op in the original self-contained flow.
  const usingExternalPool = loadExternalCognito();
  if (!hasAwsCredentials()) {
    log.fail('AWS workshop credentials are not set in .env.', [
      'Open .env and fill in AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY',
      '(and AWS_SESSION_TOKEN if your sandbox uses temporary credentials),',
      'then run: npm run setup',
      'If you have not initialized yet, run: npm run init',
    ]);
  }

  log.step('🔐 Validating AWS credentials...');
  let identity;
  try {
    identity = await validateIdentity();
  } catch (err) {
    log.fail(err.message, [
      'Double-check the AWS Access Keys section in .env.',
      'Temporary sandbox credentials expire — paste fresh keys and re-run.',
    ]);
  }
  // Point CDK at the resolved sandbox account/region.
  process.env.CDK_DEFAULT_ACCOUNT = identity.accountId;
  process.env.CDK_DEFAULT_REGION = identity.region;
  log.ok(`Authenticated to account ${identity.accountId} in ${identity.region}.`);

  // ─── 3. Bootstrap + deploy infrastructure ───────────────────────────────────
  if (options.skipDeploy) {
    log.skipped('--skip-deploy — skipping CDK bootstrap and deploy.');
  } else {
    log.step('🧰 Ensuring the environment is CDK-bootstrapped...');
    // Workshop/sandbox accounts are often pre-bootstrapped. ensureBootstrapped
    // clears a stuck/empty CDKToolkit stack and skips bootstrap when the account
    // already reports a usable version, avoiding the AutomaticImportNeedsRetain
    // failure that `cdk bootstrap` throws on pre-existing resources.
    await ensureBootstrapped({
      accountId: identity.accountId,
      region: identity.region,
      infraDir,
    });

    if (usingExternalPool) {
      log.ok(
        `Reusing external Cognito pool ${process.env.COGNITO_USER_POOL_ID} — not deploying AuthStack.`,
      );
    }

    log.step('🚀 Deploying AWS stacks (this can take several minutes)...');
    for (const stack of deployOrder()) {
      log.working(`Deploying ${stack}...`);
      await run(
        'npx',
        ['cdk', 'deploy', stack, '--require-approval', 'never'],
        { cwd: infraDir },
      );
      log.ok(`${stack} done.`);
    }
  }

  // ─── 5. Resolve outputs + write local .env (preserving AWS creds) ───────────
  log.step('📡 Resolving CloudFormation outputs...');
  let config;
  try {
    config = await resolveFrontendConfig();
  } catch (err) {
    log.fail(err.message, [
      options.skipDeploy
        ? 'With --skip-deploy the stacks must already be deployed. Run without it first.'
        : 'The deploy step above may not have completed. Check the output above.',
    ]);
  }
  log.ok(`User Pool:      ${config.userPoolId}`);
  log.ok(`Client ID:      ${config.clientId}`);
  log.ok(`Cognito Domain: ${config.cognitoDomain}`);
  log.ok(`API URL:        ${config.apiUrl || '(none)'}`);

  log.step('📝 Writing .env for local development...');
  writeLocalEnv({
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: sessionToken(),
      region: identity.region,
    },
    vite: {
      userPoolId: config.userPoolId,
      clientId: config.clientId,
      cognitoDomain: config.cognitoDomain,
      // LOCAL development uses localhost redirect/logout URIs.
      redirectUri: `${LOCAL_ORIGIN}/callback`,
      logoutUri: `${LOCAL_ORIGIN}/login`,
      apiUrl: config.apiUrl,
    },
  });
  log.ok('.env written (AWS credentials preserved).');

  // ─── 6. Provision the Cognito test user ─────────────────────────────────────
  if (options.skipTestUser) {
    log.skipped('--skip-test-user — not creating/updating the test user.');
  } else {
    await provisionTestUser({
      userPoolId: config.userPoolId,
      email: options.testUserEmail,
      password: options.testUserPassword,
    });
  }

  // ─── 7. Publish the frontend to S3 + CloudFront ─────────────────────────────
  // Skipped automatically with --skip-deploy (nothing freshly deployed) or
  // explicitly with --skip-frontend-deploy.
  let productionUrl = '';
  if (options.skipDeploy) {
    log.skipped('--skip-deploy — skipping frontend publication.');
  } else if (options.skipFrontendDeploy) {
    log.skipped('--skip-frontend-deploy — skipping frontend publication.');
  } else {
    await buildFrontend(viteEnvFromConfig(config));
    await publishToS3({
      bucketName: config.bucketName,
      distributionId: config.distributionId,
    });
    productionUrl = `https://${config.distributionDomain}`;
  }

  // ─── 8. Summary (printed BEFORE the dev server takes over the terminal) ─────
  log.blank();
  log.step('🎉 Workshop setup complete!');
  log.blank();
  console.log(`   Local app:   ${LOCAL_ORIGIN}`);
  if (productionUrl) {
    console.log(`   Production:  ${productionUrl}`);
  }
  if (!options.skipTestUser) {
    log.blank();
    console.log('   Test credentials:');
    console.log(`     email:    ${options.testUserEmail}`);
    console.log(`     password: ${options.testUserPassword}`);
  }
  log.blank();

  // ─── 9. Start the dev server (foreground) unless skipped ────────────────────
  if (options.skipDevServer) {
    log.skipped('--skip-dev-server — not starting the dev server.');
    console.log('   Start it yourself with: npm run dev:web');
    log.blank();
    return;
  }

  log.step('🚀 Starting the local dev server (Ctrl+C to stop)...');
  console.log(`   Opening on ${LOCAL_ORIGIN}`);
  log.blank();
  await runDevServer();
}

main().catch((err) => {
  log.fail(err.message || String(err), [
    'See the output above for details.',
  ]);
});
