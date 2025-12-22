/**
 * Langfuse Tracing Middleware for Hono
 *
 * Automatically creates Langfuse traces for API requests, enabling
 * observability of AI operations including latency and error tracking.
 *
 * Features:
 * - Automatic trace creation with request metadata
 * - Context propagation via Hono's c.set/c.get
 * - Graceful degradation when Langfuse is not configured
 * - Error capture and trace finalization
 *
 * @module api/_middleware/langfuse-trace
 */

import type { MiddlewareHandler } from 'hono';
import { getLangfuse } from '../_lib/langfuse.js';
import { createChildLogger } from '../_lib/logger.js';

// Import types for Hono context augmentation
import '../_lib/types/langfuse.js';

const log = createChildLogger('langfuse-trace');

/**
 * Langfuse tracing middleware.
 *
 * Creates a trace for each request and makes it available via:
 * - `c.get('trace')` - The LangfuseTraceClient instance
 * - `c.get('traceId')` - The trace ID string for log correlation
 *
 * If Langfuse is not configured, the middleware sets both to null
 * and continues processing the request normally.
 *
 * @example
 * ```typescript
 * // Apply to all routes
 * app.use('*', langfuseTrace);
 *
 * // In route handler
 * app.post('/api/gemini/grounding', async (c) => {
 *   const trace = c.get('trace');
 *   if (trace) {
 *     const generation = trace.generation({
 *       name: 'gemini-grounding',
 *       model: 'gemini-2.5-flash',
 *       input: { prompt: '...' },
 *     });
 *     // ... make API call ...
 *     generation.end({ output: response });
 *   }
 * });
 * ```
 */
export const langfuseTrace: MiddlewareHandler = async (c, next) => {
  const langfuse = getLangfuse();

  // Graceful degradation: if Langfuse not configured, skip tracing
  if (!langfuse) {
    c.set('trace', null);
    c.set('traceId', null);
    return next();
  }

  const { method } = c.req;
  const path = c.req.path;
  const startTime = Date.now();

  // Create trace for this request
  const trace = langfuse.trace({
    name: `${method} ${path}`,
    metadata: {
      method,
      path,
      query: c.req.query(),
      userAgent: c.req.header('user-agent'),
    },
    tags: [method, 'api'],
  });

  // Set trace on context for use in route handlers
  c.set('trace', trace);
  c.set('traceId', trace.id);

  // Log trace creation for debugging
  log.debug({ traceId: trace.id, method, path }, 'Trace created');

  let error: Error | null = null;

  try {
    // Continue to route handler
    await next();
  } catch (err) {
    // Capture error for trace finalization
    error = err instanceof Error ? err : new Error(String(err));
    throw err;
  } finally {
    // Finalize trace with status and duration
    const duration = Date.now() - startTime;
    const status = c.res.status;

    const traceUpdate: {
      output?: { status: number; duration: number };
      metadata?: { error: string };
      level?: 'ERROR' | 'WARNING';
    } = {
      output: { status, duration },
    };

    // Mark trace as error if request failed
    if (error) {
      traceUpdate.metadata = { error: error.message };
      traceUpdate.level = 'ERROR';
    } else if (status >= 500) {
      traceUpdate.level = 'ERROR';
    } else if (status >= 400) {
      traceUpdate.level = 'WARNING';
    }

    trace.update(traceUpdate);

    log.debug({ traceId: trace.id, status, duration }, 'Trace finalized');
  }
};
