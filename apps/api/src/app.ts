/**
 * Local backend application assembly.
 *
 * Builds the Express app with CORS for the Vite dev origin, a public health
 * check, and the protected feature routes behind the Cognito JWT guard. Kept
 * separate from `server.ts` so tests can exercise the app with supertest
 * without binding a port.
 */
import express, { type Express } from 'express';
import cors from 'cors';
import { injectDevUser } from './shared/http/middleware.js';
import { helloRouter } from './features/hello/hello.routes.js';

export interface AppConfig {
  /** Allowed browser origins for CORS (e.g. the Vite dev server). */
  allowedOrigins: string[];
}

export function createApp(config: AppConfig): Express {
  const app = express();

  app.use(
    cors({
      origin: config.allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Authorization', 'Content-Type'],
    }),
  );
  app.use(express.json());

  // Liveness probe.
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // AUTH REMOVED (local mode): no token is validated. A fixed demo user is
  // injected so handlers that read `req.user` (e.g. future owner-scoped
  // features) still work without any real authentication.
  app.use('/', injectDevUser(), helloRouter());

  return app;
}
