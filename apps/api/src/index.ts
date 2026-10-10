/**
 * kiro-essentials backend application code.
 *
 * Authentication is handled entirely by AWS Cognito Managed Login v2
 * (Authorization Code Flow with PKCE): login, sign-up, password recovery,
 * and logout are Cognito-hosted. There are therefore no backend
 * authentication endpoints.
 *
 * Protected API routes are guarded by the API Gateway JWT Authorizer
 * (configured in the infra `ApiGatewayStack`) using the Cognito access
 * token. No Lambda application handlers are required for the current
 * login/signup scope.
 *
 * This file exists so the backend workspace has a valid TypeScript entry
 * point. Add feature handlers under `src/features/` as new scope is approved.
 */
export {};
