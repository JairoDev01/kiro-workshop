# Kiro Essentials — Product Steering

_Last updated: 2026-10-08_

Read `_invariants.md` first.

## Current product state

This repository is intentionally a workshop starter, not a defined business product.

Current implemented user-facing capability:

```txt
Unauthenticated user
→ Cognito Managed Login v2
→ Authorization Code + PKCE
→ authenticated SPA
→ protected API capability available for future workshop features
```

## Product rule

Do not infer, restore, or reference the removed DUIT appointment-management product.

The next business behavior will be defined explicitly as part of the workshop design.

Until then:

- preserve authentication;
- preserve the serverless architecture baseline;
- preserve the visual identity;
- avoid adding domain concepts, entities, workflows, navigation, or data models that have not been approved.
