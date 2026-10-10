import './FinalCtaSection.css';

export interface FinalCtaSectionProps {
  /** Single sign-in path owned by LandingPage; wraps signinRedirect(). */
  onSignIn: () => void;
}

/**
 * Presentational closing CTA for the public landing.
 *
 * Like HeroSection, this owns no auth state: LandingPage passes the single
 * sign-in handler so there is exactly one sign-in path on the page. It renders
 * only concise closing copy and the primary `Iniciar sesión` button. It does
 * NOT introduce any username/password fields or a second auth mechanism. The
 * decorative gradient and motif are aria-hidden and use only existing tokens.
 */
export const FinalCtaSection = ({ onSignIn }: FinalCtaSectionProps) => {
  return (
    <section className="final-cta" aria-labelledby="final-cta-title">
      {/* Decorative geometric motif; conveys no meaning to assistive tech. */}
      <svg
        className="final-cta__motif"
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 600 400"
        preserveAspectRatio="xMidYMid slice"
      >
        <circle cx="520" cy="60" r="180" fill="var(--color-bright-cyan)" opacity="0.12" />
        <circle cx="80" cy="340" r="150" fill="var(--color-teal-cyan)" opacity="0.10" />
        <line x1="0" y1="120" x2="600" y2="40" stroke="var(--color-bright-cyan)" strokeWidth="1.5" opacity="0.16" />
      </svg>

      <div className="final-cta__inner">
        <h2 id="final-cta-title" className="final-cta__title">
          ¿Listo para empezar a construir?
        </h2>

        <p className="final-cta__copy">
          Inicia sesión y continúa evolucionando una aplicación AWS real con
          Kiro: lo que construyas hoy sigue siendo tuyo mañana.
        </p>

        <button type="button" className="final-cta__cta" onClick={onSignIn}>
          Iniciar sesión
        </button>
      </div>
    </section>
  );
};
