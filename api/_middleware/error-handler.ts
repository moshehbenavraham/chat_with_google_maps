/**
 * Error Handling Middleware
 *
 * Centralized error handling with consistent JSON response format.
 */

import type { Context, ErrorHandler } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { type ApiError, isApiError } from '../_lib/errors.js';
import type { ApiErrorResponse } from '../_lib/types.js';
import { createChildLogger } from '../_lib/logger.js';

const log = createChildLogger('error');

/**
 * Format an error into a consistent API error response.
 *
 * @param error - The error to format
 * @returns Formatted error response object
 */
function formatErrorResponse(error: unknown): {
  response: ApiErrorResponse;
  statusCode: ContentfulStatusCode;
} {
  // Handle known API errors
  if (isApiError(error)) {
    return {
      response: {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      statusCode: error.statusCode as ContentfulStatusCode,
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      response: {
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message,
        },
      },
      statusCode: 500,
    };
  }

  // Handle unknown error types
  return {
    response: {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    statusCode: 500,
  };
}

/**
 * Hono error handler middleware.
 * Catches all errors and returns consistent JSON responses.
 *
 * Usage:
 * ```typescript
 * app.onError(errorHandler);
 * ```
 */
export const errorHandler: ErrorHandler = (err: Error, c: Context) => {
  // Log error with structured data
  log.error(
    {
      name: err.name,
      message: err.message,
      stack: err.stack,
      path: c.req.path,
      method: c.req.method,
    },
    'unhandled error'
  );

  const { response, statusCode } = formatErrorResponse(err);

  return c.json(response, statusCode);
};

/**
 * Create an error response directly (for use in route handlers).
 *
 * @param c - Hono context
 * @param error - ApiError or standard Error
 * @returns JSON response
 */
export function sendError(c: Context, error: ApiError | Error) {
  const { response, statusCode } = formatErrorResponse(error);
  return c.json(response, statusCode);
}
