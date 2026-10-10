# Kiro Essentials — Invariants

_Last updated: 2026-10-08_

This file contains the small set of cross-cutting rules every steering file may rely on.

## Current scope

- The repository is a workshop starter, not a finished business product.
- Current implemented scope is authentication plus a protected API example.
- Do not infer or recreate removed DUIT appointment-domain behavior.
- New business behavior must be introduced only through an approved workshop spec.

## Architecture invariants

Preserve the existing AWS serverless baseline:

```txt
Browser
→ CloudFront
→ private S3
→ React SPA
→ Cognito Managed Login v2
→ API Gateway HTTP API + JWT Authorizer
→ Lambda
```

Infrastructure remains AWS CDK.

## Authentication and security invariants

- Cognito is the authentication source of truth.
- Preserve Authorization Code Flow with PKCE.
- Cognito Managed Login v2 owns login, signup, password recovery, and interactive logout/login.
- Do not create custom password-handling APIs or SPA password forms unless a future approved spec explicitly replaces this boundary.
- Do not ship Cognito App Client secrets or AWS credentials to browser code.
- Protected API routes use Cognito access tokens validated by API Gateway JWT Authorizer.
- Backend identity must come from validated JWT claims, never trusted client-supplied ownership identifiers.

## API invariants

- OpenAPI is the contract source of truth for application APIs.
- Any implemented business endpoint must be reflected in OpenAPI in the same change.
- Keep API changes intentionally small and workshop-focused.

## Frontend hosting invariants

- Production workshop hosting uses CloudFront over HTTPS with a private S3 origin through OAC.
- Keep S3 Block Public Access enabled.
- Preserve SPA direct-navigation fallback behavior.
- Environment-specific public values are configuration, not hardcoded application source.

## Scope discipline

Do not introduce without an approved workshop requirement:

- additional databases;
- microservices;
- queues or workflow engines;
- custom domains, Route 53, ACM, WAF, Amplify Hosting, SSR, or CI/CD infrastructure;
- broad refactors unrelated to the exercise being built.
