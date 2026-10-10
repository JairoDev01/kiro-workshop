# ADR-0002: Use API Gateway JWT Authorizer

## Status

Accepted

## Context

Protected backend endpoints need token validation to ensure only authenticated users can access them. Options include a custom Lambda authorizer or the built-in API Gateway JWT authorizer.

## Decision

Use the native API Gateway HTTP API JWT Authorizer to validate Cognito access tokens. Lambda functions receive pre-validated JWT claims via `event.requestContext.authorizer.jwt.claims`.

## Consequences

- Zero Lambda cold starts for authorization — validation happens at the gateway level
- Simpler architecture with no custom authorizer code to maintain
- Automatic token expiry and signature validation
- Limited to JWT claim-based authorization; complex permission logic would require a custom authorizer
- Lambda handlers can trust identity claims without re-validating tokens
