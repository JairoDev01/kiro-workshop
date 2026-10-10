/**
 * Intentional empty workspace region (Requirements 15, 16, 17).
 *
 * The primary workspace region, presented as a professional, intentional empty
 * state: a calm, centered, dashed-bordered block that signals where future
 * workshop features will live. The section heading is an `h2` (the single page
 * `h1` lives in WelcomeSection). It deliberately carries NO fake resource
 * lists, charts, metrics, navigation modules, or placeholder business data — it
 * only communicates that the application is intentionally ready for the next
 * workshop feature. Styling reuses the shared tokens via WorkspacePage.css.
 */
export const WorkspaceEmptyState = () => (
  <section className="workspace-empty-state" aria-labelledby="empty-state-heading">
    <div className="workspace-empty-state__frame">
      <h2 id="empty-state-heading" className="workspace-empty-state__title">
        Listo para construir
      </h2>
      <p className="workspace-empty-state__copy">
        Esta base está preparada para evolucionar con Kiro.
      </p>
    </div>
  </section>
);
