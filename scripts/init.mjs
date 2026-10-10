#!/usr/bin/env node
// kiro-essentials — Cross-platform workshop initialization.
//
// Run ONCE after cloning the repo. It prepares everything that does not need
// AWS credentials so that `npm run setup` can run straight through afterwards:
//
//   1. Install dependencies (npm install) if they are missing.
//   2. Create .env from .env.example on a fresh clone (or leave an existing one
//      untouched).
//   3. Explain that the AWS workshop credentials must be filled into .env.
//
// Runs native on Windows (PowerShell / Command Prompt), macOS and Linux with no
// Bash required.
//
//   npm install   (optional — `npm run init` runs it for you)
//   npm run init
//   # fill in the AWS Access Keys section in .env
//   npm run setup
//
// Secrets are never logged.

import fs from 'node:fs';
import path from 'node:path';
import { ensureEnvFile, hasAwsCredentials, loadAwsCredentials } from './lib/env.mjs';
import { run } from './lib/exec.mjs';
import { repoRoot } from './lib/paths.mjs';
import * as log from './lib/console.mjs';

function printCredentialInstructions() {
  log.heading('Next step: add your AWS workshop credentials');
  console.log(
    '   Open .env and fill in the AWS Access Keys section with the credentials',
  );
  console.log('   provided for your workshop sandbox account:');
  console.log('     • AWS_ACCESS_KEY_ID');
  console.log('     • AWS_SECRET_ACCESS_KEY');
  console.log('     • AWS_SESSION_TOKEN   (only if your sandbox is temporary)');
  console.log('     • AWS_REGION          (e.g. us-east-1)');
  log.blank();
  console.log('   Then run the full setup:');
  console.log('     npm run setup');
  log.blank();
}

async function main() {
  // ─── 1. Install dependencies if needed ──────────────────────────────────────
  if (!fs.existsSync(path.join(repoRoot, 'node_modules'))) {
    log.step('📦 Installing dependencies...');
    await run('npm', ['install'], { cwd: repoRoot });
    log.ok('Dependencies installed.');
  } else {
    log.ok('Dependencies already installed.');
  }

  // ─── 2. Create .env from .env.example (or keep an existing one) ─────────────
  const created = ensureEnvFile();
  log.blank();
  if (created) {
    log.step('📄 Created .env from .env.example.');
    log.blank();
    printCredentialInstructions();
    return;
  }

  log.step('📄 .env already exists — leaving it untouched.');
  log.blank();

  // If a .env is already present, give targeted guidance: either the creds are
  // in place (ready for setup) or they still need to be filled in.
  loadAwsCredentials();
  if (hasAwsCredentials()) {
    log.ok('AWS credentials detected in .env.');
    log.blank();
    console.log('   You are ready to run the full setup:');
    console.log('     npm run setup');
    log.blank();
  } else {
    printCredentialInstructions();
  }
}

main().catch((err) => {
  log.fail(err.message || String(err), ['See the output above for details.']);
});
