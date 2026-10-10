/**
 * GET /hello — the demo endpoint.
 *
 * Same contract the frontend already consumes
 * (`{ message, data: [{ id, name }], timestamp }`); only the hosting changed
 * from Lambda to this local Express server. Auth has been removed for local
 * mode, so the route is open; a demo user is injected upstream for any
 * owner-scoped logic added later.
 */
import { Router } from 'express';
import type { AuthedRequest } from '../../shared/http/middleware.js';

export function helloRouter(): Router {
  const router = Router();

  router.get('/hello', (_req: AuthedRequest, res) => {
    res.json({
      message: 'Hola desde el backend protegido (local)',
      data: [
        { id: 1, name: 'Elemento 1' },
        { id: 2, name: 'Elemento 2' },
        { id: 3, name: 'Elemento 3' },
      ],
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
