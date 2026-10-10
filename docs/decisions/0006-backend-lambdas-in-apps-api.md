# ADR-0006: Backend Lambdas in apps/api

## Status

Accepted

## Context

Lambda handler business logic was co-located with CDK infrastructure code in `infra/lambda/`. This coupling made it difficult to test API logic independently and blurred the boundary between infrastructure definitions and application behavior.

## Decision

Keep Lambda business logic in `apps/api` with a feature-based directory structure (`apps/api/src/features/`), separate from CDK infrastructure. CDK stacks reference handler entry paths pointing to `apps/api`. (In the current auth-only workshop scope there are no feature handlers — the backend workspace is scaffolding for future handlers.)

## Consequences

- Clearer separation between infrastructure definitions and application logic
- Backend business logic can be type-checked and tested independently of CDK
- CDK stacks use relative path references to handler entry points
- Developers can work on API logic without navigating CDK constructs
- Slightly longer path references in CDK Lambda entry configuration
