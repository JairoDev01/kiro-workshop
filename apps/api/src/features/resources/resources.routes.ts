/**
 * Saved Resources routes — local in-memory implementation.
 *
 * Exposes:
 *   GET  /resources  → returns the full in-memory list (200)
 *   POST /resources  → validates title + url, creates a resource (201)
 *                      or returns 400 VALIDATION_ERROR on bad input
 *
 * Data is stored only in the process memory; restarting the API clears the
 * list. No authentication is required (R3, R12).
 */
import { Router, type Request, type Response } from 'express';

export interface Resource {
  resourceId: string;
  title: string;
  url: string;
  createdAt: string;
}

// In-memory store — persists for the lifetime of the running process (R4).
const resources: Resource[] = [];

/**
 * Clears the in-memory store. Exported for test isolation only; not intended
 * for production use.
 */
export function resetResourcesStore(): void {
  resources.splice(0, resources.length);
}

export function resourcesRouter(): Router {
  const router = Router();

  // R2 — List resources
  router.get('/resources', (_req: Request, res: Response) => {
    res.status(200).json(resources);
  });

  // R1 — Create a resource
  router.post('/resources', (req: Request, res: Response) => {
    const { title, url } = req.body ?? {};

    if (typeof title !== 'string' || title.trim() === '') {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'El campo "title" es requerido y no puede estar vacío.',
        },
      });
      return;
    }

    if (typeof url !== 'string' || url.trim() === '') {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'El campo "url" es requerido y no puede estar vacío.',
        },
      });
      return;
    }

    const resource: Resource = {
      resourceId: crypto.randomUUID(),
      title: title.trim(),
      url: url.trim(),
      createdAt: new Date().toISOString(),
    };

    resources.push(resource);

    res.status(201).json(resource);
  });

  return router;
}
