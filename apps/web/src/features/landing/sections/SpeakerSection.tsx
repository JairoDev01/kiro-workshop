import speakerPhoto from '../../../assets/jaco-profile.jpg';
import './SpeakerSection.css';

/**
 * Presentational "About the Speaker" section for the public landing.
 *
 * Gives the workshop human credibility with a professional speaker block: a
 * circular portrait, the speaker name (Jaco, no invented surname), a concise
 * descriptor line, a verified Spanish biography, and an optional highlighted
 * quote. Social links are intentionally omitted because no real URLs exist in
 * repository-accessible content — no placeholder `#` links are inserted.
 *
 * Layout is a two-column editorial composition on wide screens that stacks on
 * narrow screens; the portrait stays circular and balanced at all breakpoints.
 * The <section> is an accessible landmark via aria-labelledby pointing to its h2.
 */
export const SpeakerSection = () => {
  return (
    <section className="speaker" aria-labelledby="speaker-title">
      <div className="speaker__inner">
        <div className="speaker__media">
          <div className="speaker__portrait">
            <img
              className="speaker__photo"
              src={speakerPhoto}
              alt="Fotografía de Jaco, speaker del workshop"
            />
          </div>
        </div>

        <div className="speaker__body">
          <p className="speaker__eyebrow">Sobre el speaker</p>

          <h2 id="speaker-title" className="speaker__name">
            Jaco
          </h2>

          <p className="speaker__descriptor">
            Cloud Architect · AWS · AI 
          </p>

          <div className="speaker__bio">
            <p>
              Con más de una década de trayectoria en AWS, Jaco se dedica a la
              arquitectura de soluciones en la nube: diseña y construye sistemas
              serverless, desarrolla soluciones y automatiza procesos para que la
              tecnología trabaje a favor del negocio.
            </p>
            <p>
              Su trabajo combina arquitectura cloud e inteligencia
              artificial, con el foco puesto en llevar las ideas desde el diseño
              hasta la implementación de forma deliberada y sostenible.
            </p>
          </div>

          <blockquote className="speaker__quote">
            La meta no es salir con una demo, sino con algo que puedas seguir
            construyendo.
          </blockquote>
        </div>
      </div>
    </section>
  );
};
