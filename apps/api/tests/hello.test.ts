/**
 * Tests for the local backend's GET /hello.
 *
 * Auth has been removed: no token is required. The endpoint returns the hello
 * contract directly. A demo user is injected server-side (not asserted here).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

function makeApp() {
  return createApp({ allowedOrigins: ['http://localhost:5173'] });
}

describe('GET /hello (local, no auth)', () => {
  let app: ReturnType<typeof makeApp>;

  beforeEach(() => {
    app = makeApp();
  });

  it('returns 200 and the hello contract without any token', async () => {
    const res = await request(app).get('/hello');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      message: expect.stringContaining('backend protegido'),
      data: [
        { id: 1, name: 'Elemento 1' },
        { id: 2, name: 'Elemento 2' },
        { id: 3, name: 'Elemento 3' },
      ],
    });
    expect(typeof res.body.timestamp).toBe('string');
  });

  it('exposes a /health probe', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
