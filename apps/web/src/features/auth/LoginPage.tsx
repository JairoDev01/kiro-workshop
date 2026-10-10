import { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthError } from '../../lib/auth/error-utils';

interface LocationState {
  error?: AuthError;
}

export const LoginPage = () => {
  const { isAuthenticated, signinRedirect } = useAuth();
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  const [error, setError] = useState<AuthError | undefined>(locationState?.error);

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const handleLogin = async () => {
    setError(undefined);
    try {
      await signinRedirect();
    } catch (e) {
      console.error('signinRedirect failed:', e);
      setError({ type: 'auth_failed', message: 'Error al iniciar sesión. Intenta de nuevo.' });
    }
  };

  return (
    <div>
      <h1>Login</h1>
      {error && error.message && (
        <div role="alert">
          {error.message}
        </div>
      )}
      <button onClick={handleLogin}>Iniciar Sesión</button>
    </div>
  );
};
