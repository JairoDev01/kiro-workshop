/**
 * kiro-essentials backend — LOCAL execution.
 *
 * Everything runs locally now: no CDK, no API Gateway, no Lambda, no DynamoDB.
 * Authentication is still Cognito Managed Login (Authorization Code + PKCE) in
 * the browser; this backend validates the resulting Cognito ACCESS token
 * against the pool's public JWKS and serves protected routes from a local
 * Express server. Ephemeral data lives in memory (or the frontend's
 * localStorage) — nothing is persisted to a cloud datastore.
 *
 * Entry points:
 *   - `createApp()` in `./app.ts`     — builds the Express app (used by tests).
 *   - `./server.ts`                   — starts the local HTTP server.
 */
export { createApp } from './app.js';
export type { AppConfig } from './app.js';
