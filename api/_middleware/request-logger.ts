/**
 * HTTP Request/Response Logging Middleware
 *
 * Logs:
 * - Incoming requests (method, path, query)
 * - Response status and timing
 * - Error details on failure
 */

import type { MiddlewareHandler } from 'hono';
import { createChildLogger } from '../_lib/logger.js';

const log = createChildLogger('http');

/**
 * Generate a short request ID for correlation.
 */
function generateRequestId(): string {
  return crypto.randomUUID().slice(0, 8);
}

/**
 * Request logging middleware.
 * Logs incoming requests and response timing/status.
 *
 * Usage:
 * ```typescript
 * app.use('*', requestLogger);
 * ```
 */
export const requestLogger: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  const { method } = c.req;
  const path = c.req.path;
  const requestId = generateRequestId();

  // Log incoming request
  log.info(
    {
      requestId,
      method,
      path,
      query: c.req.query(),
      userAgent: c.req.header('user-agent'),
    },
    'incoming request'
  );

  try {
    await next();
  } finally {
    const duration = Date.now() - start;
    const status = c.res.status;

    // Log response with appropriate level
    const logData = {
      requestId,
      method,
      path,
      status,
      duration,
    };

    if (status >= 500) {
      log.error(logData, 'request failed');
    } else if (status >= 400) {
      log.warn(logData, 'request error');
    } else {
      log.info(logData, 'request completed');
    }
  }
};
