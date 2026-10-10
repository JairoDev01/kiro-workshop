/**
 * Tests for the shared Cognito logout helper (task 1.1 behavior, task 9.2 gap).
 *
 * The `AccountMenu` tests (AccountMenu.test.tsx) mock this helper, so they only
 * prove that activating `Cerrar sesión` calls `logout(auth)`. They do NOT prove
 * that logout performs the REAL Cognito end-session behavior. These tests close
 * that gap (Requirement 22.4 / R7 / R20):
 *
 * - `logout(auth)` calls `auth.removeUser()` (clearing the local OIDC user).
 * - It then redirects the browser to the Cognito `/logout` (end-session) URL
 *   built from `import.meta.env` (`VITE_COGNITO_DOMAIN`, `VITE_COGNITO_CLIENT_ID`,
 *   `VITE_LOGOUT_URI`), with the client id and logout URI URL-encoded.
 * - This is a real Cognito redirect, NOT a local-only state clear.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logout } from './logout';

describe('logout (shared Cognito end-session helper)', () => {
  // Capture `window.location.href` assignments without triggering jsdom's
  // "navigation not implemented" behavior by swapping in a plain object.
  const originalLocation = window.location;
  let hrefSetter: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    hrefSetter = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        // Trap assignments to `location.href` so we can assert the target URL.
        set href(value: string) {
          hrefSetter(value);
        },
        get href() {
          return '';
        },
      },
    });

    vi.stubEnv('VITE_COGNITO_DOMAIN', 'auth.example.com');
    vi.stubEnv('VITE_COGNITO_CLIENT_ID', 'client/id+123');
    vi.stubEnv('VITE_LOGOUT_URI', 'https://app.example.com/callback?x=1');
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
    vi.unstubAllEnvs();
  });

  it('clears the local OIDC user and redirects to the Cognito logout URL built from env', async () => {
    const removeUser = vi.fn().mockResolvedValue(undefined);

    await logout({ removeUser });

    // Real Cognito logout: the local user is cleared first...
    expect(removeUser).toHaveBeenCalledTimes(1);

    // ...then the browser is redirected to the Cognito end-session endpoint.
    const expectedUrl =
      'https://auth.example.com/logout' +
      `?client_id=${encodeURIComponent('client/id+123')}` +
      `&logout_uri=${encodeURIComponent('https://app.example.com/callback?x=1')}`;

    expect(hrefSetter).toHaveBeenCalledTimes(1);
    expect(hrefSetter).toHaveBeenCalledWith(expectedUrl);
    // Not a local-only clear: a redirect to the hosted Cognito domain happened.
    expect(hrefSetter.mock.calls[0]![0]).toContain('https://auth.example.com/logout');
  });

  it('removes the local user before redirecting (order matters)', async () => {
    const calls: string[] = [];
    const removeUser = vi.fn().mockImplementation(async () => {
      calls.push('removeUser');
    });
    hrefSetter.mockImplementation(() => {
      calls.push('redirect');
    });

    await logout({ removeUser });

    expect(calls).toEqual(['removeUser', 'redirect']);
  });

  it('fails fast with an actionable message when a Cognito env var is missing', async () => {
    vi.stubEnv('VITE_COGNITO_DOMAIN', '');
    const removeUser = vi.fn().mockResolvedValue(undefined);

    await expect(logout({ removeUser })).rejects.toThrow(/VITE_COGNITO_DOMAIN/);
    // No redirect occurred because configuration was invalid.
    expect(hrefSetter).not.toHaveBeenCalled();
  });
});
