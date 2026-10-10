import type { AuthContextProps } from 'react-oidc-context';

/**
 * Reads a required Vite environment variable, failing fast with a clear,
 * actionable message when it is missing. Vite inlines `import.meta.env.*`
 * at build time, so a missing value surfaces as `undefined` at runtime.
 *
 * Mirrors the `requireEnv` helper used by `auth-config.ts` so logout stays
 * consistent with the rest of the Cognito configuration.
 */
const requireEnv = (name: keyof ImportMetaEnv): string => {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${String(name)}. ` +
        `Copia .env.example a .env en la raíz del repositorio y define los valores de Cognito.`,
    );
  }
  return value;
};

/**
 * Performs the real Cognito logout: clears the local OIDC user and then
 * redirects the browser to the Cognito `/logout` (`end_session`) endpoint.
 *
 * This is the exact behavior previously implemented inline in `HomePage`,
 * extracted into a reusable helper so the account menu (and any future
 * surface) can trigger identical logout behavior. It intentionally does NOT
 * merely clear local state, and it does NOT call a custom backend endpoint.
 *
 * The Cognito logout URL is derived from the existing `import.meta.env`
 * configuration (`VITE_COGNITO_DOMAIN`, `VITE_COGNITO_CLIENT_ID`,
 * `VITE_LOGOUT_URI`) and is never hardcoded.
 */
export const logout = async (auth: Pick<AuthContextProps, 'removeUser'>): Promise<void> => {
  const cognitoDomain = requireEnv('VITE_COGNITO_DOMAIN');
  const clientId = requireEnv('VITE_COGNITO_CLIENT_ID');
  const logoutUri = requireEnv('VITE_LOGOUT_URI');

  await auth.removeUser();

  window.location.href =
    `https://${cognitoDomain}/logout` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&logout_uri=${encodeURIComponent(logoutUri)}`;
};
