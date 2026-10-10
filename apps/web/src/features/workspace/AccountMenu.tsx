import { useEffect, useRef, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { logout } from '../../lib/auth/logout';

interface AccountMenuProps {
  /** Best-available user identifier, used for the avatar initial. */
  identifier: string;
}

/**
 * Compact circular account control that opens an accessible popover whose only
 * item is `Cerrar sesión` (Requirements 5, 6, 7, 18, 19).
 *
 * Behavior (task 4.2):
 * - The trigger is an accessible `<button>` showing the first character of the
 *   identifier (uppercased) in a CSS avatar circle. No profile image claim is
 *   available and no icon dependency is added.
 * - The trigger exposes `aria-haspopup="menu"`, `aria-expanded`, and an
 *   accessible label (`Cuenta de usuario`).
 * - The popover is a `role="menu"` containing exactly one `role="menuitem"`
 *   `<button>`: `Cerrar sesión`. No Profile/Settings/Account/Notifications items.
 * - Opens on click / Enter / Space; closes on outside click (document
 *   listener), `Escape`, and after activating the item. Focus returns to the
 *   trigger on close.
 * - `Cerrar sesión` calls the shared `logout(auth)` helper, reusing the exact
 *   existing Cognito end-session behavior.
 *
 * State is local component state + native DOM events; no new dependency.
 */
export const AccountMenu = ({ identifier }: AccountMenuProps) => {
  const auth = useAuth();
  const initial = identifier ? identifier.charAt(0).toUpperCase() : '';

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRef = useRef<HTMLButtonElement>(null);
  // Set when the menu is closed by a user action (Escape, outside click,
  // activation) so focus is returned to the trigger. We avoid returning focus
  // on the initial render (menu starts closed) by only reacting to a close
  // that followed an open.
  const shouldRestoreFocus = useRef(false);

  // Move focus into the menu item when the menu opens; restore focus to the
  // trigger when it closes due to a user action.
  useEffect(() => {
    if (open) {
      itemRef.current?.focus();
    } else if (shouldRestoreFocus.current) {
      shouldRestoreFocus.current = false;
      triggerRef.current?.focus();
    }
  }, [open]);

  // Close on outside click (document listener) and on Escape while open.
  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        shouldRestoreFocus.current = false;
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        shouldRestoreFocus.current = true;
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const toggle = () => {
    shouldRestoreFocus.current = false;
    setOpen((previous) => !previous);
  };

  const handleLogout = () => {
    // Close and return focus to the trigger, then run the shared Cognito
    // logout (which redirects the browser via the end-session endpoint).
    shouldRestoreFocus.current = true;
    setOpen(false);
    void logout(auth);
  };

  return (
    <div className="account-menu" ref={containerRef}>
      <button
        type="button"
        ref={triggerRef}
        className="account-menu__trigger"
        aria-label="Cuenta de usuario"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
      >
        <span className="account-menu__avatar" aria-hidden="true">
          {initial}
        </span>
      </button>
      {open && (
        <div className="account-menu__popover" role="menu" aria-label="Cuenta de usuario">
          <button
            type="button"
            ref={itemRef}
            className="account-menu__item"
            role="menuitem"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};
