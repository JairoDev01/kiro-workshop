import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthError } from '../../lib/auth/error-utils';

export const LoginPage = () => {
  const navigate = useNavigate();

  // Auth is mocked: clicking "Iniciar Sesión" goes straight to /home. No real
  // sign-in, no redirect to a hosted login.
  const [error] = useState<AuthError | undefined>(undefined);

  const handleLogin = async () => {
    navigate('/home');
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
