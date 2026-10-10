# ADR-0005: Use OpenAPI Contracts

## Status

Accepted

## Context

Frontend and backend need alignment on API request/response shapes. Without a shared contract, each side may drift, causing integration bugs and miscommunication about expected behavior.

## Decision

Use a single consolidated OpenAPI file as the API contract source of truth. The contract lives in `packages/contracts/openapi/openapi.yaml`. (In the current auth-only workshop scope it documents the Cognito `BearerAuth` security scheme with no business paths.)

## Consequences

- Clear, version-controlled API contracts that both frontend and backend can reference
- Domain tags provide logical grouping without file-splitting complexity
- No code generation or bundling tooling added yet — keeps the setup lightweight
- Manual effort required to keep the spec in sync with implementation changes
- Future improvement path: split into domain files and add type generation when endpoint count grows
