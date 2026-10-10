// Centralized AWS SDK v3 client construction for the workshop scripts.
//
// Clients are created lazily and cached so each process builds only the ones it
// needs (minimal SDK footprint). Credentials come from the standard SDK default
// provider chain, which reads the AWS_* environment variables that env.mjs
// loads from .env — including AWS_SESSION_TOKEN for temporary sandbox creds.
// We never pass secrets explicitly or log them.

import { STSClient } from '@aws-sdk/client-sts';
import { CloudFormationClient } from '@aws-sdk/client-cloudformation';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { S3Client } from '@aws-sdk/client-s3';
import { CloudFrontClient } from '@aws-sdk/client-cloudfront';
import { SSMClient } from '@aws-sdk/client-ssm';
import { LambdaClient } from '@aws-sdk/client-lambda';
import { ApiGatewayV2Client } from '@aws-sdk/client-apigatewayv2';
import { IAMClient } from '@aws-sdk/client-iam';

/** Resolve the active region from the environment, defaulting to us-east-1. */
export function resolveRegion() {
  return process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';
}

const cache = new Map();

function cached(key, factory) {
  if (!cache.has(key)) cache.set(key, factory());
  return cache.get(key);
}

export function stsClient() {
  return cached('sts', () => new STSClient({ region: resolveRegion() }));
}

export function cloudFormationClient() {
  return cached('cfn', () => new CloudFormationClient({ region: resolveRegion() }));
}

export function ssmClient() {
  return cached('ssm', () => new SSMClient({ region: resolveRegion() }));
}

export function lambdaClient() {
  return cached('lambda', () => new LambdaClient({ region: resolveRegion() }));
}

export function apiGatewayV2Client() {
  return cached('apigwv2', () => new ApiGatewayV2Client({ region: resolveRegion() }));
}

export function iamClient() {
  // IAM is a global service; the client still needs a region for signing.
  return cached('iam', () => new IAMClient({ region: resolveRegion() }));
}

export function cognitoClient() {
  return cached(
    'cognito',
    () => new CognitoIdentityProviderClient({ region: resolveRegion() }),
  );
}

export function s3Client() {
  return cached('s3', () => new S3Client({ region: resolveRegion() }));
}

export function cloudFrontClient() {
  // CloudFront is a global service; the client still needs a region for signing.
  return cached('cloudfront', () => new CloudFrontClient({ region: resolveRegion() }));
}
