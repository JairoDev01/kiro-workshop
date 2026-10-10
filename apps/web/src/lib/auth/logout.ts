/**
 * Local "logout".
 *
 * Cognito/OIDC has been removed, so there is no hosted end-session endpoint and
 * no token to clear. Logout simply sends the browser back to the public landing
 * page. The `auth` argument is accepted for API compatibility with callers
 * (e.g. the account menu) but only its optional `removeUser` is invoked.
 */
export const logout = async (
  auth: { removeUser?: () => Promise<void> },
): Promise<void> => {
  await auth.removeUser?.();
  window.location.href = '/login';
};
