/**
 * Unit tests for observability routes
 *
 * Tests the health check and cost aggregation endpoints
 * for the AI observability stack.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { observability } from '../observability.js';
import type { LangfuseStatus } from '../../_lib/safe-langfuse.js';

// Mock the safe-langfuse module
vi.mock('../../_lib/safe-langfuse.js', () => ({
  checkLangfuseHealth: vi.fn(),
  isLangfuseAvailable: vi.fn(),
}));

// Import mocked functions
import { checkLangfuseHealth, isLangfuseAvailable } from '../../_lib/safe-langfuse.js';

const mockCheckLangfuseHealth = vi.mocked(checkLangfuseHealth);
const mockIsLangfuseAvailable = vi.mocked(isLangfuseAvailable);

// Type definitions for response data
interface HealthResponse {
  status: string;
  timestamp: string;
  components: {
    langfuse: LangfuseStatus;
  };
  version?: string;
}

interface CostResponse {
  period: {
    start: string;
    end: string;
  };
  totalCost: number;
  byModel: Record<string, { calls: number; cost: number }>;
  note?: string;
  error?: string;
}

interface StatusResponse {
  status: string;
  timestamp: string;
  langfuseConfigured: boolean;
}

describe('observability routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /health', () => {
    it('should return 200 and healthy status when Langfuse is healthy', async () => {
      mockCheckLangfuseHealth.mockResolvedValue({
        status: 'healthy',
        timestamp: '2025-01-15T12:00:00.000Z',
        version: '2.95.11',
      });

      const res = await observability.request('/health');
      const data = (await res.json()) as HealthResponse;

      expect(res.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.components.langfuse.status).toBe('healthy');
      expect(data.version).toBe('2.95.11');
    });

    it('should return 503 and degraded status when Langfuse is degraded', async () => {
      mockCheckLangfuseHealth.mockResolvedValue({
        status: 'degraded',
        timestamp: '2025-01-15T12:00:00.000Z',
        error: 'Connection timeout',
      });

      const res = await observability.request('/health');
      const data = (await res.json()) as HealthResponse;

      expect(res.status).toBe(503);
      expect(data.status).toBe('degraded');
      expect(data.components.langfuse.error).toBe('Connection timeout');
    });

    it('should return 503 and unavailable status when Langfuse is unavailable', async () => {
      mockCheckLangfuseHealth.mockResolvedValue({
        status: 'unavailable',
        timestamp: '2025-01-15T12:00:00.000Z',
        error: 'Langfuse not configured',
      });

      const res = await observability.request('/health');
      const data = (await res.json()) as HealthResponse;

      expect(res.status).toBe(503);
      expect(data.status).toBe('unavailable');
    });

    it('should include timestamp in response', async () => {
      mockCheckLangfuseHealth.mockResolvedValue({
        status: 'healthy',
        timestamp: '2025-01-15T12:00:00.000Z',
      });

      const res = await observability.request('/health');
      const data = (await res.json()) as HealthResponse;

      expect(data.timestamp).toBeDefined();
      expect(new Date(data.timestamp).getTime()).not.toBeNaN();
    });
  });

  describe('GET /costs', () => {
    it('should return cost aggregation structure with default period', async () => {
      mockIsLangfuseAvailable.mockReturnValue(true);

      const res = await observability.request('/costs');
      const data = (await res.json()) as CostResponse;

      expect(res.status).toBe(200);
      expect(data.period).toBeDefined();
      expect(data.period.start).toBeDefined();
      expect(data.period.end).toBeDefined();
      expect(data.totalCost).toBe(0);
      expect(data.byModel).toEqual({});
    });

    it('should accept custom date range', async () => {
      mockIsLangfuseAvailable.mockReturnValue(true);

      const start = '2025-01-01T00:00:00.000Z';
      const end = '2025-01-15T00:00:00.000Z';

      const res = await observability.request(`/costs?start=${start}&end=${end}`);
      const data = (await res.json()) as CostResponse;

      expect(res.status).toBe(200);
      expect(data.period.start).toBe(start);
      expect(data.period.end).toBe(end);
    });

    it('should return 400 for invalid date format', async () => {
      mockIsLangfuseAvailable.mockReturnValue(true);

      const res = await observability.request('/costs?start=invalid-date');
      const data = (await res.json()) as CostResponse;

      expect(res.status).toBe(400);
      expect(data.error).toContain('Invalid date format');
    });

    it('should include note when Langfuse is unavailable', async () => {
      mockIsLangfuseAvailable.mockReturnValue(false);

      const res = await observability.request('/costs');
      const data = (await res.json()) as CostResponse;

      expect(res.status).toBe(200);
      expect(data.note).toContain('Langfuse not configured');
      expect(data.totalCost).toBe(0);
    });

    it('should include dashboard link when Langfuse is available', async () => {
      mockIsLangfuseAvailable.mockReturnValue(true);

      const res = await observability.request('/costs');
      const data = (await res.json()) as CostResponse;

      expect(res.status).toBe(200);
      expect(data.note).toContain('Langfuse');
      expect(data.note).toContain('dashboard');
    });
  });

  describe('GET /status', () => {
    it('should return quick status check', async () => {
      mockIsLangfuseAvailable.mockReturnValue(true);

      const res = await observability.request('/status');
      const data = (await res.json()) as StatusResponse;

      expect(res.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.timestamp).toBeDefined();
      expect(data.langfuseConfigured).toBe(true);
    });

    it('should indicate Langfuse not configured', async () => {
      mockIsLangfuseAvailable.mockReturnValue(false);

      const res = await observability.request('/status');
      const data = (await res.json()) as StatusResponse;

      expect(res.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.langfuseConfigured).toBe(false);
    });
  });
});
