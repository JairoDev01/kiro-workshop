# Kiro Essentials — Spec Process Steering

_Last updated: 2026-10-08_

Read `_invariants.md` first.
For visible UI work, also read `brand-identity.md` and `ui-ux.md`.

## Spec lifecycle

A new Kiro spec produces:

```txt
requirements.md
design.md
tasks.md
```

Do not implement until the three files are reviewed and approved.

One spec should represent one meaningful, deployable workshop slice.

## Required inspection

Before design, inspect only the repository areas relevant to the feature, especially:

- current routes/pages/components;
- authentication flow;
- API clients and backend handlers;
- OpenAPI;
- CDK/IAM when relevant;
- existing tests;
- `.kiro/steering`;
- approved brand assets/tokens when UI changes.

Do not invent repository behavior or paths.

## Prompt structure

A Kiro prompt should state:

```md
Create a new feature spec called `<feature-name>`.

Context:
- Current accepted behavior.
- Relevant steering and repository sources.
- Constraints.

Goal:
- User/business outcome.

MVP scope:
- Exact included behavior.

Out of scope:
- Explicit exclusions.

Frontend / Backend / OpenAPI / Infrastructure:
- Only what the feature actually needs.

Testing:
- Focused + regression.

Acceptance criteria:
- Testable checklist.

Expected output:
- requirements.md
- design.md
- tasks.md

Do not implement before approval.
```

## Design expectations

`design.md` must distinguish:

- existing repository behavior;
- existing components/infrastructure to reuse;
- actual gaps;
- whether API, backend, data, or infrastructure changes are genuinely required;
- compatibility/regression risks.

Avoid speculative abstractions.

## `tasks.md` parser format

Use:

```md
# Implementation Plan: <Spec Title>

## Overview

<Brief scope.>

## Tasks

- [ ] 1. Task group
  - [ ] 1.1 Subtask
    - Step/detail
    - _Requirements: R1_
```

Keep tasks small, dependency-ordered, reviewable, and mapped to requirements.
