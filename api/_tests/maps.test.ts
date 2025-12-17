import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Hono } from 'hono';
import { maps } from '../_routes/maps.js';
import { errorHandler } from '../_middleware/error-handler.js';

// Create test app with error handler
const createTestApp = () => {
  const app = new Hono();
  app.route('/api/maps', maps);
  app.onError(errorHandler);
  return app;
};

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock environment variables
const originalEnv = process.env;

interface MockFetchCall {
  body?: string;
  headers?: Record<string, string>;
}

describe('Maps Proxy Routes', () => {
  let app: Hono;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = {
      ...originalEnv,
      GEMINI_API_KEY: 'test-gemini-api-key',
      GOOGLE_MAPS_API_KEY: 'test-maps-api-key',
    };
    app = createTestApp();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('POST /api/maps/grounding', () => {
    it('returns 200 with valid response on successful API call', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: 'Test response about places' }],
              role: 'model',
            },
            finishReason: 'STOP',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const res = await app.request('/api/maps/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Find coffee shops' }),
      });

      expect(res.status).toBe(200);
      const body: unknown = await res.json();
      expect(body).toEqual(mockResponse);
    });

    it('calls Gemini API with google_maps tool configuration', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ candidates: [] }),
      });

      await app.request('/api/maps/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Test prompt' }),
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const fetchCall = mockFetch.mock.calls[0] as [string, MockFetchCall];
      expect(fetchCall[1]).toBeDefined();
      const requestBody = JSON.parse(fetchCall[1].body ?? '{}') as Record<string, unknown>;

      expect(requestBody.tools).toEqual([{ google_maps: { enable_widget: true } }]);
    });

    it('includes location in request when lat/lng provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ candidates: [] }),
      });

      await app.request('/api/maps/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Find parks',
          lat: 40.7128,
          lng: -74.006,
        }),
      });

      const fetchCall = mockFetch.mock.calls[0] as [string, MockFetchCall];
      expect(fetchCall[1]).toBeDefined();
      const requestBody = JSON.parse(fetchCall[1].body ?? '{}') as Record<string, unknown>;

      expect(requestBody.toolConfig).toEqual({
        retrievalConfig: {
          latLng: {
            latitude: 40.7128,
            longitude: -74.006,
          },
        },
      });
    });

    it('returns 400 for missing prompt', async () => {
      const res = await app.request('/api/maps/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: { code: string } };
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 401 when API key is not configured', async () => {
      process.env.GEMINI_API_KEY = '';

      const res = await app.request('/api/maps/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Test prompt' }),
      });

      expect(res.status).toBe(401);
      const body = (await res.json()) as { error: { code: string } };
      expect(body.error.code).toBe('MISSING_API_KEY');
    });

    it('returns 502 when external API returns error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      });

      const res = await app.request('/api/maps/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Test prompt' }),
      });

      expect(res.status).toBe(502);
      const body = (await res.json()) as { error: { code: string } };
      expect(body.error.code).toBe('EXTERNAL_API_ERROR');
    });

    it('returns 504 on timeout', async () => {
      mockFetch.mockImplementationOnce(() => {
        return new Promise((_, reject) => {
          const error = new Error('Aborted');
          error.name = 'AbortError';
          reject(error);
        });
      });

      const res = await app.request('/api/maps/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Test prompt' }),
      });

      expect(res.status).toBe(504);
      const body = (await res.json()) as { error: { code: string } };
      expect(body.error.code).toBe('TIMEOUT_ERROR');
    });
  });
});
