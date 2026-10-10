/**
 * Tests for the local logout helper.
 *
 * Cognito/OIDC was removed: logout no longer hits a hosted end-session
 * endpoint. It optionally clears any local user and sends the browser back to
 * the public landing (/login).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logout } from './logout';

describe('logout (local)', () => {
  const originalLocation = window.location;
  let hrefSetter: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    hrefSetter = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        set href(value: string) {
          hrefSetter(value);
        },
        get href() {
          return '';
        },
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('clears any local user and redirects to /login', async () => {
    const removeUser = vi.fn().mockResolvedValue(undefined);

    await logout({ removeUser });

    expect(removeUser).toHaveBeenCalledTimes(1);
    expect(hrefSetter).toHaveBeenCalledWith('/login');
  });

  it('works even when no removeUser is provided', async () => {
    await logout({});
    expect(hrefSetter).toHaveBeenCalledWith('/login');
  });
});
