import { AuthProvider as OidcAuthProvider } from 'react-oidc-context';
import { oidcConfig } from './auth-config';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => (
  <OidcAuthProvider
    {...oidcConfig}
    onSigninCallback={() => {
      window.history.replaceState({}, document.title, window.location.pathname);
    }}
  >
    {children}
  </OidcAuthProvider>
);
