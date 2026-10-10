/**
 * Local backend server entrypoint.
 *
 * Fully local, no AWS, no auth. Starts the Express app serving the protected-
 * style routes (which are now open — see injectDevUser). Data is ephemeral.
 */
import { createApp } from './app.js';

const port = Number(process.env.API_PORT ?? 3001);
const allowedOrigins = (
  process.env.API_ALLOWED_ORIGINS ?? 'http://localhost:5173'
)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const app = createApp({ allowedOrigins });

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[api] Local backend listening on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`[api] GET http://localhost:${port}/hello  (auth disabled)`);
});
