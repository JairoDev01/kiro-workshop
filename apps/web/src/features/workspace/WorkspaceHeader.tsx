import { AccountMenu } from './AccountMenu';

interface WorkspaceHeaderProps {
  /** Best-available user identifier (email → preferred_username → sub). */
  identifier: string;
}

/**
 * Top application header for the authenticated workspace (no sidebar).
 *
 * Semantic `<header>` landmark at `--topbar-height` with a calm, near-solid
 * surface that stays visually lighter than the landing hero gradient
 * (Requirements 3, 17). The left side shows a compact workshop identity (a
 * small brand accent mark built from existing tokens — no new icon/asset
 * dependency — plus the application name). The right side shows the resolved
 * identifier (collapsed under `--breakpoint-mobile` via CSS) next to the
 * account control (Requirements 4, 18).
 *
 * The identity text is a `<span>` (not an `h1`/`h2`) so the single page `h1`
 * stays in `WelcomeSection` and no extra heading is injected into the document
 * outline (Requirement 19).
 */
export const WorkspaceHeader = ({ identifier }: WorkspaceHeaderProps) => (
  <header className="workspace-header">
    <div className="workspace-header__identity">
      <span className="workspace-header__brand-mark" aria-hidden="true" />
      <span className="workspace-header__app-name">Workshop Workspace</span>
    </div>
    <div className="workspace-header__account">
      {identifier && (
        <span className="workspace-header__identifier" title={identifier}>
          {identifier}
        </span>
      )}
      <AccountMenu identifier={identifier} />
    </div>
  </header>
);
