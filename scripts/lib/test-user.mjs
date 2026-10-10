// Cognito test-user provisioning via the AWS SDK v3, replacing the Bash
// `aws cognito-idp admin-*` calls.
//
// Creates (or resets) a confirmed test user with a permanent password so a
// participant can log in immediately — no FORCE_CHANGE_PASSWORD step. The
// password is treated as a credential: it is set via the API and printed only
// in the final summary that the participant explicitly needs, never logged by
// this module. Cognito tokens are never requested or logged here.

import {
  AdminGetUserCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from './aws-clients.mjs';
import * as log from './console.mjs';

/**
 * Ensure a confirmed Cognito test user exists with the given permanent password.
 *
 * @param {object} params
 * @param {string} params.userPoolId
 * @param {string} params.email
 * @param {string} params.password
 */
export async function provisionTestUser({ userPoolId, email, password }) {
  const cognito = cognitoClient();

  log.step(`👤 Provisioning Cognito test user (${email})...`);

  let exists = false;
  try {
    await cognito.send(
      new AdminGetUserCommand({ UserPoolId: userPoolId, Username: email }),
    );
    exists = true;
  } catch (err) {
    if (err?.name !== 'UserNotFoundException') {
      throw new Error(`Failed to look up the test user: ${err?.message ?? err}`);
    }
  }

  if (exists) {
    log.info('User already exists — resetting password.');
  } else {
    await cognito.send(
      new AdminCreateUserCommand({
        UserPoolId: userPoolId,
        Username: email,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'email_verified', Value: 'true' },
        ],
        MessageAction: 'SUPPRESS',
      }),
    );
    log.info('User created.');
  }

  // Permanent password → user can log in immediately (no forced change).
  await cognito.send(
    new AdminSetUserPasswordCommand({
      UserPoolId: userPoolId,
      Username: email,
      Password: password,
      Permanent: true,
    }),
  );

  log.ok('Test user ready.');
}
