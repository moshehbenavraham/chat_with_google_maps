/**
 * Observability API Routes
 *
 * Provides health monitoring and cost analytics endpoints for
 * the AI observability stack.
 *
 * @module api/_routes/observability
 */

import { Hono } from 'hono';
import { checkLangfuseHealth, isLangfuseAvailable } from '../_lib/safe-langfuse.js';
import type { LangfuseStatus } from '../_lib/safe-langfuse.js';
import { createChildLogger } from '../_lib/logger.js';

const log = createChildLogger('observability');

/**
 * Cost aggregation response structure.
 */
interface CostAggregationResponse {
  period: {
    start: string;
    end: string;
  };
  totalCost: number;
  byModel: Record<
    string,
    {
      calls: number;
      cost: number;
    }
  >;
  note?: string;
}

/**
 * Health check response structure.
 */
interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unavailable';
  timestamp: string;
  components: {
    langfuse: LangfuseStatus;
  };
  version?: string;
}

// Create Hono router for observability routes
export const observability = new Hono();

/**
 * GET /health - Health check endpoint
 *
 * Returns the health status of the observability stack.
 * - healthy: All components operational
 * - degraded: Some components unavailable but app functional
 * - unavailable: Critical components down
 *
 * Status codes:
 * - 200: healthy
 * - 503: degraded or unavailable
 */
observability.get('/health', async c => {
  log.debug('Health check requested');

  const langfuseStatus = await checkLangfuseHealth();

  const response: HealthResponse = {
    status: langfuseStatus.status,
    timestamp: new Date().toISOString(),
    components: {
      langfuse: langfuseStatus,
    },
    version: langfuseStatus.version,
  };

  // Log status
  if (langfuseStatus.status === 'healthy') {
    log.debug({ langfuseStatus: langfuseStatus.status }, 'Health check: healthy');
  } else {
    log.warn(
      { langfuseStatus: langfuseStatus.status, error: langfuseStatus.error },
      'Health check: degraded/unavailable'
    );
  }

  // Return appropriate status code
  const statusCode = langfuseStatus.status === 'healthy' ? 200 : 503;
  return c.json(response, statusCode);
});

/**
 * GET /costs - Cost aggregation endpoint
 *
 * Returns aggregated cost data for a given time period.
 * Query parameters:
 * - start: ISO date string for period start (default: 24 hours ago)
 * - end: ISO date string for period end (default: now)
 *
 * Note: Full cost aggregation requires querying Langfuse API or dashboard.
 * This endpoint provides basic structure and indicates Langfuse availability.
 */
observability.get('/costs', c => {
  log.debug('Cost aggregation requested');

  // Parse query parameters
  const startParam = c.req.query('start');
  const endParam = c.req.query('end');

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const start = startParam ? new Date(startParam) : yesterday;
  const end = endParam ? new Date(endParam) : now;

  // Validate dates
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return c.json(
      {
        error: 'Invalid date format',
        message: 'start and end must be valid ISO date strings',
      },
      400
    );
  }

  // Check if Langfuse is available
  const langfuseAvailable = isLangfuseAvailable();

  const response: CostAggregationResponse = {
    period: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
    totalCost: 0,
    byModel: {},
  };

  if (!langfuseAvailable) {
    response.note =
      'Langfuse not configured. Cost data unavailable. ' +
      'Configure LANGFUSE_SECRET_KEY and LANGFUSE_PUBLIC_KEY to enable cost tracking.';
    log.warn('Cost aggregation requested but Langfuse not available');
    return c.json(response, 200);
  }

  // Note: Full cost aggregation would require either:
  // 1. Querying Langfuse API directly (requires API access)
  // 2. Maintaining local cost cache updated by session traces
  // For now, return structure with note about using Langfuse dashboard
  response.note =
    'Cost aggregation is tracked in Langfuse. ' +
    'View detailed cost analytics at ' +
    (process.env.LANGFUSE_BASE_URL ?? 'http://localhost:3016') +
    '/dashboard';

  log.debug({ period: response.period }, 'Cost aggregation returned');
  return c.json(response, 200);
});

/**
 * GET /status - Quick status check
 *
 * Lightweight endpoint for load balancers and uptime monitors.
 * Does not perform deep health checks.
 */
observability.get('/status', c => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    langfuseConfigured: isLangfuseAvailable(),
  });
});
