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

// Auth stack — Cognito User Pool + Managed Login (login/signup) configuration
const authStack = new AuthStack(app, 'AuthStack', {
  callbackUrls: ['http://localhost:5173/callback'],
  logoutUrls: ['http://localhost:5173/login'],
  allowedOrigins: ['http://localhost:5173'],
  domainPrefix,
  frontendDomain: frontendHostingStack.distributionDomainName,
  env: defaultEnv,
});

// API Gateway — Cognito JWT authorizer protecting the demo /hello route
const apiGatewayStack = new ApiGatewayStack(app, 'ApiGatewayAuthorizerStack', {
  userPoolId: authStack.userPool.userPoolId,
  userPoolClientId: authStack.userPoolClient.userPoolClientId,
  allowedOrigins: authStack.allowedOrigins,
  env: defaultEnv,
});

// Explicit dependency ordering: FrontendHosting -> Auth -> ApiGateway
authStack.addDependency(frontendHostingStack);
apiGatewayStack.addDependency(authStack);
