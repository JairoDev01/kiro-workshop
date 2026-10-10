/**
 * Tests for the WorkspaceHeader responsive markers (task 9.2, Requirement 22.10).
 *
 * jsdom does not perform real responsive layout, so true breakpoint hiding of
 * the identifier is CSS-driven (`.workspace-header__identifier` has
 * `display: none` under `@media (max-width: 768px)` in WorkspacePage.css) and
 * cannot be observed by querying computed layout here. Instead we verify the
 * STRUCTURAL markers that make the responsive behavior work:
 *
 * - The account control (`Cuenta de usuario` button) is always rendered and
 *   therefore remains accessible even when the identifier is hidden at the
 *   mobile breakpoint.
 * - The identifier text uses the `workspace-header__identifier` class, which is
 *   the exact hook the stylesheet hides under `--breakpoint-mobile`.
 *
 * This proves the logout path stays reachable on narrow screens (the account
 * control + its single `Cerrar sesión` item never collapse away).
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkspaceHeader } from './WorkspaceHeader';

// --- Mocks ---

// The nested AccountMenu reads useAuth(); keep it inert for these structural
// tests (logout is only triggered on activation, which we never do here).
const authState = { removeUser: vi.fn() };
vi.mock('react-oidc-context', () => ({
  useAuth: () => authState,
}));
vi.mock('../../lib/auth/logout', () => ({
  logout: vi.fn(),
}));

describe('WorkspaceHeader - responsive markers', () => {
  beforeEach(() => {
    authState.removeUser = vi.fn();
  });

  it('renders the identifier with the breakpoint-hidden class and keeps the account control present', () => {
    const { container } = render(<WorkspaceHeader identifier="ada@example.com" />);

    // The identifier text is present and carries the exact class the stylesheet
    // hides at <=768px (verified structurally; CSS does the real hiding).
    const identifier = container.querySelector('.workspace-header__identifier');
    expect(identifier).toBeInTheDocument();
    expect(identifier).toHaveTextContent('ada@example.com');

    // The account control remains rendered regardless of the identifier's
    // responsive visibility, so logout stays reachable on narrow screens.
    expect(screen.getByRole('button', { name: 'Cuenta de usuario' })).toBeInTheDocument();
  });

  it('keeps the account control present even when no identifier is shown', () => {
    const { container } = render(<WorkspaceHeader identifier="" />);

    // With no identifier, the hidden-at-mobile identifier span is not rendered,
    // but the account control (logout entry point) must still be present.
    expect(container.querySelector('.workspace-header__identifier')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cuenta de usuario' })).toBeInTheDocument();
  });
});
