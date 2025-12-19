import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Hono } from 'hono';
import { dbTest } from '../_routes/db-test.js';
import { errorHandler } from '../_middleware/error-handler.js';
import { closeDb } from '../_db/index.js';
import type { DbTestResponse, DbTestErrorResponse } from '../_lib/types.js';

// Create test app with error handler
const createTestApp = () => {
  const app = new Hono();
  app.route('/api/db/test', dbTest);
  app.onError(errorHandler);
  return app;
};

// Skip tests if DATABASE_URL is not set
const skipIfNoDb = !process.env.DATABASE_URL;

describe.skipIf(skipIfNoDb)('Database Test Endpoint', () => {
  let app: Hono;

  beforeAll(() => {
    app = createTestApp();
  });

  afterAll(async () => {
    await closeDb();
  });

  describe('GET /api/db/test - Success Cases', () => {
    it('returns 200 with connected status when database is accessible', async () => {
      const res = await app.request('/api/db/test');

      expect(res.status).toBe(200);
      const body = (await res.json()) as DbTestResponse;
      expect(body.status).toBe('connected');
    });

    it('returns valid ISO 8601 timestamp', async () => {
      const res = await app.request('/api/db/test');
      const body = (await res.json()) as DbTestResponse;

      expect(body.timestamp).toBeDefined();
      const date = new Date(body.timestamp);
      expect(date.toISOString()).toBe(body.timestamp);
    });

    it('returns tables object with users and sessions status', async () => {
      const res = await app.request('/api/db/test');
      const body = (await res.json()) as DbTestResponse;

      expect(body.tables).toBeDefined();
      expect(typeof body.tables.users).toBe('boolean');
      expect(typeof body.tables.sessions).toBe('boolean');
    });

    it('reports true for existing tables after migrations', async () => {
      const res = await app.request('/api/db/test');
      const body = (await res.json()) as DbTestResponse;

      // After migrations, both tables should exist
      expect(body.tables.users).toBe(true);
      expect(body.tables.sessions).toBe(true);
    });

    it('returns application/json content type', async () => {
      const res = await app.request('/api/db/test');
      expect(res.headers.get('content-type')).toContain('application/json');
    });

    it('returns response with all required fields', async () => {
      const res = await app.request('/api/db/test');
      const body = (await res.json()) as DbTestResponse;

      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('tables');
      expect(body.tables).toHaveProperty('users');
      expect(body.tables).toHaveProperty('sessions');
    });
  });
});

// Unit tests for error response format (no database needed)
describe('Database Test Endpoint - Response Types', () => {
  it('DbTestResponse type has correct shape', () => {
    const response: DbTestResponse = {
      status: 'connected',
      timestamp: new Date().toISOString(),
      tables: {
        users: true,
        sessions: true,
      },
    };

    expect(response.status).toBe('connected');
    expect(response.tables.users).toBe(true);
    expect(response.tables.sessions).toBe(true);
  });

  it('DbTestErrorResponse type has correct shape', () => {
    const response: DbTestErrorResponse = {
      status: 'error',
      message: 'Connection refused',
    };

    expect(response.status).toBe('error');
    expect(response.message).toBe('Connection refused');
  });
});
