export type AuthErrorType =
  | 'cancelled'
  | 'auth_failed'
  | 'network_error'
  | 'session_expired';

export interface AuthError {
  type: AuthErrorType;
  message: string;
}

export const classifyCallbackError = (error: string, errorDescription?: string): AuthError => {
  if (error === 'access_denied') {
    return { type: 'cancelled', message: '' };
  }
  if (error === 'server_error' || error === 'temporarily_unavailable') {
    return { type: 'auth_failed', message: 'El servicio de autenticación no está disponible. Intenta de nuevo.' };
  }
  return { type: 'auth_failed', message: errorDescription || 'No se pudo completar la autenticación.' };
};

export const handleNetworkError = (): AuthError => ({
  type: 'network_error',
  message: 'Error de conexión. Verifica tu conexión a internet e intenta de nuevo.',
});

export const handleSessionExpired = (): AuthError => ({
  type: 'session_expired',
  message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
});
