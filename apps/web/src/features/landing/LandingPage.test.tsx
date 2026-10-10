/**
 * Tests for the public LandingPage.
 *
 * Verifies (Requirement 16):
 * - An unauthenticated visitor sees the landing (hero present, stays on route).
 * - An authenticated visitor is redirected to /home.
 * - The event logo and speaker photo render with their alt text and a resolved src.
 * - The speaker portrait container carries the circular-treatment marker.
 * - Both the hero CTA and the final CTA invoke the single signinRedirect handler.
 * - No credential inputs are rendered (public page, OIDC-only).
 * - All major sections render and there is exactly one h1 on the page.
 *
 * Follows the existing mocking pattern from LoginPage.test.tsx / CallbackPage.test.tsx:
 * a mutable `authState` object mocked for react-oidc-context, rendered under
 * MemoryRouter, and a LocationDisplay helper to assert redirect pathnames.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LandingPage } from './LandingPage';

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

const renderLandingRoute = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<div data-testid="home-surface">Home</div>} />
      </Routes>
      <LocationDisplay />
    </MemoryRouter>
  );

describe('LandingPage', () => {
  beforeEach(() => {
    authState.isAuthenticated = false;
    authState.signinRedirect = vi.fn();
  });

  it('renders the landing and stays on the route for an unauthenticated visitor', () => {
    authState.isAuthenticated = false;

    renderLandingRoute();

    expect(screen.getByTestId('current-location').textContent).toBe('/');
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Evoluciona una aplicación AWS real con Kiro',
      })
    ).toBeInTheDocument();
    expect(screen.queryByTestId('home-surface')).not.toBeInTheDocument();
  });

  it('redirects an authenticated visitor to /home', () => {
    authState.isAuthenticated = true;

    renderLandingRoute();

    expect(screen.getByTestId('current-location').textContent).toBe('/home');
    expect(screen.getByTestId('home-surface')).toBeInTheDocument();
  });

  it('renders the event logo with alt text and a resolved src', () => {
    renderLandingRoute();

    const logo = screen.getByAltText('Logotipo oficial de AWS Community Day Guatemala');
    expect(logo).toBeInTheDocument();
    expect(logo.getAttribute('alt')).not.toBe('');
    expect(logo.getAttribute('src')).toBeTruthy();
  });

  it('renders the speaker photo with the speaker alt text and a resolved src', () => {
    renderLandingRoute();

    const speakerPhoto = screen.getByAltText('Fotografía de Jaco, speaker del workshop');
    expect(speakerPhoto).toBeInTheDocument();
    expect(speakerPhoto.getAttribute('src')).toBeTruthy();
  });

  it('wraps the speaker photo in a circular-treatment portrait container', () => {
    const { container } = renderLandingRoute();

    const portrait = container.querySelector('.speaker__portrait');
    expect(portrait).not.toBeNull();
    expect(portrait?.querySelector('img')).not.toBeNull();
  });

  it('invokes signinRedirect from both the hero CTA and the final CTA', () => {
    renderLandingRoute();

    const signInButtons = screen.getAllByRole('button', { name: 'Iniciar sesión' });
    expect(signInButtons).toHaveLength(2);

    signInButtons.forEach((button) => fireEvent.click(button));

    expect(authState.signinRedirect).toHaveBeenCalledTimes(2);
  });

  it('does not render any credential inputs (OIDC-only public page)', () => {
    const { container } = renderLandingRoute();

    expect(screen.queryByRole('textbox')).toBeNull();
    expect(container.querySelector('input[type="password"]')).toBeNull();
    expect(container.querySelector('input')).toBeNull();
  });

  it('renders all major section headings', () => {
    renderLandingRoute();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Haz evolucionar una aplicación AWS real',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'No es un demo de IA desechable' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Una base de AWS real' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Choose Your Path' })
    ).toBeInTheDocument();
    expect(screen.getByText('Sobre el speaker')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Jaco' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: '¿Listo para empezar a construir?' })
    ).toBeInTheDocument();
  });

  it('renders exactly one h1 on the page', () => {
    renderLandingRoute();

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('renders the hero foundation strip with a representative stack chip', () => {
    const { container } = renderLandingRoute();

    // The chip strip is a non-interactive <ul> of plain-text pills. Scope to the
    // strip itself so the assertion targets the chip and not the right-column
    // foundation card (which lists "API Gateway + Lambda").
    const stackChips = Array.from(
      container.querySelectorAll('.hero__stack .hero__stack-chip')
    ).map((chip) => chip.textContent);

    expect(stackChips).toContain('Lambda');
  });
});
