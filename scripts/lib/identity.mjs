// AWS identity validation via STS, replacing the Bash
// `aws sts get-caller-identity` prerequisite check.
//
// This confirms the credentials in .env actually work BEFORE any deployment is
// attempted, and resolves the account id + region used to point CDK at the
// sandbox. It never logs secret values — only the (non-secret) account id and
// region are surfaced.

import { GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { stsClient, resolveRegion } from './aws-clients.mjs';

/**
 * Validate credentials and resolve the active AWS account id and region.
 *
 * @returns {Promise<{ accountId: string, region: string }>}
 * @throws {Error} with a friendly message when credentials are invalid/expired.
 */
export async function validateIdentity() {
  const region = resolveRegion();
  try {
    const response = await stsClient().send(new GetCallerIdentityCommand({}));
    const accountId = response.Account;
    if (!accountId) {
      throw new Error('STS did not return an account id.');
    }
    return { accountId, region };
  } catch (err) {
    const name = err?.name ?? '';
    if (
      /ExpiredToken|InvalidClientTokenId|SignatureDoesNotMatch|UnrecognizedClient|AccessDenied/i.test(
        name,
      ) ||
      /security token.*expired/i.test(err?.message ?? '')
    ) {
      throw new Error(
        'AWS credentials are invalid or expired. Re-check the AWS access keys in .env ' +
          '(and the session token if your sandbox uses temporary credentials).',
      );
    }
    throw new Error(`Failed to validate AWS credentials: ${err?.message ?? err}`);
  }
}
