# Kiro Essentials — API Contracts Steering

_Last updated: 2026-10-08_

Read `_invariants.md` first.

## Contract authority

OpenAPI is the source of truth for application API contracts.

Any implemented endpoint, schema, request, response, or status-code change must update OpenAPI in the same implementation change.

## Authentication

Protected application endpoints use:

```http
Authorization: Bearer <Cognito access token>
```

API Gateway HTTP API JWT Authorizer validates the token.

## Errors

Prefer one consistent error shape for new workshop APIs:

```json
{
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

## Scope

- Do not add API paths before a workshop feature requires them.
- Do not create generic CRUD APIs merely to demonstrate backend code.
- Keep endpoint names aligned with the business behavior introduced by the approved spec.
