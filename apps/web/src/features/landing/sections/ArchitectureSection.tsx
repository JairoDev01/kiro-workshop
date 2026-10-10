import './ArchitectureSection.css';

/**
 * Presentational "Architecture" section for the public landing.
 *
 * Represents the real AWS foundation present in the starter at a high level
 * (Requirement 6) through two labeled flows:
 *   1. Frontend delivery:   Browser → CloudFront → private S3 → React SPA
 *   2. Authenticated app:   React SPA → Cognito → API Gateway → Lambda
 *
 * The visualization is built purely from CSS, layout, typography and restrained
 * technical linework (styled nodes connected by CSS connectors). It deliberately
 * stays simple rather than becoming a detailed AWS reference diagram, and it does
 * NOT present DynamoDB or any other persistence as implemented storage.
 *
 * Accessibility: the flow is conveyed by DOM order and node text, not only by the
 * visual connectors. The arrow connectors between nodes are decorative and marked
 * aria-hidden="true". The <section> is an accessible landmark via aria-labelledby
 * pointing to its h2; each flow has an h3 label. No diagramming dependency, no
 * icon dependency, no new dependency, no emojis.
 */

interface FlowNode {
  /** Primary node label (service / component name). */
  label: string;
  /** Optional short qualifier shown beneath the label. */
  detail?: string;
}

interface Flow {
  /** Stable id used to link the flow heading to its region. */
  id: string;
  /** Human-readable flow label rendered as an h3. */
  title: string;
  /** Concise Spanish description of what the flow represents. */
  description: string;
  /** Ordered nodes; DOM order communicates the flow direction. */
  nodes: FlowNode[];
}

const FLOWS: Flow[] = [
  {
    id: 'architecture-flow-frontend',
    title: 'Entrega del frontend',
    description:
      'La aplicación React se sirve de forma segura: distribuida por CloudFront desde un bucket S3 privado.',
    nodes: [
      { label: 'Browser', detail: 'Visitante' },
      { label: 'CloudFront', detail: 'CDN' },
      { label: 'S3 privado', detail: 'Origen estático' },
      { label: 'React SPA', detail: 'Interfaz' },
    ],
  },
  {
    id: 'architecture-flow-app',
    title: 'Aplicación autenticada',
    description:
      'Una vez autenticada con Cognito, la SPA consume una API respaldada por API Gateway y Lambda.',
    nodes: [
      { label: 'React SPA', detail: 'Interfaz' },
      { label: 'Cognito', detail: 'Autenticación' },
      { label: 'API Gateway', detail: 'API' },
      { label: 'Lambda', detail: 'Lógica' },
    ],
  },
];

export const ArchitectureSection = () => {
  return (
    <section className="architecture" aria-labelledby="architecture-title">
      <div className="architecture__inner">
        <p className="architecture__eyebrow">Arquitectura</p>

        <h2 id="architecture-title" className="architecture__title">
          Una base de AWS real
        </h2>

        <p className="architecture__lead">
          No es un demo improvisado: partes de una arquitectura serverless real
          sobre AWS, lista para evolucionar.
        </p>

        <div className="architecture__flows">
          {FLOWS.map((flow) => (
            <section
              key={flow.id}
              className="architecture__flow"
              aria-labelledby={`${flow.id}-title`}
            >
              <h3 id={`${flow.id}-title`} className="architecture__flow-title">
                {flow.title}
              </h3>
              <p className="architecture__flow-desc">{flow.description}</p>

              <ol className="architecture__nodes">
                {flow.nodes.map((node, index) => (
                  <li className="architecture__node-item" key={node.label}>
                    <div className="architecture__node">
                      <span className="architecture__node-label">
                        {node.label}
                      </span>
                      {node.detail && (
                        <span className="architecture__node-detail">
                          {node.detail}
                        </span>
                      )}
                    </div>
                    {index < flow.nodes.length - 1 && (
                      <span
                        className="architecture__connector"
                        aria-hidden="true"
                      />
                    )}
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
};
