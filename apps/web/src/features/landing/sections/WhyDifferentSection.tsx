import './WhyDifferentSection.css';

/**
 * Presentational "Why This Is Different" section for the public landing.
 *
 * Communicates why the workshop is not a disposable AI coding demo through four
 * concise pillars (Requirement 4.2): a real AWS foundation, AI working with
 * context, multiple engineering paths, and a result that remains reusable after
 * the event. Each pillar pairs a short title with one concise Spanish line.
 *
 * The layout is a restrained set of columns rather than a generic four-SaaS-card
 * grid: pillars share a single surface, separated by light rules and a subtle
 * CSS index accent, keeping consistent visual hierarchy. No emojis, no icon
 * dependency, no new dependency. The <section> is an accessible landmark via
 * aria-labelledby pointing to its h2; each pillar title is an h3.
 */

interface Pillar {
  /** Short pillar title (English kept for scannability, per task guidance). */
  title: string;
  /** One concise Spanish descriptive line. */
  description: string;
}

const PILLARS: Pillar[] = [
  {
    title: 'Real AWS Foundation',
    description:
      'Partes de una aplicación AWS real y desplegable, no de una página en blanco.',
  },
  {
    title: 'AI With Context',
    description:
      'Kiro entiende el proyecto antes de proponer cambios: trabaja con contexto, no a ciegas.',
  },
  {
    title: 'Multiple Engineering Paths',
    description:
      'Un mismo punto de partida abre múltiples caminos de ingeniería para seguir explorando.',
  },
  {
    title: 'Reusable After the Event',
    description:
      'Lo que construyes sigue siendo tuyo y reutilizable mucho después del evento.',
  },
];

export const WhyDifferentSection = () => {
  return (
    <section
      className="why-different"
      aria-labelledby="why-different-title"
    >
      <div className="why-different__inner">
        <p className="why-different__eyebrow">Por qué es diferente</p>

        <h2 id="why-different-title" className="why-different__title">
          No es un demo de IA desechable
        </h2>

        <ol className="why-different__pillars">
          {PILLARS.map((pillar, index) => (
            <li className="why-different__pillar" key={pillar.title}>
              <span className="why-different__index" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="why-different__pillar-body">
                <h3 className="why-different__pillar-title">{pillar.title}</h3>
                <p className="why-different__pillar-copy">{pillar.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
