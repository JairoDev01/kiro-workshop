import './ChoosePathSection.css';

/**
 * Presentational "Choose Your Path" section for the public landing.
 *
 * Previews the engineering directions a participant could explore later with the
 * starter (Requirement 7). It presents five paths — Feature Builder, Backend /
 * API, Cloud / Infrastructure, DevOps / Platform and Kiro Advanced — each pairing
 * a short title with one concise Spanish line.
 *
 * These are framed as conceptual possibilities (directions to explore), NOT as
 * exercise instructions or setup steps (Requirement 7.3). The layout deliberately
 * avoids a repetitive generic "SaaS cards" grid (Requirement 7.4): paths render as
 * an editorial numbered list sharing a single surface, separated by light rules,
 * with a restrained CSS linework accent and consistent hierarchy. No emojis, no
 * icon dependency, no new dependency (Requirement 11).
 *
 * Accessibility: the <section> is an accessible landmark via aria-labelledby
 * pointing to its h2; each path title is an h3. The numeric accents are
 * decorative and marked aria-hidden="true".
 */

interface PathOption {
  /** Short path title (English kept for scannability, per task guidance). */
  title: string;
  /** One concise Spanish descriptive line framing the direction conceptually. */
  description: string;
}

const PATHS: PathOption[] = [
  {
    title: 'Feature Builder',
    description:
      'Diseña y agrega nuevas funcionalidades sobre la aplicación con especificaciones guiadas por Kiro.',
  },
  {
    title: 'Backend / API',
    description:
      'Extiende la lógica de negocio, los endpoints y los contratos de la API sin perder coherencia.',
  },
  {
    title: 'Cloud / Infrastructure',
    description:
      'Evoluciona la base serverless en AWS: infraestructura como código, recursos y despliegues.',
  },
  {
    title: 'DevOps / Platform',
    description:
      'Fortalece la automatización, los pipelines y la observabilidad que sostienen el proyecto.',
  },
  {
    title: 'Kiro Advanced',
    description:
      'Profundiza en Steering, Specs y flujos avanzados para sacar más provecho de Kiro.',
  },
];

export const ChoosePathSection = () => {
  return (
    <section className="choose-path" aria-labelledby="choose-path-title">
      <div className="choose-path__inner">
        <p className="choose-path__eyebrow">Caminos posibles</p>

        <h2 id="choose-path-title" className="choose-path__title">
          Choose Your Path
        </h2>

        <p className="choose-path__lead">
          Un mismo punto de partida abre varias direcciones de ingeniería que
          puedes explorar a tu ritmo, mucho más allá del taller.
        </p>

        <ol className="choose-path__list">
          {PATHS.map((path, index) => (
            <li className="choose-path__item" key={path.title}>
              <span className="choose-path__index" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="choose-path__body">
                <h3 className="choose-path__item-title">{path.title}</h3>
                <p className="choose-path__item-copy">{path.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
