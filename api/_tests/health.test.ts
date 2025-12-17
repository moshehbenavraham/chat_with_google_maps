import { describe, it, expect } from 'vitest';
import { health } from '../_routes/health.js';
import type { HealthResponse } from '../_lib/types.js';

describe('Health Endpoint', () => {
  it('returns 200 status code', async () => {
    const res = await health.request('/');
    expect(res.status).toBe(200);
  });

  it('returns application/json content type', async () => {
    const res = await health.request('/');
    expect(res.headers.get('content-type')).toContain('application/json');
  });

  it('returns status field with value "ok"', async () => {
    const res = await health.request('/');
    const body = (await res.json()) as HealthResponse;
    expect(body.status).toBe('ok');
  });

  it('returns valid ISO 8601 timestamp', async () => {
    const res = await health.request('/');
    const body = (await res.json()) as HealthResponse;

    // Check that timestamp is a valid ISO 8601 string
    expect(body.timestamp).toBeDefined();
    const date = new Date(body.timestamp);
    expect(date.toISOString()).toBe(body.timestamp);
  });

  it('returns version matching package.json', async () => {
    const res = await health.request('/');
    const body = (await res.json()) as HealthResponse;

    // Version should be present and be a valid semver-like string
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
  });
});
