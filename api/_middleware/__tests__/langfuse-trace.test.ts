/**
 * Unit tests for Langfuse tracing middleware
 *
 * Tests the middleware behavior for creating and managing traces.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import { langfuseTrace } from '../langfuse-trace.js';

// Mock the langfuse module
vi.mock('../../_lib/langfuse.js', () => ({
  getLangfuse: vi.fn(),
}));

// Mock the logger module
vi.mock('../../_lib/logger.js', () => ({
  createChildLogger: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

import { getLangfuse } from '../../_lib/langfuse.js';

describe('langfuse-trace middleware', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('when Langfuse is not configured', () => {
    beforeEach(() => {
      vi.mocked(getLangfuse).mockReturnValue(null);
    });

    it('should set trace and traceId to null', async () => {
      let capturedTrace: unknown;
      let capturedTraceId: unknown;

      app.use('*', langfuseTrace);
      app.get('/test', c => {
        capturedTrace = c.get('trace');
        capturedTraceId = c.get('traceId');
        return c.json({ ok: true });
      });

      const res = await app.request('/test');
      expect(res.status).toBe(200);
      expect(capturedTrace).toBeNull();
      expect(capturedTraceId).toBeNull();
    });

    it('should continue processing the request', async () => {
      app.use('*', langfuseTrace);
      app.get('/test', c => c.json({ message: 'success' }));

      const res = await app.request('/test');
      expect(res.status).toBe(200);

      const body: unknown = await res.json();
      expect(body).toEqual({ message: 'success' });
    });
  });

  describe('when Langfuse is configured', () => {
    const mockTrace = {
      id: 'test-trace-id-123',
      update: vi.fn(),
      generation: vi.fn(),
      span: vi.fn(),
    };

    const mockLangfuse = {
      trace: vi.fn(() => mockTrace),
    };

    beforeEach(() => {
      vi.mocked(getLangfuse).mockReturnValue(
        mockLangfuse as unknown as ReturnType<typeof getLangfuse>
      );
    });

    it('should create a trace with request metadata', async () => {
      app.use('*', langfuseTrace);
      app.get('/api/test', c => c.json({ ok: true }));

      await app.request('/api/test');

      expect(mockLangfuse.trace).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'GET /api/test',
          metadata: expect.objectContaining({
            method: 'GET',
            path: '/api/test',
          }) as unknown,
          tags: ['GET', 'api'],
        })
      );
    });

    it('should set trace on context', async () => {
      let capturedTrace: unknown;

      app.use('*', langfuseTrace);
      app.get('/test', c => {
        capturedTrace = c.get('trace');
        return c.json({ ok: true });
      });

      await app.request('/test');
      expect(capturedTrace).toBe(mockTrace);
    });

    it('should set traceId on context', async () => {
      let capturedTraceId: unknown;

      app.use('*', langfuseTrace);
      app.get('/test', c => {
        capturedTraceId = c.get('traceId');
        return c.json({ ok: true });
      });

      await app.request('/test');
      expect(capturedTraceId).toBe('test-trace-id-123');
    });

    it('should update trace with success status on completion', async () => {
      app.use('*', langfuseTrace);
      app.get('/test', c => c.json({ ok: true }));

      await app.request('/test');

      expect(mockTrace.update).toHaveBeenCalledWith(
        expect.objectContaining({
          output: expect.objectContaining({
            status: 200,
            duration: expect.any(Number) as unknown,
          }) as unknown,
        })
      );
    });

    it('should update trace with error level on 500 errors', async () => {
      app.use('*', langfuseTrace);
      app.get('/test', c => c.json({ error: 'Server error' }, 500));

      await app.request('/test');

      expect(mockTrace.update).toHaveBeenCalledWith(
        expect.objectContaining({
          output: expect.objectContaining({
            status: 500,
          }) as unknown,
          level: 'ERROR',
        })
      );
    });

    it('should update trace with warning level on 400 errors', async () => {
      app.use('*', langfuseTrace);
      app.get('/test', c => c.json({ error: 'Bad request' }, 400));

      await app.request('/test');

      expect(mockTrace.update).toHaveBeenCalledWith(
        expect.objectContaining({
          output: expect.objectContaining({
            status: 400,
          }) as unknown,
          level: 'WARNING',
        })
      );
    });

    it('should capture error in trace when handler throws', async () => {
      // Note: When Hono's error handler processes the error, the middleware
      // only sees the resulting 500 status, not the original error.
      // The error is captured in the trace as ERROR level based on status.
      const testError = new Error('Test error');

      app.use('*', langfuseTrace);
      app.get('/test', () => {
        throw testError;
      });
      // Add error handler to prevent unhandled error
      app.onError((err, c) => {
        return c.json({ error: err.message }, 500);
      });

      await app.request('/test');

      // Verify trace is marked as ERROR due to 500 status
      expect(mockTrace.update).toHaveBeenCalledWith(
        expect.objectContaining({
          output: expect.objectContaining({
            status: 500,
          }) as unknown,
          level: 'ERROR',
        })
      );
    });

    it('should include query parameters in trace metadata', async () => {
      app.use('*', langfuseTrace);
      app.get('/search', c => c.json({ ok: true }));

      await app.request('/search?q=test&page=1');

      expect(mockLangfuse.trace).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            query: expect.objectContaining({
              q: 'test',
              page: '1',
            }) as unknown,
          }) as unknown,
        })
      );
    });
  });
});
