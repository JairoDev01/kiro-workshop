# Kiro Essentials — Technology Steering

_Last updated: 2026-10-08_

Read `_invariants.md` first.

## Current core technologies

- React SPA
- TypeScript
- Vite
- AWS Cognito Managed Login v2
- OAuth 2.0 Authorization Code + PKCE
- API Gateway HTTP API
- JWT Authorizer
- AWS Lambda
- Amazon S3
- Amazon CloudFront
- CloudFront Origin Access Control (OAC)
- AWS CDK
- OpenAPI
- Vitest

Use the repository's existing framework and library versions.

## Dependency rule

Before adding a dependency:

1. inspect current dependencies;
2. inspect existing utilities/components;
3. reuse what already solves the requirement;
4. add a dependency only when the workshop feature genuinely needs it.

## Frontend configuration

Environment-specific public values must use the existing configuration mechanism.

Do not hardcode deployed API URLs, CloudFront hostnames, Cognito identifiers/domains, AWS account IDs, or regions in application source.

Never ship secrets or AWS credentials to browser code.

## AWS scope

Preserve current CDK/resource patterns.

Do not add platform services unless the approved workshop feature requires them.
