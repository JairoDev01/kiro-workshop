# @kiro-essentials/contracts

API contracts for the kiro-essentials platform.

## Strategy

`openapi/openapi.yaml` is the **single source of truth** for the kiro-essentials backend API contract. Both frontend and backend implementations must align with the schemas, paths, and response shapes defined in this file.

This package has no build step — it exists as a documented, version-controlled reference that drives frontend-backend integration.

## Authentication

Authentication is handled entirely by **AWS Cognito Managed Login v2** using the Authorization Code Flow with PKCE. Login, sign-up, password recovery, and logout are Cognito-hosted — there are no backend authentication endpoints.

Protected API routes are validated by the API Gateway JWT Authorizer using the Cognito access token, described by the `BearerAuth` security scheme in the contract.

## Current Endpoints

The current scope is limited to Cognito-based login/signup. There are no business API endpoints defined; `paths` is intentionally empty and only the `BearerAuth` security scheme is published.

## No Tooling Added

This package intentionally does not introduce:

- OpenAPI bundling tools (e.g., Redocly, Swagger CLI)
- Code generation (e.g., openapi-typescript, openapi-generator)
- Validation scripts
- Mock server generation
