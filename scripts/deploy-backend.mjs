#!/usr/bin/env node
// kiro-essentials — Manual backend deploy for restricted sandbox accounts.
//
// Deploys the /hello API (Lambda + HTTP API + Cognito JWT authorizer) using
// DIRECT AWS SDK calls instead of CDK/CloudFormation. This is the path for
// workshop sandbox accounts whose participant role cannot use CDK (no
// iam:CreateRole, blocked bootstrap roles / KMS). See scripts/lib/backend-manual.mjs.
//
// It validates credentials, reuses the external Cognito pool from .env, deploys
// the backend idempotently, writes VITE_API_URL back into .env, and prints how
// to verify the endpoint.
//
//   npm run deploy:backend
//
// Env knobs:
//   LAMBDA_EXEC_ROLE_ARN   Reuse a specific existing Lambda execution role.

import {
  loadAwsCredentials,
  loadExternalCognito,
  hasAwsCredentials,
  upsertEnvVar,
} from './lib/env.mjs';
import { validateIdentity } from './lib/identity.mjs';
import { deployHelloBackend } from './lib/backend-manual.mjs';
import * as log from './lib/console.mjs';

async function main() {
  loadAwsCredentials();
  const external = loadExternalCognito();

  if (!hasAwsCredentials()) {
    log.fail('AWS credentials are not set in .env.', [
      'Fill in AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY (and AWS_SESSION_TOKEN',
      'if temporary) in .env, then run: npm run deploy:backend',
    ]);
  }
  if (!external) {
    log.fail('No external Cognito pool configured in .env.', [
      'Set VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID in .env so the',
      'API authorizer knows which pool to trust, then re-run.',
    ]);
  }

  log.step('🔐 Validating AWS credentials...');
  let identity;
  try {
    identity = await validateIdentity();
  } catch (err) {
    log.fail(err.message, ['Double-check the AWS keys in .env (temporary ones expire).']);
  }
  log.ok(`Authenticated to account ${identity.accountId} in ${identity.region}.`);
  log.info(
    `JWT authorizer will trust pool ${process.env.COGNITO_USER_POOL_ID} / client ${process.env.COGNITO_CLIENT_ID}.`,
  );

  let result;
  try {
    result = await deployHelloBackend({ accountId: identity.accountId });
  } catch (err) {
    log.fail(err.message || String(err), [
      'The backend deploy did not complete. See the error above.',
    ]);
  }

  log.step('📝 Writing VITE_API_URL into .env...');
  upsertEnvVar('VITE_API_URL', result.apiUrl);
  log.ok(`VITE_API_URL=${result.apiUrl}`);

  log.blank();
  log.step('🎉 Backend deployed.');
  log.blank();
  console.log(`   API base URL: ${result.apiUrl}`);
  console.log(`   Protected route: GET ${result.apiUrl}/hello`);
  log.blank();
  console.log('   Verify (needs a valid Cognito access token):');
  console.log(`     curl -H "Authorization: Bearer <token>" ${result.apiUrl}/hello`);
  console.log('   A request WITHOUT a token should return 401.');
  log.blank();
  console.log('   Restart the web dev server so it picks up VITE_API_URL:');
  console.log('     npm run dev:web');
  log.blank();
}

main().catch((err) => {
  log.fail(err.message || String(err), ['See the output above for details.']);
});
