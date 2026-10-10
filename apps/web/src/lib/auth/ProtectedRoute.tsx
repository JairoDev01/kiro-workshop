import { useAuth } from 'react-oidc-context';
import { Navigate } from 'react-router-dom';
import { handleSessionExpired } from './error-utils';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (user && user.expired) {
    return <Navigate to="/login" replace state={{ error: handleSessionExpired() }} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
