import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../lib/auth/auth-provider';
import { AppRouter } from './routes';

export const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </AuthProvider>
);
