import { useEffect } from 'react';
import { useAuth } from '../../lib/auth/mock-auth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { classifyCallbackError, handleNetworkError } from '../../lib/auth/error-utils';

export const CallbackPage = () => {
  const { isAuthenticated, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAuthenticated) {
      navigate('/home', { replace: true });
      return;
    }

    if (error) {
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description') ?? undefined;

      if (errorParam) {
        const authError = classifyCallbackError(errorParam, errorDescription);

        if (authError.type === 'cancelled') {
          navigate('/login', { replace: true });
        } else {
          navigate('/login', { replace: true, state: { error: authError } });
        }
      } else {
        // Network error or other non-Cognito error
        const networkError = handleNetworkError();
        navigate('/login', { replace: true, state: { error: networkError } });
      }
    }
  }, [isLoading, isAuthenticated, error, navigate, searchParams]);

  return <div>Procesando autenticación...</div>;
};
