#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { FrontendHostingStack } from '../lib/stacks/frontend-hosting-stack';
import { AuthStack } from '../lib/stacks/auth-stack';
import { ApiGatewayStack } from '../lib/stacks/api-gateway-stack';

const app = new cdk.App();

const defaultEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

// ─── External Cognito User Pool support ──────────────────────────────────────
// When COGNITO_USER_POOL_ID (and COGNITO_CLIENT_ID) are provided, the stack set
// does NOT create a Cognito User Pool. Instead it reuses the existing pool and
// the API's JWT authorizer validates tokens against it. This is used when the
// deploying account cannot create a User Pool (restricted workshop roles) but a
// pre-existing pool is available.
//
// Leave these unset to get the original self-contained behavior (AuthStack
// creates and manages the pool).
const externalUserPoolId = process.env.COGNITO_USER_POOL_ID?.trim() || undefined;
const externalClientId = process.env.COGNITO_CLIENT_ID?.trim() || undefined;
const useExternalPool = Boolean(externalUserPoolId);

if (useExternalPool && !externalClientId) {
  throw new Error(
    'COGNITO_USER_POOL_ID is set but COGNITO_CLIENT_ID is missing. ' +
      'Provide both to use an external Cognito User Pool.',
  );
}

// Frontend hosting — CloudFront + S3 (must be instantiated before AuthStack)
const frontendHostingStack = new FrontendHostingStack(app, 'FrontendHostingStack', {
  env: defaultEnv,
});

// Cognito Hosted UI domain prefix. It must be globally unique within the AWS
// region, so for workshop sandbox accounts we derive a per-account default
// (overridable via COGNITO_DOMAIN_PREFIX) to avoid collisions between
// participants deploying the same repo in the same region.
const domainPrefix =
  process.env.COGNITO_DOMAIN_PREFIX ??
  (defaultEnv.account
    ? `kiro-essentials-${defaultEnv.account}`
    : 'kiro-essentials-dev');

// Auth stack — only created when NOT reusing an external pool.
let authStack: AuthStack | undefined;
if (!useExternalPool) {
  authStack = new AuthStack(app, 'AuthStack', {
    callbackUrls: ['http://localhost:5173/callback'],
    logoutUrls: ['http://localhost:5173/login'],
    allowedOrigins: ['http://localhost:5173'],
    domainPrefix,
    frontendDomain: frontendHostingStack.distributionDomainName,
    env: defaultEnv,
  });
  authStack.addDependency(frontendHostingStack);
}

// Resolve the pool/client the API authorizer must trust and the CORS origins:
// either from the freshly created AuthStack, or from the external pool env vars.
const apiUserPoolId = authStack ? authStack.userPool.userPoolId : externalUserPoolId!;
const apiClientId = authStack
  ? authStack.userPoolClient.userPoolClientId
  : externalClientId!;
const apiAllowedOrigins = authStack
  ? authStack.allowedOrigins
  : ['http://localhost:5173'];

// API Gateway — Cognito JWT authorizer protecting the demo /hello route
const apiGatewayStack = new ApiGatewayStack(app, 'ApiGatewayAuthorizerStack', {
  userPoolId: apiUserPoolId,
  userPoolClientId: apiClientId,
  allowedOrigins: apiAllowedOrigins,
  env: defaultEnv,
});

// Explicit dependency ordering. With an external pool there is no AuthStack, so
// the API only depends on the frontend hosting stack.
if (authStack) {
  apiGatewayStack.addDependency(authStack);
} else {
  apiGatewayStack.addDependency(frontendHostingStack);
}
