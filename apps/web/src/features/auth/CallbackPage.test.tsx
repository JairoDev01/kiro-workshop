/**
 * Tests for CallbackPage post-authentication landing behavior.
 *
 * Verifies:
 * - On successful authentication, CallbackPage navigates to /home
 *   (the authenticated landing destination).
 * - While loading, it does not navigate.
 * - On a Cognito error, it still redirects to /login (unauthenticated/error flow unchanged).
 */
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CallbackPage } from './CallbackPage';

// --- Mocks ---

const authState = {
  isAuthenticated: false,
  isLoading: false,
  error: undefined as unknown,
};

vi.mock('../../lib/auth/mock-auth', () => ({
  useAuth: () => authState,
}));

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="current-location">{location.pathname}</div>;
};

const renderCallbackRoute = (initialEntry = '/callback') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/home" element={<div data-testid="home-surface">Home</div>} />
        <Route path="/login" element={<div data-testid="login-surface">Login</div>} />
      </Routes>
      <LocationDisplay />
    </MemoryRouter>
  );

describe('CallbackPage - post-auth landing', () => {
  beforeEach(() => {
    authState.isAuthenticated = false;
    authState.isLoading = false;
    authState.error = undefined;
  });

  it('navigates to /home on successful authentication', async () => {
    authState.isAuthenticated = true;

    renderCallbackRoute();

    await waitFor(() => {
      expect(screen.getByTestId('current-location').textContent).toBe('/home');
    });
    expect(screen.getByTestId('home-surface')).toBeInTheDocument();
  });

  it('stays on /callback while authentication is loading', () => {
    authState.isLoading = true;

    renderCallbackRoute();

    expect(screen.getByTestId('current-location').textContent).toBe('/callback');
    expect(screen.getByText('Procesando autenticación...')).toBeInTheDocument();
  });

  it('redirects to /login on a Cognito error (error flow unchanged)', async () => {
    authState.isAuthenticated = false;
    authState.error = new Error('auth failed');

    renderCallbackRoute('/callback?error=access_denied');

    await waitFor(() => {
      expect(screen.getByTestId('current-location').textContent).toBe('/login');
    });
    expect(screen.queryByTestId('home-surface')).not.toBeInTheDocument();
  });
});
