/**
 * Tests for the AccountMenu avatar-triggered account popover (task 4.2).
 *
 * Verifies (Requirements 5, 6, 7, 19):
 * - The trigger is an accessible <button> showing the identifier initial, with
 *   aria-haspopup="menu" and aria-expanded reflecting the open state.
 * - Activating the trigger (click / Enter / Space) opens a role="menu" popover
 *   containing exactly one role="menuitem": `Cerrar sesión` (no placeholder
 *   items such as Profile/Settings/Account/Notifications).
 * - The menu closes on outside click, on Escape, and after activating the item,
 *   returning focus to the trigger.
 * - `Cerrar sesión` calls the shared `logout(auth)` helper (real Cognito
 *   logout), not a local-only state clear.
 */
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccountMenu } from './AccountMenu';

// --- Mocks ---

const authState = { removeUser: vi.fn() };

vi.mock('../../lib/auth/mock-auth', () => ({
  useAuth: () => authState,
}));

const logoutMock = vi.fn();
vi.mock('../../lib/auth/logout', () => ({
  logout: (auth: unknown) => logoutMock(auth),
}));

describe('AccountMenu', () => {
  beforeEach(() => {
    authState.removeUser = vi.fn();
    logoutMock.mockReset();
  });

  const getTrigger = () => screen.getByRole('button', { name: 'Cuenta de usuario' });

  it('renders an accessible trigger with the uppercased identifier initial', () => {
    render(<AccountMenu identifier="ada@example.com" />);

    const trigger = getTrigger();
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveTextContent('A');
  });

  it('renders without error when no identifier is available', () => {
    render(<AccountMenu identifier="" />);

    expect(getTrigger()).toBeInTheDocument();
  });

  it('does not render the menu until the trigger is activated', () => {
    render(<AccountMenu identifier="ada@example.com" />);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens a menu with exactly one item (Cerrar sesión) on click', () => {
    render(<AccountMenu identifier="ada@example.com" />);

    fireEvent.click(getTrigger());

    const menu = screen.getByRole('menu');
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'true');

    const items = within(menu).getAllByRole('menuitem');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('Cerrar sesión');

    // No placeholder items.
    for (const label of ['Perfil', 'Profile', 'Ajustes', 'Settings', 'Cuenta', 'Notificaciones']) {
      expect(within(menu).queryByText(label)).not.toBeInTheDocument();
    }
  });

  it('opens the menu with Enter and Space on the trigger', () => {
    render(<AccountMenu identifier="ada@example.com" />);

    const trigger = getTrigger();

    // jsdom activates a <button> on click; Enter/Space produce a native click
    // on buttons, so simulate the resulting click.
    fireEvent.keyDown(trigger, { key: 'Enter' });
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('closes on Escape and returns focus to the trigger', () => {
    render(<AccountMenu identifier="ada@example.com" />);

    fireEvent.click(getTrigger());
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(getTrigger()).toHaveFocus();
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on an outside click', () => {
    render(
      <div>
        <AccountMenu identifier="ada@example.com" />
        <button type="button">outside</button>
      </div>,
    );

    fireEvent.click(getTrigger());
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole('button', { name: 'outside' }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('calls the shared logout helper and closes when Cerrar sesión is activated', () => {
    render(<AccountMenu identifier="ada@example.com" />);

    fireEvent.click(getTrigger());
    fireEvent.click(screen.getByRole('menuitem', { name: 'Cerrar sesión' }));

    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(logoutMock).toHaveBeenCalledWith(authState);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(getTrigger()).toHaveFocus();
  });
});
