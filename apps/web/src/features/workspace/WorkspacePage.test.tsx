/**
 * Tests for the Workshop Workspace page served at `/home` inside
 * `ProtectedRoute`.
 *
 * Auth was removed (local mock mode): `ProtectedRoute` always allows access and
 * the mock user (`demo@local.dev`) is always present. These tests therefore
 * focus on the workspace STRUCTURE and the resolved identifier, mocking the
 * local `mock-auth` module so the fixed user is deterministic.
 */
import { render, screen, within, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ProtectedRoute } from '../../lib/auth/ProtectedRoute';
import { WorkspacePage } from './WorkspacePage';

// --- Mocks ---

// Fixed mock auth: always authenticated with the demo identity. Shared by
// ProtectedRoute, WorkspacePage and the nested AccountMenu via `useAuth()`.
const mockUser = {
  expired: false,
  profile: {
    email: 'ada@example.com',
    preferred_username: 'ada',
    sub: 'cognito-sub-123',
  },
};

vi.mock('../../lib/auth/mock-auth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: mockUser,
    removeUser: vi.fn(),
  }),
}));

// Keep the automatic `GET /hello` from `ProtectedApiCard` out of these tests.
vi.mock('../../lib/api/hello-client', () => ({
  fetchHello: vi
    .fn()
    .mockResolvedValue({ ok: true, message: 'Hola', items: [], status: 200 }),
}));

// Keep the shared logout helper inert.
vi.mock('../../lib/auth/logout', () => ({
  logout: vi.fn(),
}));

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="current-location">{location.pathname}</div>;
};

const renderHomeRoute = () =>
  render(
    <MemoryRouter initialEntries={['/home']}>
      <Routes>
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <WorkspacePage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div data-testid="login-surface">Login</div>} />
      </Routes>
      <LocationDisplay />
    </MemoryRouter>,
  );

describe('WorkspacePage - /home workspace', () => {
  it('renders the workspace with the resolved email identifier', async () => {
    renderHomeRoute();

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByTestId('current-location').textContent).toBe('/home');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Bienvenido al workspace' }),
    ).toBeInTheDocument();

    const header = screen.getByRole('banner');
    expect(within(header).getByText('ada@example.com')).toBeInTheDocument();
    expect(within(header).queryByText('cognito-sub-123')).not.toBeInTheDocument();
  });

  it('renders the two-region structure: welcome, primary + secondary, foundation', async () => {
    renderHomeRoute();

    await act(async () => {
      await Promise.resolve();
    });

    expect(
      screen.getByRole('heading', { level: 1, name: 'Bienvenido al workspace' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Listo para evolucionar' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Estado del entorno' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Base tecnológica' }),
    ).toBeInTheDocument();
  });

  it('orders the regions primary-first in the DOM', async () => {
    const { container } = renderHomeRoute();

    await act(async () => {
      await Promise.resolve();
    });

    const columns = container.querySelector('.workspace__columns');
    const primary = container.querySelector('.workspace__primary');
    const secondary = container.querySelector('.workspace__secondary');
    expect(columns).not.toBeNull();
    expect(primary).not.toBeNull();
    expect(secondary).not.toBeNull();

    expect(
      primary!.compareDocumentPosition(secondary!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    expect(
      primary!.contains(
        screen.getByRole('heading', { level: 2, name: 'Listo para evolucionar' }),
      ),
    ).toBe(true);
    expect(
      secondary!.contains(
        screen.getByRole('heading', { level: 2, name: 'Estado del entorno' }),
      ),
    ).toBe(true);
  });

  it('preserves single-h1, landmarks, account-menu, and both regions', async () => {
    renderHomeRoute();

    await act(async () => {
      await Promise.resolve();
    });

    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent('Bienvenido al workspace');

    expect(screen.getAllByRole('banner')).toHaveLength(1);
    expect(screen.getAllByRole('main')).toHaveLength(1);

    const banner = screen.getByRole('banner');
    expect(within(banner).getByText('ada@example.com')).toBeInTheDocument();
    expect(
      within(banner).getByRole('button', { name: 'Cuenta de usuario' }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 2, name: 'Estado del entorno' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Listo para evolucionar' }),
    ).toBeInTheDocument();
  });
});
