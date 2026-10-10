import type { AuthError } from '../../../lib/auth/error-utils';
import eventLogo from '../../../assets/event-logo.png';
import './HeroSection.css';

export interface HeroSectionProps {
  /** Single sign-in path owned by LandingPage; wraps signinRedirect(). */
  onSignIn: () => void;
  /** Current auth error (surfaced from the callback flow via location.state). */
  error?: AuthError;
}

/**
 * Presentational hero for the public landing.
 *
 * Owns no auth state: LandingPage passes the single sign-in handler and any
 * auth error so there is exactly one sign-in path. The decorative gradient and
 * geometric motif are aria-hidden and built only from existing color tokens.
 */
export const HeroSection = ({ onSignIn, error }: HeroSectionProps) => {
  return (
    <section className="hero" aria-labelledby="hero-title">
      {/*
       * Decorative geometric motif; conveys no meaning to assistive tech.
       * Refreshed for the light near-white hero: brand-colored sparkles, thin
       * linework, and soft shapes biased to the edges/corners so nothing sits
       * behind the top-left logo header or the left-column headline. On a light
       * surface the previous very-low opacities would vanish, so they are raised
       * modestly (~0.10–0.22) while staying subtle. Inline SVG with existing
       * color tokens only — no new dependency.
       */}
      <svg
        className="hero__motif"
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 600 600"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Lower-right anchor: largest soft shape, pushed off the bottom-right edge. */}
        <circle cx="610" cy="560" r="200" fill="var(--color-bright-cyan)" opacity="0.14" />
        {/* Mid-right accent: concentric to the first, kept to the right edge. */}
        <circle cx="620" cy="470" r="120" fill="var(--color-teal-cyan)" opacity="0.12" />
        {/* Thin linework hugging the bottom-right corner, away from the copy. */}
        <line x1="600" y1="300" x2="420" y2="600" stroke="var(--color-bright-cyan)" strokeWidth="1.5" opacity="0.2" />
        <line x1="600" y1="380" x2="500" y2="600" stroke="var(--color-teal-cyan)" strokeWidth="1.5" opacity="0.16" />
        <line x1="560" y1="240" x2="420" y2="520" stroke="var(--color-primary-blue)" strokeWidth="1" opacity="0.12" />

        {/* Small outlined ring sparkle, upper-right edge. */}
        <circle cx="540" cy="90" r="26" fill="none" stroke="var(--color-primary-blue)" strokeWidth="1.5" opacity="0.16" />

        {/* Plus/star sparkles scattered along the right and bottom edges. */}
        <g stroke="var(--color-bright-cyan)" strokeWidth="2" strokeLinecap="round" opacity="0.22">
          <line x1="560" y1="150" x2="560" y2="174" />
          <line x1="548" y1="162" x2="572" y2="162" />
        </g>
        <g stroke="var(--color-teal-cyan)" strokeWidth="2" strokeLinecap="round" opacity="0.2">
          <line x1="470" y1="560" x2="470" y2="580" />
          <line x1="460" y1="570" x2="480" y2="570" />
        </g>
        <g stroke="var(--color-primary-blue)" strokeWidth="2" strokeLinecap="round" opacity="0.16">
          <line x1="585" y1="430" x2="585" y2="448" />
          <line x1="576" y1="439" x2="594" y2="439" />
        </g>

        {/* Tiny solid dots for a dusting of sparkle near the corners. */}
        <circle cx="505" cy="505" r="4" fill="var(--color-bright-cyan)" opacity="0.22" />
        <circle cx="575" cy="520" r="3" fill="var(--color-teal-cyan)" opacity="0.2" />
        <circle cx="520" cy="40" r="3" fill="var(--color-bright-cyan)" opacity="0.18" />
      </svg>

      <div className="hero__inner">
        {/*
         * Logo header zone: a full-width quiet backing surface gives the
         * official logo a clear read against the gradient so it never floats on
         * the low-contrast cyan corner. It sits above the editorial grid.
         * Backing + spacing only; the asset, its alt, and intrinsic aspect
         * ratio are unchanged.
         */}
        <div className="hero__header">
          <div className="hero__logo-zone">
            <img
              className="hero__logo"
              src={eventLogo}
              alt="Logotipo oficial de AWS Community Day Guatemala"
            />
          </div>
        </div>

        {/*
         * Editorial grid: one column < 768px, two columns >= 768px. The left
         * column carries the reading order (eyebrow -> h1 -> copy -> error ->
         * actions); the right column is a visual-support placeholder that task
         * 3.2 will fill.
         */}
        <div className="hero__grid">
          <div className="hero__content">
            <p className="hero__context">Workshop de Kiro</p>

            <h1 id="hero-title" className="hero__title">
              Evoluciona una aplicación AWS real con Kiro
            </h1>

            <p className="hero__copy">
              Parte de una base funcional sobre AWS y aprende a guiar a Kiro con
              contexto, steering y specs para diseñar, extender e implementar una
              solución real. La meta no es salir con una demo, sino con una base
              que puedas seguir construyendo.
            </p>

            {error && error.message && (
              <div className="hero__error" role="alert">
                {error.message}
              </div>
            )}

            {/*
             * Actions row: the primary sign-in button is the dominant action
             * (filled surface, invokes the single signinRedirect() path via the
             * onSignIn prop); the secondary is a quiet in-page scroll link to
             * #workshop, clearly subordinate. No credential fields and no second
             * auth mechanism are introduced here. The trailing arrow on the
             * secondary link is decorative (aria-hidden) and only hints at the
             * scroll affordance.
             */}
            <div className="hero__actions">
              <button type="button" className="hero__cta" onClick={onSignIn}>
                Iniciar sesión
              </button>
              <a className="hero__secondary" href="#workshop">
                Explorar el workshop
                <span className="hero__secondary-arrow" aria-hidden="true">
                  {' '}
                  &rarr;
                </span>
              </a>
            </div>

            {/*
             * Foundation strip: a compact, non-interactive hint of the real
             * stack. Plain-text pills in a <ul>/<li> (not links or buttons), so
             * it is readable but keyboard-safe. Sits last in the left column and
             * stays visually subordinate to the headline/CTAs via small text and
             * a quiet token-based surface. Distinct from the right-column
             * foundation card (which pairs each service with its role). Labels
             * are short English technical names, acceptable per the Spanish copy
             * rule. Meaning is not conveyed by color alone.
             */}
            <ul className="hero__stack" aria-label="Tecnologías base del workshop">
              <li className="hero__stack-chip">React</li>
              <li className="hero__stack-chip">Cognito</li>
              <li className="hero__stack-chip">API Gateway</li>
              <li className="hero__stack-chip">Lambda</li>
              <li className="hero__stack-chip">CloudFront</li>
              <li className="hero__stack-chip">CDK</li>
              <li className="hero__stack-chip">OpenAPI</li>
            </ul>
          </div>

          {/*
           * Visual-support column: one restrained, additive block. A compact
           * "foundation" card gives a short labeled list of the real AWS base
           * (service -> one-word role) so the hero reads technical and concrete
           * without clutter. It is meaningful readable text (not decorative, so
           * not aria-hidden), styled only with existing tokens. Distinct from
           * the left-column chip strip (task 4.1): this pairs each service with
           * its role. On mobile it stacks below the actions (CSS single column).
           */}
          <aside className="hero__aside" aria-labelledby="hero-foundation-title">
            <div className="hero__foundation">
              <p id="hero-foundation-title" className="hero__foundation-title">
                Sobre esta base
              </p>
              <dl className="hero__foundation-list">
                <div className="hero__foundation-row">
                  <dt className="hero__foundation-term">React</dt>
                  <dd className="hero__foundation-role">Frontend</dd>
                </div>
                <div className="hero__foundation-row">
                  <dt className="hero__foundation-term">Cognito</dt>
                  <dd className="hero__foundation-role">Autenticación</dd>
                </div>
                <div className="hero__foundation-row">
                  <dt className="hero__foundation-term">API Gateway + Lambda</dt>
                  <dd className="hero__foundation-role">Backend</dd>
                </div>
                <div className="hero__foundation-row">
                  <dt className="hero__foundation-term">CloudFront</dt>
                  <dd className="hero__foundation-role">Entrega</dd>
                </div>
                <div className="hero__foundation-row">
                  <dt className="hero__foundation-term">CDK</dt>
                  <dd className="hero__foundation-role">Infraestructura</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};
