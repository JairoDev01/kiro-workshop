# Kiro Essentials — Architecture Steering

_Last updated: 2026-10-08_

Read `_invariants.md` first.

## Direction

This repository is a deliberately small AWS-native serverless workshop starter.

Prefer deployable vertical slices over platform expansion.

## Current architecture

Frontend delivery:

```txt
Browser
→ HTTPS
→ CloudFront
→ Origin Access Control (OAC)
→ private S3 bucket
→ React SPA
```

Authenticated application flow:

```txt
React SPA
→ Cognito Managed Login v2
→ Cognito access token
→ API Gateway HTTP API
→ JWT Authorizer
→ Lambda
```

Infrastructure: AWS CDK.

API contract: OpenAPI.

## Repository boundaries

Preserve the existing monorepo organization and inspect current code before adding new structure.

```txt
apps/
infra/
packages/
docs/
scripts/
.kiro/
```

Do not restructure the repository as part of a workshop feature unless the exercise explicitly teaches repository restructuring.

## Vertical slice rule

A feature should change only the layers it needs:

```txt
requirements
→ design
→ tasks
→ frontend/backend/API/infrastructure only where required
→ tests
```

Avoid speculative abstractions and generic infrastructure.
