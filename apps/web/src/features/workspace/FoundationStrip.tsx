/**
 * Secondary, static technology-foundation strip (Requirements 14, 16, 17).
 *
 * A compact, visually quiet reminder of what the starter provides — React,
 * Cognito, API Gateway, Lambda, CloudFront, CDK, OpenAPI — presented as context
 * only. This is NOT a dashboard, NOT an architecture documentation page, and it
 * deliberately shows NO fake runtime status badges (no "connected" dots, no
 * health indicators): the only real runtime status on the page is authentication
 * state (header) and `/hello` connectivity (ProtectedApiCard). Here the
 * technology list is purely static.
 *
 * It is intentionally subordinate to the primary workspace content, so it uses a
 * secondary `h3` heading (the single page `h1` lives in WelcomeSection) and a
 * restrained inline chip list rather than a prominent card grid. Styling lives
 * in `WorkspacePage.css` and reuses the shared design tokens.
 */
const FOUNDATION_ITEMS = [
  'React',
  'Cognito',
  'API Gateway',
  'Lambda',
  'CloudFront',
  'CDK',
  'OpenAPI',
] as const;

export const FoundationStrip = () => (
  <section className="foundation-strip" aria-labelledby="foundation-heading">
    <h3 id="foundation-heading" className="foundation-strip__heading">
      Base tecnológica
    </h3>
    <ul className="foundation-strip__list">
      {FOUNDATION_ITEMS.map((item) => (
        <li key={item} className="foundation-strip__item">
          {item}
        </li>
      ))}
    </ul>
  </section>
);
