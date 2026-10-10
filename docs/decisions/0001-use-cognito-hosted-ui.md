# ADR-0001: Use Cognito Hosted UI

## Status

Accepted

## Context

kiro-essentials needs user authentication (login, signup, password reset) without building and maintaining custom authentication screens. Building custom auth UI adds significant development time, requires handling security edge cases, and increases ongoing maintenance burden.

## Decision

Use AWS Cognito Managed Login (Hosted UI) with Authorization Code Flow + PKCE instead of building custom authentication screens. The SPA redirects users to the Cognito-hosted login page and receives tokens via callback.

## Consequences

- Faster time to market — no login/signup UI to build or maintain
- Security best practices handled by AWS (CSRF, brute force, password policies)
- Less control over authentication UX and styling
- Dependency on Cognito's UI customization options for branding
- Cannot implement custom authentication flows without migrating away from Hosted UI
