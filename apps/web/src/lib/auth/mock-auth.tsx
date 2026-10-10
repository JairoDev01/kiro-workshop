/**
 * LOCAL MOCK AUTH — Cognito/OIDC removed.
 *
 * This replaces `react-oidc-context` for local development. There is no real
 * authentication, no tokens, and no redirects to a hosted login. A single
 * simulated user is ALWAYS considered authenticated, so clicking "Iniciar
 * sesión" just navigates straight to /home.
 *
 * The shape mirrors the small slice of `react-oidc-context`'s `AuthContextProps`
 * that the app actually used (`isAuthenticated`, `isLoading`, `user`,
 * `signinRedirect`, `removeUser`), so components can keep calling `useAuth()`
 * unchanged — only their import path points here instead of the OIDC package.
 */
import { createContext, useContext, type ReactNode } from 'react';

/** The simulated signed-in user. No access token is issued or needed. */
export interface MockUser {
  expired: boolean;
  profile: {
    sub: string;
    email: string;
    preferred_username?: string;
  };
}

export interface MockAuth {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: undefined;
  user: MockUser;
  /** No-op redirect: there is no hosted login to send the user to. */
  signinRedirect: () => Promise<void>;
  /** No-op: nothing to clear since there is no real session/token. */
  removeUser: () => Promise<void>;
}

/** The fixed demo identity surfaced across the app. */
export const MOCK_USER: MockUser = {
  expired: false,
  profile: {
    sub: 'local-dev-user',
    email: 'demo@local.dev',
    preferred_username: 'demo',
  },
};

const mockAuth: MockAuth = {
  isAuthenticated: true,
  isLoading: false,
  error: undefined,
  user: MOCK_USER,
  signinRedirect: async () => {
    /* no-op — already "authenticated" */
  },
  removeUser: async () => {
    /* no-op — no real session */
  },
};

const MockAuthContext = createContext<MockAuth>(mockAuth);

/** Drop-in replacement for the OIDC AuthProvider — just provides the mock. */
export const AuthProvider = ({ children }: { children: ReactNode }) => (
  <MockAuthContext.Provider value={mockAuth}>{children}</MockAuthContext.Provider>
);

/** Drop-in replacement for `react-oidc-context`'s `useAuth()`. */
export const useAuth = (): MockAuth => useContext(MockAuthContext);
