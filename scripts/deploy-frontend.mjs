#!/usr/bin/env node
// kiro-essentials — Cross-platform frontend deployment script.
//
// Node.js replacement for scripts/deploy-frontend.sh. Builds the React SPA with
// production values resolved from CloudFormation outputs, publishes to the
// private S3 bucket using the AWS SDK v3 (no AWS CLI, no `s3 sync`, no Unix
// tools), and invalidates CloudFront. Runs native on Windows, macOS and Linux.
//
// Usage:
//   npm run deploy:frontend
//   node scripts/deploy-frontend.mjs
//
// This script does NOT run `cdk deploy` or modify infrastructure. The stacks
// must already be deployed; stack names are overridable via FRONTEND_STACK /
// AUTH_STACK / API_STACK environment variables.

import { pathToFileURL } from 'node:url';
import { loadAwsCredentials } from './lib/env.mjs';
import { resolveFrontendConfig, viteEnvFromConfig } from './lib/stacks.mjs';
import { buildFrontend, publishToS3 } from './lib/frontend-publish.mjs';
import * as log from './lib/console.mjs';

export async function deployFrontend() {
  log.step('📡 Resolving CloudFormation outputs...');
  const config = await resolveFrontendConfig();

  log.ok(`Bucket:         ${config.bucketName}`);
  log.ok(`Distribution:   ${config.distributionId}`);
  log.ok(`Domain:         ${config.distributionDomain}`);
  log.ok(`API URL:        ${config.apiUrl}`);
  log.ok(`User Pool:      ${config.userPoolId}`);
  log.ok(`Client ID:      ${config.clientId}`);
  log.ok(`Cognito Domain: ${config.cognitoDomain}`);
  log.ok(`Redirect URI:   ${config.redirectUri}`);
  log.ok(`Logout URI:     ${config.logoutUri}`);

  // Build with production VITE_* values injected via the child env (not disk).
  await buildFrontend(viteEnvFromConfig(config));

  // Publish to S3 with differential caching + remove stale objects, then
  // invalidate CloudFront.
  await publishToS3({
    bucketName: config.bucketName,
    distributionId: config.distributionId,
  });

  log.blank();
  log.step('🎉 Frontend deployed successfully!');
  log.blank();
  console.log(`   Production URL: https://${config.distributionDomain}`);
  log.blank();

  return config;
}

// Only run automatically when invoked directly (not when imported by setup.mjs).
// pathToFileURL handles Windows drive letters/backslashes correctly.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  loadAwsCredentials();
  deployFrontend().catch((err) => {
    log.fail(err.message || String(err), [
      'Ensure the infrastructure stacks are deployed (npm run deploy).',
      'Check that your AWS credentials in .env are valid.',
    ]);
  });
}
