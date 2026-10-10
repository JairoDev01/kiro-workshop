/**
 * App auth provider.
 *
 * Cognito/OIDC has been removed for local development; this now wires up the
 * local MOCK auth provider so a simulated user is always "signed in".
 */
export { AuthProvider } from './mock-auth';
