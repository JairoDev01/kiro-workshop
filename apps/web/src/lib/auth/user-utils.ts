/**
 * Resolves a display identifier from OIDC token claims.
 * Priority: email → preferred_username → sub
 */
export const resolveUserIdentifier = (profile: {
  email?: string;
  preferred_username?: string;
  sub: string;
}): string => {
  if (profile.email && profile.email.trim().length > 0) {
    return profile.email;
  }

  if (profile.preferred_username && profile.preferred_username.trim().length > 0) {
    return profile.preferred_username;
  }

  return profile.sub;
};
