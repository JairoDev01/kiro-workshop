# Kiro Essentials — Authentication and Security Steering

_Last updated: 2026-10-08_

Read `_invariants.md` first.

## Authentication boundary

Cognito Managed Login v2 is the accepted interactive authentication surface.

Rules:

- preserve the existing User Pool and SPA App Client unless an approved spec explicitly changes them;
- preserve Authorization Code Flow with PKCE;
- Cognito owns password entry, signup, password recovery, and interactive login/logout;
- do not add custom `/auth/login`, `/auth/logout`, `/auth/refresh`, or `/auth/validate-token` endpoints;
- never ship an App Client secret to browser code;
- keep callback/logout URLs aligned with local and deployed frontend URLs.

## API authorization

- Protected routes use API Gateway JWT Authorizer.
- Lambda trusts validated JWT claims, not client-supplied identity fields.
- Frontend visibility is UX, not authorization.

## Sensitive data and logging

Do not log:

- passwords;
- tokens;
- full `Authorization` headers;
- AWS credentials or secrets.

Do not commit secrets or environment-specific credentials to source control.
