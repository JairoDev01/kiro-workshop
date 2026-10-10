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

/** Deploy order: FrontendHosting -> Auth -> ApiGateway. */
export const DEPLOY_ORDER = [
  'FrontendHostingStack',
  'AuthStack',
  'ApiGatewayAuthorizerStack',
];

/**
 * Resolve every CloudFormation output needed to publish the frontend and
 * derive the production VITE_* configuration from them.
 *
 * Returns both the raw outputs and the derived production redirect/logout URIs
 * (built from the CloudFront domain, matching the old deploy-frontend.sh).
 */
export async function resolveFrontendConfig() {
  const bucketName = await getOutput(STACK_NAMES.frontend, 'FrontendBucketName');
  const distributionId = await getOutput(STACK_NAMES.frontend, 'DistributionId');
  const distributionDomain = await getOutput(
    STACK_NAMES.frontend,
    'DistributionDomainName',
  );
  const apiUrl = await getOutput(STACK_NAMES.api, 'ApiUrl');
  const userPoolId = await getOutput(STACK_NAMES.auth, 'UserPoolId');
  const clientId = await getOutput(STACK_NAMES.auth, 'UserPoolClientId');
  const cognitoDomain = await getOutput(STACK_NAMES.auth, 'CognitoDomain');

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
