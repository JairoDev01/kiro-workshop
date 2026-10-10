/**
 * Concise welcome section (Requirements 13, 17, 19).
 *
 * Owns the SINGLE page `h1` for the authenticated workspace — no other `h1`
 * exists on the page. Renders the page title (`Bienvenido al workspace`) plus
 * one concise line of Spanish supporting copy communicating that authentication
 * and a protected API are already working on AWS. Intentionally restrained and
 * calmer than the expressive public landing: no gradient, card, or decorative
 * chrome. Styling lives in `WorkspacePage.css` and reuses the shared tokens.
 */
export const WelcomeSection = () => (
  <section className="welcome-section" aria-labelledby="welcome-heading">
    <h1 id="welcome-heading">Bienvenido al workspace</h1>
    <p>
      Tu entorno está listo. Ya tienes autenticación y una API protegida funcionando sobre AWS.
    </p>
  </section>
);
