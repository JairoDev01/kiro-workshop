/**
 * Tests for SavedResourcesPanel (Requirements R7, R8, R9, R10, R17).
 *
 * Verifies:
 * - R8:  Empty state is shown when `listResources` returns an empty array.
 * - R8:  Resources (title + url) are rendered when `listResources` returns data.
 * - R7:  Submitting the form calls `createResource` with the correct arguments.
 * - R9:  After a successful `createResource`, `listResources` is called again.
 * - R10: When `createResource` rejects, a visible error message is displayed.
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SavedResourcesPanel } from './SavedResourcesPanel';

// ── Mock the API client ────────────────────────────────────────────────────────
vi.mock('../../lib/api/resources-client', () => ({
  listResources: vi.fn(),
  createResource: vi.fn(),
}));

// Import the mocked references so we can control their values per-test.
import { listResources, createResource } from '../../lib/api/resources-client';

const mockListResources = vi.mocked(listResources);
const mockCreateResource = vi.mocked(createResource);

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeResource = (id: string, title: string, url: string) => ({
  resourceId: id,
  title,
  url,
  createdAt: '2024-01-01T00:00:00.000Z',
});

const renderPanel = () => render(<SavedResourcesPanel />);

// Fill and submit the creation form.
const fillAndSubmit = (title: string, url: string) => {
  fireEvent.change(screen.getByLabelText('Título'), {
    target: { value: title },
  });
  fireEvent.change(screen.getByLabelText('URL'), {
    target: { value: url },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar recurso' }));
};

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('SavedResourcesPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // R8 — empty state
  it('shows the empty state when listResources returns an empty array', async () => {
    mockListResources.mockResolvedValue([]);

    renderPanel();

    await waitFor(() => {
      expect(
        screen.getByText('No hay recursos guardados aún.'),
      ).toBeInTheDocument();
    });
  });

  // R8 — populated list renders title and url for each resource
  it('renders title and url for each resource when the list is non-empty', async () => {
    mockListResources.mockResolvedValue([
      makeResource('r1', 'AWS Docs', 'https://docs.aws.amazon.com'),
      makeResource('r2', 'Kiro Docs', 'https://kiro.dev/docs'),
    ]);

    renderPanel();

    await waitFor(() => {
      expect(screen.getByText('AWS Docs')).toBeInTheDocument();
      expect(
        screen.getByText('https://docs.aws.amazon.com'),
      ).toBeInTheDocument();
      expect(screen.getByText('Kiro Docs')).toBeInTheDocument();
      expect(screen.getByText('https://kiro.dev/docs')).toBeInTheDocument();
    });

    // Empty state must NOT appear when there are resources.
    expect(
      screen.queryByText('No hay recursos guardados aún.'),
    ).not.toBeInTheDocument();
  });

  // R7 — form submission calls createResource with the typed values
  it('calls createResource with the correct title and url on valid submit', async () => {
    mockListResources.mockResolvedValue([]);
    mockCreateResource.mockResolvedValue(
      makeResource('r3', 'My Link', 'https://example.com'),
    );

    renderPanel();

    // Wait for the initial load to settle.
    await waitFor(() => expect(mockListResources).toHaveBeenCalledTimes(1));

    fillAndSubmit('My Link', 'https://example.com');

    await waitFor(() => {
      expect(mockCreateResource).toHaveBeenCalledWith(
        'My Link',
        'https://example.com',
      );
    });
  });

  // R9 — list is reloaded after a successful createResource
  it('calls listResources again after a successful createResource', async () => {
    const created = makeResource(
      'r4',
      'New Resource',
      'https://new.example.com',
    );
    mockListResources
      .mockResolvedValueOnce([]) // initial load
      .mockResolvedValueOnce([created]); // reload after create

    mockCreateResource.mockResolvedValue(created);

    renderPanel();

    // Wait for the initial load.
    await waitFor(() => expect(mockListResources).toHaveBeenCalledTimes(1));

    fillAndSubmit('New Resource', 'https://new.example.com');

    // listResources must be called a second time (the reload after create).
    await waitFor(() => {
      expect(mockListResources).toHaveBeenCalledTimes(2);
    });

    // The freshly loaded resource should now appear in the list.
    expect(screen.getByText('New Resource')).toBeInTheDocument();
  });

  // R10 — error from createResource is displayed to the user
  it('shows an error message when createResource fails', async () => {
    mockListResources.mockResolvedValue([]);
    mockCreateResource.mockRejectedValue(
      new Error('No se pudo guardar el recurso.'),
    );

    renderPanel();

    await waitFor(() => expect(mockListResources).toHaveBeenCalledTimes(1));

    fillAndSubmit('Bad Resource', 'https://bad.example.com');

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('No se pudo guardar el recurso.');
    });
  });
});
