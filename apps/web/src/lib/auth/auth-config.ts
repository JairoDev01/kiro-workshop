import { UserManagerSettings } from 'oidc-client-ts';

/**
 * Reads a required Vite environment variable, failing fast with a clear,
 * actionable message when it is missing. Vite inlines `import.meta.env.*`
 * at build time, so a missing value surfaces as `undefined` at runtime.
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

const userPoolId = requireEnv('VITE_COGNITO_USER_POOL_ID');
const region = userPoolId.split('_')[0];
const cognitoDomain = requireEnv('VITE_COGNITO_DOMAIN');
const authority = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

export const oidcConfig: UserManagerSettings = {
  authority,
  client_id: requireEnv('VITE_COGNITO_CLIENT_ID'),
  redirect_uri: requireEnv('VITE_REDIRECT_URI'),
  post_logout_redirect_uri: requireEnv('VITE_LOGOUT_URI'),
  response_type: 'code',
  scope: 'openid email profile',
  metadata: {
    issuer: authority,
    authorization_endpoint: `https://${cognitoDomain}/oauth2/authorize`,
    token_endpoint: `https://${cognitoDomain}/oauth2/token`,
    end_session_endpoint: `https://${cognitoDomain}/logout`,
    revocation_endpoint: `https://${cognitoDomain}/oauth2/revoke`,
    userinfo_endpoint: `https://${cognitoDomain}/oauth2/userInfo`,
    jwks_uri: `${authority}/.well-known/jwks.json`,
  },
  extraQueryParams: { lang: 'es' },
};
