import './WorkshopSection.css';

/**
 * Presentational "Workshop / Central Idea" section for the public landing.
 *
 * Carries the editorial Spanish copy that communicates the central idea of the
 * workshop: participants evolve a real, deployable AWS application with Kiro,
 * starting from existing context rather than from scratch. It deliberately
 * avoids any terminal commands, setup instructions, or numbered exercise steps.
 *
 * The hero's secondary anchor links to `#workshop`, so the <section> exposes
 * that id and is an accessible landmark via aria-labelledby pointing to its h2.
 */
export const WorkshopSection = () => {
  return (
    <section id="workshop" className="workshop" aria-labelledby="workshop-title">
      <div className="workshop__inner">
        <p className="workshop__eyebrow">La idea central</p>

        <h2 id="workshop-title" className="workshop__title">
          Haz evolucionar una aplicación AWS real
        </h2>

        <div className="workshop__body">
          <p>
            No empezamos desde cero. Partimos de una aplicación AWS funcional y
            lista para desplegar, y la hacemos crecer con Kiro. El punto de
            partida no es una página en blanco: es contexto real sobre el que
            seguir construyendo.
          </p>
          <p>
            Antes de modificar una sola línea, Kiro recibe ese contexto. Entiende
            la aplicación —su propósito, su estructura y sus decisiones— y recién
            entonces propone cambios. Así el trabajo se siente como colaborar con
            alguien que ya conoce el proyecto, no como improvisar sobre lo
            desconocido.
          </p>
          <p>
            Trabajamos con Steering para fijar el contexto que guía a Kiro, con
            Specs para dar forma a lo que queremos lograr, y avanzamos del diseño
            a la implementación de manera deliberada. Cada paso construye sobre el
            anterior y mantiene la aplicación coherente.
          </p>
          <p>
            Y lo que construyes no termina cuando termina el evento. El resultado
            sigue siendo tuyo: una base real que puedes seguir haciendo evolucionar
            mucho después de hoy.
          </p>
        </div>
      </div>
    </section>
  );
};
