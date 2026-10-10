# ADR-0004: Use Monorepo Structure

## Status

Accepted

## Context

The project grew from a proof-of-concept with frontend, backend Lambda handlers, and CDK infrastructure co-located without clear boundaries. As features expand, the lack of separation makes it harder to reason about dependencies and maintain focused workspaces.

## Decision

Restructure into an npm workspaces monorepo with `apps/web`, `apps/api`, `packages/contracts`, and `infra` as distinct workspace packages. Use npm workspaces only — no Turborepo, Nx, or pnpm.

## Consequences

- Shared tooling and consistent dependency versions across all packages
- Atomic changes spanning frontend, backend, and infrastructure in a single commit
- Clear ownership boundaries between frontend, backend, and infra code
- More complex initial setup compared to a flat project structure
- All packages share a single repository and version control history
