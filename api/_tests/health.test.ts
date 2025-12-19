import { describe, it, expect, afterAll } from 'vitest';
import { health } from '../_routes/health.js';
import { closeDb } from '../_db/index.js';
import type { HealthResponse } from '../_lib/types.js';

// Skip database tests if DATABASE_URL is not set
const skipIfNoDb = !process.env.DATABASE_URL;

describe('Health Endpoint - Basic', () => {
  it('returns 200 status code', async () => {
    const res = await health.request('/');
    expect(res.status).toBe(200);
  });

  it('returns application/json content type', async () => {
    const res = await health.request('/');
    expect(res.headers.get('content-type')).toContain('application/json');
  });

  it('returns valid ISO 8601 timestamp', async () => {
    const res = await health.request('/');
    const body = (await res.json()) as HealthResponse;

    expect(body.timestamp).toBeDefined();
    const date = new Date(body.timestamp);
    expect(date.toISOString()).toBe(body.timestamp);
  });

  it('returns version matching semver format', async () => {
    const res = await health.request('/');
    const body = (await res.json()) as HealthResponse;

    expect(body.version).toBeDefined();
    expect(typeof body.version).toBe('string');
    expect(body.version).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('returns response with all required fields', async () => {
    const res = await health.request('/');
    const body = (await res.json()) as HealthResponse;

    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('version');
    expect(body).toHaveProperty('services');
  });

  it('returns services object with database field', async () => {
    const res = await health.request('/');
    const body = (await res.json()) as HealthResponse;

    expect(body.services).toBeDefined();
    expect(body.services).toHaveProperty('database');
    expect(['connected', 'disconnected']).toContain(body.services?.database);
  });
});

describe.skipIf(skipIfNoDb)('Health Endpoint - Database Connected', () => {
  afterAll(async () => {
    await closeDb();
  });

  it('returns status "ok" when database is connected', async () => {
    const res = await health.request('/');
    const body = (await res.json()) as HealthResponse;
    expect(body.status).toBe('ok');
  });

  it('returns services.database as "connected"', async () => {
    const res = await health.request('/');
    const body = (await res.json()) as HealthResponse;

    expect(body.services?.database).toBe('connected');
  });
});

// Type tests (no database needed)
describe('Health Response Types', () => {
  it('HealthResponse type supports ok status', () => {
    const response: HealthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.0.7',
      services: {
        database: 'connected',
      },
    };

    expect(response.status).toBe('ok');
    expect(response.services?.database).toBe('connected');
  });

  it('HealthResponse type supports degraded status', () => {
    const response: HealthResponse = {
      status: 'degraded',
      timestamp: new Date().toISOString(),
      version: '0.0.7',
      services: {
        database: 'disconnected',
      },
    };

    expect(response.status).toBe('degraded');
    expect(response.services?.database).toBe('disconnected');
  });

  it('HealthResponse type supports optional services', () => {
    const response: HealthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.0.7',
    };

    expect(response.services).toBeUndefined();
  });
});
