#!/usr/bin/env node
// kiro-essentials — Cross-platform CDK deploy script.
//
// Node.js replacement for scripts/deploy.sh. Runs native on Windows, macOS and
// Linux with no Bash. CDK is invoked through `npx cdk` from the infra/
// workspace, so a globally installed CDK CLI is NOT required.
//
// Usage (via npm, which forwards args after `--`):
//   npm run deploy                 Deploy all stacks in dependency order.
//   npm run deploy -- --diff       Show the diff only, do not deploy.
//   npm run deploy -- AuthStack    Deploy a single stack by name.
//   npm run deploy -- --diff AuthStack   Diff a single stack.
//   npm run deploy -- --help       Show usage.
//
// Direct invocation also works:  node scripts/deploy.mjs [--diff] [STACK]
//
// Behavior preserved from deploy.sh:
//   - synth before deploy;
//   - diff-only mode;
//   - deploy all workshop stacks in dependency order;
//   - deploy a single named stack;
//   - --require-approval never for the unattended workshop environment.

import { parseArgs } from './lib/args.mjs';
import { run } from './lib/exec.mjs';
import { infraDir } from './lib/paths.mjs';
import { DEPLOY_ORDER } from './lib/stacks.mjs';
import { loadAwsCredentials } from './lib/env.mjs';
import * as log from './lib/console.mjs';

function printHelp() {
  log.blank();
  log.heading('Usage: npm run deploy -- [OPTIONS] [STACK_NAME]');
  log.blank();
  console.log('Options:');
  console.log('  --diff    Show diff only, do not deploy');
  console.log('  --help    Show this help message');
  log.blank();
  console.log('Available stacks (in deploy order):');
  for (const stack of DEPLOY_ORDER) console.log(`  ${stack}`);
  log.blank();
}

async function main() {
  const { flags, positionals } = parseArgs();

  if (flags.help || flags.h) {
    printHelp();
    return;
  }

  // Load AWS credentials from .env so CDK can authenticate without the user
  // having to export them in every shell. Explicit shell exports still win.
  loadAwsCredentials();

  const diffOnly = Boolean(flags.diff);
  const targetStack = positionals[0];

  // ─── Synth ───────────────────────────────────────────────────────────────
  log.step('🔨 Synthesizing CDK...');
  await run('npx', ['cdk', 'synth', '--quiet'], { cwd: infraDir });

  // ─── Diff-only mode ────────────────────────────────────────────────────────
  if (diffOnly) {
    if (targetStack) {
      log.step(`📋 Diff for ${targetStack}:`);
      await runAllowFailure('npx', ['cdk', 'diff', targetStack]);
    } else {
      log.step('📋 Diff for all stacks:');
      await runAllowFailure('npx', ['cdk', 'diff']);
    }
    return;
  }

  // ─── Deploy ─────────────────────────────────────────────────────────────────
  if (targetStack) {
    log.step(`🚀 Deploying ${targetStack}...`);
    await run('npx', ['cdk', 'deploy', targetStack, '--require-approval', 'never'], {
      cwd: infraDir,
    });
    log.ok(`${targetStack} deployed.`);
    return;
  }

  log.step('🚀 Deploying all stacks in dependency order...');
  for (const stack of DEPLOY_ORDER) {
    log.blank();
    log.working(`Deploying ${stack}...`);
    await run('npx', ['cdk', 'deploy', stack, '--require-approval', 'never'], {
      cwd: infraDir,
    });
    log.ok(`${stack} done.`);
  }
  log.blank();
  log.step('🎉 All stacks deployed successfully.');
}

// `cdk diff` exits non-zero when a diff is present; the old script tolerated
// that with `|| true`. Mirror that so diff mode never looks like a failure.
async function runAllowFailure(command, args) {
  try {
    await run(command, args, { cwd: infraDir });
  } catch {
    // Non-zero exit from `cdk diff` just means there is a diff.
  }
}

main().catch((err) => {
  log.fail(err.message || String(err), [
    'Check the CDK output above for the underlying cause.',
    'Ensure your AWS credentials in .env are valid and the account is bootstrapped.',
  ]);
});
