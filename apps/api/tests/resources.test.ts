/**
 * Integration tests for the local backend's /resources endpoints.
 *
 * Uses the same pattern as hello.test.ts: createApp + supertest.
 * The in-memory store is reset before each test via resetResourcesStore() to
 * guarantee isolation — a fresh makeApp() alone is not sufficient because the
 * resources array is module-scoped and shared across all app instances within
 * the same process.
 *
 * Requirements: R1, R2, R5, R16, R18
 */
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { resetResourcesStore } from '../src/features/resources/resources.routes.js';

function makeApp() {
  return createApp({ allowedOrigins: ['http://localhost:5173'] });
}

describe('GET /resources and POST /resources (local, no auth)', () => {
  let app: ReturnType<typeof makeApp>;

  beforeEach(() => {
    resetResourcesStore();
    app = makeApp();
  });

  // R2 — empty list
  it('GET /resources returns 200 and an empty array when the store is empty', async () => {
    const res = await request(app).get('/resources');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  // R1 — successful creation
  it('POST /resources with valid title and url returns 201 and the created resource', async () => {
    const payload = { title: 'AWS Docs', url: 'https://docs.aws.amazon.com' };
    const res = await request(app).post('/resources').send(payload);

    expect(res.status).toBe(201);
    expect(typeof res.body.resourceId).toBe('string');
    expect(res.body.resourceId.length).toBeGreaterThan(0);
    expect(res.body.title).toBe(payload.title);
    expect(res.body.url).toBe(payload.url);
    expect(typeof res.body.createdAt).toBe('string');
    // createdAt should be a valid ISO date string
    expect(isNaN(Date.parse(res.body.createdAt))).toBe(false);
  });

  // R5 — missing title validation
  it('POST /resources without title returns 400 with VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/resources')
      .send({ url: 'https://example.com' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      error: { code: 'VALIDATION_ERROR' },
    });
  });

  // R5 — missing url validation
  it('POST /resources without url returns 400 with VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/resources')
      .send({ title: 'Some Title' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      error: { code: 'VALIDATION_ERROR' },
    });
  });

  // R2 — list reflects created resources
  it('GET /resources returns the resources created in the same test', async () => {
    const first = { title: 'Kiro Docs', url: 'https://kiro.dev/docs' };
    const second = { title: 'AWS CDK', url: 'https://docs.aws.amazon.com/cdk' };

    await request(app).post('/resources').send(first);
    await request(app).post('/resources').send(second);

    const res = await request(app).get('/resources');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({ title: first.title, url: first.url });
    expect(res.body[1]).toMatchObject({ title: second.title, url: second.url });
  });

  // R16, R18 — non-regression: hello route still works
  it('GET /hello still returns 200 (non-regression)', async () => {
    const res = await request(app).get('/hello');

    expect(res.status).toBe(200);
  });
});
