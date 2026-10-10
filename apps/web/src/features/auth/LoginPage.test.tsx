/**
 * Tests for LoginPage (mock-auth local mode).
 *
 * Cognito/OIDC was removed. The login page simply renders a button that, when
 * clicked, navigates straight to /home — there is no real sign-in and no
 * auth-based auto-redirect.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LoginPage } from './LoginPage';

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
    </MemoryRouter>,
  );

describe('LoginPage - local mock auth', () => {
  it('renders the login UI and stays on /login until the user acts', () => {
    renderLoginRoute();

    expect(screen.getByTestId('current-location').textContent).toBe('/login');
    expect(
      screen.getByRole('button', { name: 'Iniciar Sesión' }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('home-surface')).not.toBeInTheDocument();
  });

  it('navigates to /home when "Iniciar Sesión" is clicked', async () => {
    renderLoginRoute();

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    expect(await screen.findByTestId('home-surface')).toBeInTheDocument();
    expect(screen.getByTestId('current-location').textContent).toBe('/home');
  });
});
