# Kiro Essentials — Data Model Steering

_Last updated: 2026-10-08_

Read `_invariants.md` first.

## Current state

No workshop business data model is defined yet.

Do not recreate removed appointment, patient, availability, calendar, provider, or clinic models.

## Rule for future features

When a workshop feature introduces persistence:

- model only the data required by that feature;
- derive authenticated identity from validated Cognito JWT claims where ownership is required;
- define access patterns before choosing keys/indexes;
- avoid scans for normal user-facing access patterns;
- avoid presentation-only fields in persisted models;
- document the model and API contract in the corresponding approved spec.

Do not add a database or table merely because the architecture can support one.
