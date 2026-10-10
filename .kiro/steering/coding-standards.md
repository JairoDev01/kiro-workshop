# Kiro Essentials — Coding Standards Steering

_Last updated: 2026-10-08_

Read `_invariants.md` first.

## General

- Follow existing repository conventions.
- Prefer small, focused changes.
- Avoid speculative abstractions.
- Reuse existing utilities and components before adding new ones.
- Do not rename established modules, stacks, or resources without need.
- Do not commit secrets, credentials, or generated environment-specific values.

## Frontend

- Reuse existing auth/provider/router patterns.
- Keep authentication UI in Cognito Managed Login v2.
- Keep deployment-specific public configuration outside hardcoded component logic.
- Avoid new global state when local component/state orchestration is sufficient.

## Backend

- Validate authoritative behavior server-side.
- Derive authenticated identity from validated JWT claims.
- Reuse established HTTP/error helpers when present.
- Keep Lambda handlers focused on the feature being taught.

## Infrastructure

- Preserve stack/resource naming unless the workshop feature requires a change.
- Keep stack dependencies explicit and acyclic.
- Never expose secrets through CloudFormation outputs.
- Preserve CloudFront + private S3 + OAC hosting unless the exercise explicitly changes hosting.

## Tests

Add or update tests for behavior changed by the workshop feature.

Prefer focused regression coverage over broad unrelated test rewrites.
