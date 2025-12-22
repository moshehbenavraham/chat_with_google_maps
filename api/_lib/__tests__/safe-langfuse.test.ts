/**
 * Unit tests for safe-langfuse wrappers
 *
 * Tests graceful degradation behavior when Langfuse is
 * unavailable or experiencing errors.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  safeGetLangfuse,
  checkLangfuseHealth,
  safeExecute,
  safeFlushTraces,
  isLangfuseAvailable,
} from '../safe-langfuse.js';

// Mock the langfuse module
vi.mock('../langfuse.js', () => ({
  getLangfuse: vi.fn(),
  flushTraces: vi.fn(),
}));

// Import mocked functions
import { getLangfuse, flushTraces } from '../langfuse.js';

const mockGetLangfuse = vi.mocked(getLangfuse);
const mockFlushTraces = vi.mocked(flushTraces);

describe('safe-langfuse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch for health check tests
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('safeGetLangfuse', () => {
    it('should return success when Langfuse client is available', () => {
      const mockClient = { trace: vi.fn() };
      mockGetLangfuse.mockReturnValue(mockClient as never);

      const result = safeGetLangfuse();

      expect(result.success).toBe(true);
      expect(result.value).toBe(mockClient);
      expect(result.error).toBeUndefined();
    });

    it('should return failure when Langfuse is not configured', () => {
      mockGetLangfuse.mockReturnValue(null);

      const result = safeGetLangfuse();

      expect(result.success).toBe(false);
      expect(result.value).toBeUndefined();
      expect(result.error).toContain('not configured');
    });

    it('should catch errors during Langfuse initialization', () => {
      mockGetLangfuse.mockImplementation(() => {
        throw new Error('Connection refused');
      });

      const result = safeGetLangfuse();

      expect(result.success).toBe(false);
      expect(result.error).toContain('initialization failed');
      expect(result.error).toContain('Connection refused');
    });
  });

  describe('checkLangfuseHealth', () => {
    it('should return healthy status when Langfuse responds OK', async () => {
      mockGetLangfuse.mockReturnValue({ trace: vi.fn() } as never);
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'OK', version: '2.95.11' }),
      } as Response);

      const result = await checkLangfuseHealth();

      expect(result.status).toBe('healthy');
      expect(result.version).toBe('2.95.11');
      expect(result.error).toBeUndefined();
    });

    it('should return unavailable when Langfuse client not configured', async () => {
      mockGetLangfuse.mockReturnValue(null);

      const result = await checkLangfuseHealth();

      expect(result.status).toBe('unavailable');
      expect(result.error).toContain('not configured');
    });

    it('should return degraded when Langfuse returns non-OK status', async () => {
      mockGetLangfuse.mockReturnValue({ trace: vi.fn() } as never);
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 503,
      } as Response);

      const result = await checkLangfuseHealth();

      expect(result.status).toBe('degraded');
      expect(result.error).toContain('503');
    });

    it('should return degraded on fetch error', async () => {
      mockGetLangfuse.mockReturnValue({ trace: vi.fn() } as never);
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      const result = await checkLangfuseHealth();

      expect(result.status).toBe('unavailable');
      expect(result.error).toContain('Network error');
    });

    it('should include timestamp in all responses', async () => {
      mockGetLangfuse.mockReturnValue(null);

      const result = await checkLangfuseHealth();

      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp).getTime()).not.toBeNaN();
    });
  });

  describe('safeExecute', () => {
    it('should execute operation and return result when Langfuse available', async () => {
      const mockClient = { trace: vi.fn() };
      mockGetLangfuse.mockReturnValue(mockClient as never);

      const result = await safeExecute(_client => {
        return { traceId: 'test-123' };
      });

      expect(result.success).toBe(true);
      expect(result.value).toEqual({ traceId: 'test-123' });
    });

    it('should return failure when Langfuse not available', async () => {
      mockGetLangfuse.mockReturnValue(null);

      const result = await safeExecute(() => {
        return { traceId: 'test-123' };
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not configured');
    });

    it('should catch operation errors and return failure', async () => {
      const mockClient = { trace: vi.fn() };
      mockGetLangfuse.mockReturnValue(mockClient as never);

      const result = await safeExecute(() => {
        throw new Error('Operation failed');
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Operation failed');
    });

    it('should handle async operations', async () => {
      const mockClient = { trace: vi.fn() };
      mockGetLangfuse.mockReturnValue(mockClient as never);

      const result = await safeExecute(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return { data: 'async result' };
      });

      expect(result.success).toBe(true);
      expect(result.value).toEqual({ data: 'async result' });
    });
  });

  describe('safeFlushTraces', () => {
    it('should return success when flush succeeds', async () => {
      mockFlushTraces.mockResolvedValue(undefined);

      const result = await safeFlushTraces();

      expect(result.success).toBe(true);
      expect(mockFlushTraces).toHaveBeenCalled();
    });

    it('should return failure when flush throws error', async () => {
      mockFlushTraces.mockRejectedValue(new Error('Flush timeout'));

      const result = await safeFlushTraces();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Flush timeout');
    });
  });

  describe('isLangfuseAvailable', () => {
    it('should return true when Langfuse client is available', () => {
      mockGetLangfuse.mockReturnValue({ trace: vi.fn() } as never);

      expect(isLangfuseAvailable()).toBe(true);
    });

    it('should return false when Langfuse is not configured', () => {
      mockGetLangfuse.mockReturnValue(null);

      expect(isLangfuseAvailable()).toBe(false);
    });

    it('should return false when getLangfuse throws', () => {
      mockGetLangfuse.mockImplementation(() => {
        throw new Error('Config error');
      });

      expect(isLangfuseAvailable()).toBe(false);
    });
  });
});
