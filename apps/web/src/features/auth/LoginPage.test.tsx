/**
 * Tests for LoginPage authenticated landing behavior.
 *
 * Verifies:
 * - When the user is already authenticated, LoginPage redirects to /home
 *   (the authenticated landing destination).
 * - When the user is NOT authenticated, LoginPage renders the login UI and does
 *   not redirect (unauthenticated flow unchanged).
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LoginPage } from './LoginPage';

// --- Mocks ---

// Controllable auth mock so each test can toggle authentication state.
const authState = {
  isAuthenticated: false,
  signinRedirect: vi.fn(),
};

vi.mock('react-oidc-context', () => ({
  useAuth: () => authState,
}));

// Helper to expose the current location so we can assert redirect targets.
const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="current-location">{location.pathname}</div>;
};

const renderLoginRoute = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<div data-testid="home-surface">Home</div>} />
      </Routes>
      <LocationDisplay />
    </MemoryRouter>
  );

describe('LoginPage - authenticated landing', () => {
  beforeEach(() => {
    authState.isAuthenticated = false;
    authState.signinRedirect = vi.fn();
  });

  it('redirects an already-authenticated user to /home', () => {
    authState.isAuthenticated = true;

    renderLoginRoute();

    expect(screen.getByTestId('current-location').textContent).toBe('/home');
    expect(screen.getByTestId('home-surface')).toBeInTheDocument();
  });

  it('renders the login UI and stays on /login when unauthenticated', () => {
    authState.isAuthenticated = false;

    renderLoginRoute();

    expect(screen.getByTestId('current-location').textContent).toBe('/login');
    expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeInTheDocument();
    expect(screen.queryByTestId('home-surface')).not.toBeInTheDocument();
  });
});
