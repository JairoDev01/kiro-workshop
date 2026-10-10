import { useEffect, useState } from 'react';
import { listResources, createResource, type Resource } from '../../lib/api/resources-client';
import './SavedResourcesPanel.css';

/**
 * Saved Resources panel (Requirements R7, R8, R9, R10, R12, R13).
 *
 * Occupies `workspace__primary`, replacing `WorkspaceEmptyState`.
 *
 * Behavior:
 * - On mount: calls `listResources()` and populates the resource list.
 *   Network failures are caught and shown as an informative message — the
 *   component never crashes on a load error.
 * - Form: two labelled inputs (`Título`, `URL`) plus a submit button.
 *   While the POST is in-flight the submit button is disabled (R7).
 * - On successful submit: clears the form fields and reloads the list via
 *   `listResources()` so the new resource appears without a page reload (R9).
 * - On failed submit: surfaces the error message near the form (R10).
 * - Errors are announced in an `aria-live="assertive"` / `role="alert"`
 *   region so screen-reader users are informed without polling (R13).
 * - Resource links open in a new tab with `rel="noopener noreferrer"` (R13).
 * - Empty state: shown when the list is empty and there is no load error (R8).
 * - No `Authorization` header is sent — `resources-client` handles that (R12).
 */

export const SavedResourcesPanel = () => {
  // ── List state ──────────────────────────────────────────────────────────────
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ── Load resources on mount ─────────────────────────────────────────────────
  const loadResources = async () => {
    try {
      const data = await listResources();
      setResources(data);
      setLoadError(null);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar los recursos.',
      );
    }
  };

  useEffect(() => {
    void loadResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Form submission ─────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      await createResource(title, url);
      // Clear fields on success then reload the list.
      setTitle('');
      setUrl('');
      await loadResources();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'No se pudo guardar el recurso.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <section
      className="saved-resources-panel"
      aria-labelledby="saved-resources-heading"
    >
      <h2 id="saved-resources-heading" className="saved-resources-panel__title">
        Recursos guardados
      </h2>

      {/* ── Creation form ─────────────────────────────────────────────────── */}
      <form
        className="saved-resources-panel__form"
        onSubmit={(e) => void handleSubmit(e)}
        noValidate
      >
        <div className="saved-resources-panel__field">
          <label
            htmlFor="resource-title"
            className="saved-resources-panel__label"
          >
            Título
          </label>
          <input
            id="resource-title"
            type="text"
            className="saved-resources-panel__input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
            autoComplete="off"
          />
        </div>

        <div className="saved-resources-panel__field">
          <label
            htmlFor="resource-url"
            className="saved-resources-panel__label"
          >
            URL
          </label>
          <input
            id="resource-url"
            type="url"
            className="saved-resources-panel__input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={submitting}
            autoComplete="off"
          />
        </div>

        {/* Form error — announced immediately (role="alert" implies aria-live="assertive") */}
        {formError && (
          <p
            role="alert"
            className="saved-resources-panel__error"
          >
            {formError}
          </p>
        )}

        <button
          type="submit"
          className="saved-resources-panel__submit"
          disabled={submitting}
        >
          {submitting ? 'Guardando…' : 'Guardar recurso'}
        </button>
      </form>

      {/* ── Resource list ──────────────────────────────────────────────────── */}
      <div className="saved-resources-panel__list-region">
        {/* Load error — announced as an alert */}
        {loadError && (
          <p
            role="alert"
            className="saved-resources-panel__error"
          >
            {loadError}
          </p>
        )}

        {/* Empty state — only shown when list is empty and there is no load error */}
        {!loadError && resources.length === 0 && (
          <p className="saved-resources-panel__empty">
            No hay recursos guardados aún.
          </p>
        )}

        {/* Populated list */}
        {resources.length > 0 && (
          <ul className="saved-resources-panel__list">
            {resources.map((resource) => (
              <li
                key={resource.resourceId}
                className="saved-resources-panel__item"
              >
                <span className="saved-resources-panel__item-title">
                  {resource.title}
                </span>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="saved-resources-panel__item-link"
                >
                  {resource.url}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
