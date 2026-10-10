// Shared stack names and the resolved frontend configuration, used by both
// setup.mjs and deploy-frontend.mjs so they can never drift apart.
//
// Stack names are overridable via environment variables for flexibility, but
// default to the current workshop stacks. The deploy ORDER matches the
// addDependency() calls in infra/bin/app.ts.

import { getOutput } from './cfn-outputs.mjs';

export const STACK_NAMES = {
  frontend: process.env.FRONTEND_STACK || 'FrontendHostingStack',
  auth: process.env.AUTH_STACK || 'AuthStack',
  api: process.env.API_STACK || 'ApiGatewayAuthorizerStack',
};

/**
 * External Cognito User Pool mode: when COGNITO_USER_POOL_ID is set we reuse an
 * existing pool instead of deploying AuthStack. This mirrors the logic in
 * infra/bin/app.ts so the deploy order and the resolved config stay in sync.
 */
export function externalCognito() {
  const userPoolId = process.env.COGNITO_USER_POOL_ID?.trim();
  const clientId = process.env.COGNITO_CLIENT_ID?.trim();
  const domain = process.env.COGNITO_DOMAIN?.trim();
  if (!userPoolId) return null;
  if (!clientId) {
    throw new Error(
      'COGNITO_USER_POOL_ID is set but COGNITO_CLIENT_ID is missing. ' +
        'Provide both (and COGNITO_DOMAIN) to use an external Cognito User Pool.',
    );
  }
  // Derive the Hosted UI domain from the region/prefix if not given explicitly.
  const region = userPoolId.split('_')[0];
  const resolvedDomain =
    domain ||
    (process.env.COGNITO_DOMAIN_PREFIX
      ? `${process.env.COGNITO_DOMAIN_PREFIX}.auth.${region}.amazoncognito.com`
      : undefined);
  if (!resolvedDomain) {
    throw new Error(
      'Using an external Cognito pool requires COGNITO_DOMAIN (the full Hosted UI ' +
        'domain, e.g. my-prefix.auth.us-east-1.amazoncognito.com).',
    );
  }
  return { userPoolId, clientId, domain: resolvedDomain };
}

/**
 * Deploy order. With an external Cognito pool AuthStack is skipped:
 *   FrontendHosting -> ApiGateway
 * Otherwise the full set is deployed:
 *   FrontendHosting -> Auth -> ApiGateway
 */
export function deployOrder() {
  return externalCognito()
    ? ['FrontendHostingStack', 'ApiGatewayAuthorizerStack']
    : ['FrontendHostingStack', 'AuthStack', 'ApiGatewayAuthorizerStack'];
}

/**
 * Resolve every CloudFormation output needed to publish the frontend and
 * derive the production VITE_* configuration from them.
 *
 * Returns both the raw outputs and the derived production redirect/logout URIs
 * (built from the CloudFront domain, matching the old deploy-frontend.sh).
 *
 * In external-pool mode the Cognito values come from the environment instead of
 * the (non-existent) AuthStack outputs.
 */
export async function resolveFrontendConfig() {
  const bucketName = await getOutput(STACK_NAMES.frontend, 'FrontendBucketName');
  const distributionId = await getOutput(STACK_NAMES.frontend, 'DistributionId');
  const distributionDomain = await getOutput(
    STACK_NAMES.frontend,
    'DistributionDomainName',
  );
  const apiUrl = await getOutput(STACK_NAMES.api, 'ApiUrl');

  const external = externalCognito();
  let userPoolId;
  let clientId;
  let cognitoDomain;
  if (external) {
    userPoolId = external.userPoolId;
    clientId = external.clientId;
    cognitoDomain = external.domain;
  } else {
    userPoolId = await getOutput(STACK_NAMES.auth, 'UserPoolId');
    clientId = await getOutput(STACK_NAMES.auth, 'UserPoolClientId');
    cognitoDomain = await getOutput(STACK_NAMES.auth, 'CognitoDomain');
  }

  const base = `https://${distributionDomain}`;

  return {
    bucketName,
    distributionId,
    distributionDomain,
    apiUrl,
    userPoolId,
    clientId,
    cognitoDomain,
    // Production redirect/logout URIs derived from the CloudFront domain.
    redirectUri: `${base}/callback`,
    logoutUri: `${base}/login`,
  };
}

/**
 * Build the VITE_* environment map used for a production frontend build from a
 * resolved frontend config.
 */
export function viteEnvFromConfig(config) {
  return {
    VITE_API_URL: config.apiUrl,
    VITE_COGNITO_USER_POOL_ID: config.userPoolId,
    VITE_COGNITO_CLIENT_ID: config.clientId,
    VITE_COGNITO_DOMAIN: config.cognitoDomain,
    VITE_REDIRECT_URI: config.redirectUri,
    VITE_LOGOUT_URI: config.logoutUri,
  };
}
