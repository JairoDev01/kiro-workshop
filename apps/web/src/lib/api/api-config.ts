/**
 * Reads a required Vite environment variable, failing fast with a clear,
 * actionable message when it is missing. Vite inlines `import.meta.env.*`
 * at build time, so a missing value surfaces as `undefined` at runtime.
 *
 * Mirrors the `requireEnv` fail-fast pattern used in `auth-config.ts`.
 */
const requireEnv = (name: keyof ImportMetaEnv): string => {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${String(name)}. ` +
        `Copia .env.example a .env en la raíz del repositorio y define la URL base de la API (API Gateway).`,
    );
  }
  return value;
};

/**
 * Resolves the API base URL from `VITE_API_URL`, trimming a single trailing
 * slash so callers can safely append paths like `/hello`. Fails fast with a
 * clear message when the variable is missing. No hardcoded API URL.
 */
export const resolveApiBaseUrl = (): string => {
  const baseUrl = requireEnv('VITE_API_URL');
  return baseUrl.replace(/\/$/, '');
};
