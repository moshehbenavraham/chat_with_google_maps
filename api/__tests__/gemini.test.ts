import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Hono } from 'hono';
import { gemini } from '../routes/gemini.js';
import { errorHandler } from '../middleware/error-handler.js';

// Create test app with error handler
const createTestApp = () => {
  const app = new Hono();
  app.route('/api/gemini', gemini);
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

describe('Gemini Proxy Routes', () => {
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

  describe('POST /api/gemini/grounding - Success Cases', () => {
    it('returns 200 with valid response on successful API call', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: 'Test response about restaurants' }],
              role: 'model',
            },
            finishReason: 'STOP',
          },
        ],
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 20,
          totalTokenCount: 30,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const res = await app.request('/api/gemini/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Find restaurants near me' }),
      });

      expect(res.status).toBe(200);
      const body: unknown = await res.json();
      expect(body).toEqual(mockResponse);
    });

    it('passes prompt to Gemini API correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ candidates: [] }),
      });

      await app.request('/api/gemini/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Test prompt' }),
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const fetchCall = mockFetch.mock.calls[0] as [string, MockFetchCall];
      expect(fetchCall[1]).toBeDefined();
      const requestBody = JSON.parse(fetchCall[1].body ?? '{}') as Record<string, unknown>;

      expect(requestBody.contents).toEqual([{ parts: [{ text: 'Test prompt' }] }]);
    });

    it('includes lat/lng in request when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ candidates: [] }),
      });

      await app.request('/api/gemini/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Test prompt',
          lat: 37.7749,
          lng: -122.4194,
        }),
      });

      const fetchCall = mockFetch.mock.calls[0] as [string, MockFetchCall];
      expect(fetchCall[1]).toBeDefined();
      const requestBody = JSON.parse(fetchCall[1].body ?? '{}') as Record<string, unknown>;

      expect(requestBody.toolConfig).toEqual({
        retrievalConfig: {
          latLng: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
        },
      });
    });

    it('uses custom systemInstruction when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ candidates: [] }),
      });

      const customInstruction = 'Custom instruction for testing';

      await app.request('/api/gemini/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Test prompt',
          systemInstruction: customInstruction,
        }),
      });

      const fetchCall = mockFetch.mock.calls[0] as [string, MockFetchCall];
      expect(fetchCall[1]).toBeDefined();
      const requestBody = JSON.parse(fetchCall[1].body ?? '{}') as Record<string, unknown>;

      expect(requestBody.system_instruction).toEqual({
        parts: [{ text: customInstruction }],
      });
    });

    it('sets enableWidget in google_maps tool config', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ candidates: [] }),
      });

      await app.request('/api/gemini/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Test prompt',
          enableWidget: false,
        }),
      });

      const fetchCall = mockFetch.mock.calls[0] as [string, MockFetchCall];
      expect(fetchCall[1]).toBeDefined();
      const requestBody = JSON.parse(fetchCall[1].body ?? '{}') as Record<string, unknown>;

      expect(requestBody.tools).toEqual([{ google_maps: { enable_widget: false } }]);
    });

    it('includes API key in request header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ candidates: [] }),
      });

      await app.request('/api/gemini/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Test prompt' }),
      });

      const fetchCall = mockFetch.mock.calls[0] as [string, MockFetchCall];
      expect(fetchCall[1]).toBeDefined();
      const headers = fetchCall[1].headers;

      expect(headers?.['x-goog-api-key']).toBe('test-gemini-api-key');
    });
  });

  describe('POST /api/gemini/grounding - Error Cases', () => {
    it('returns 400 for missing Content-Type header', async () => {
      const res = await app.request('/api/gemini/grounding', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'Test' }),
      });

      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: { code: string; message: string } };
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 for missing prompt', async () => {
      const res = await app.request('/api/gemini/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: { code: string; message: string } };
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.message).toContain('prompt');
    });

    it('returns 400 for empty prompt', async () => {
      const res = await app.request('/api/gemini/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: '   ' }),
      });

      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: { code: string; message: string } };
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 for invalid lat value', async () => {
      const res = await app.request('/api/gemini/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Test', lat: 100, lng: 0 }),
      });

      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: { code: string; message: string } };
      expect(body.error.message).toContain('lat');
    });

    it('returns 400 for invalid lng value', async () => {
      const res = await app.request('/api/gemini/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Test', lat: 0, lng: 200 }),
      });

      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: { code: string; message: string } };
      expect(body.error.message).toContain('lng');
    });

    it('returns 400 when only lat is provided without lng', async () => {
      const res = await app.request('/api/gemini/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Test', lat: 37.7749 }),
      });

      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: { code: string; message: string } };
      expect(body.error.message).toContain('lat and lng');
    });

    it('returns 401 when API key is not configured', async () => {
      process.env.GEMINI_API_KEY = '';

      const res = await app.request('/api/gemini/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Test prompt' }),
      });

      expect(res.status).toBe(401);
      const body = (await res.json()) as { error: { code: string; message: string } };
      expect(body.error.code).toBe('MISSING_API_KEY');
    });

    it('returns 502 when external API returns error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Bad Request from Gemini'),
      });

      const res = await app.request('/api/gemini/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Test prompt' }),
      });

      expect(res.status).toBe(502);
      const body = (await res.json()) as { error: { code: string; message: string } };
      expect(body.error.code).toBe('EXTERNAL_API_ERROR');
    });

    it('returns 504 when external API times out', async () => {
      mockFetch.mockImplementationOnce(() => {
        return new Promise((_, reject) => {
          const error = new Error('Aborted');
          error.name = 'AbortError';
          reject(error);
        });
      });

      const res = await app.request('/api/gemini/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Test prompt' }),
      });

      expect(res.status).toBe(504);
      const body = (await res.json()) as { error: { code: string; message: string } };
      expect(body.error.code).toBe('TIMEOUT_ERROR');
    });
  });
});
