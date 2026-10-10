# Kiro Essentials — UI/UX Steering

_Last updated: 2026-10-08_

Read `_invariants.md` first.
Read `brand-identity.md` for visual identity rules.

## Direction

The workshop application should remain simple, clear, and intentionally small while the business exercise is being defined.

Prefer one obvious primary action per surface and avoid admin-dashboard complexity unless the workshop feature requires it.

## Reuse rule

Before adding a new button style, field pattern, dialog, card, navigation primitive, or feedback pattern:

1. inspect the repository;
2. identify accepted existing controls;
3. reuse them when suitable;
4. add a new primitive only when a real gap exists.

## Authentication experience

Authentication uses Cognito Managed Login v2.

- Preserve the existing Cognito-hosted authentication flow.
- Apply DUIT branding only through supported Managed Login branding and existing assets.
- Keep authentication content readable and visually primary over decoration.

## Accessibility and responsive behavior

- Maintain readable typography and clear hierarchy.
- Preserve visible keyboard focus.
- Do not rely on color alone for meaning.
- Keep primary actions usable on narrow/mobile layouts.
- Avoid horizontal overflow from brand assets or long values.
