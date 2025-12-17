/**
 * Custom Error Classes
 *
 * Error types for API proxy operations with consistent structure.
 */

/**
 * Error codes for API operations
 */
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'MISSING_API_KEY'
  | 'EXTERNAL_API_ERROR'
  | 'TIMEOUT_ERROR'
  | 'INTERNAL_ERROR';

/**
 * Base class for API errors with structured error information.
 */
export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, code: ApiErrorCode, statusCode: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintain proper stack trace in V8 environments
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- captureStackTrace may not exist in all environments
    Error.captureStackTrace?.(this, ApiError);
  }
}

/**
 * Validation error for invalid request data.
 * HTTP Status: 400 Bad Request
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Error thrown when required API key is not configured.
 * HTTP Status: 401 Unauthorized
 */
export class MissingApiKeyError extends ApiError {
  constructor(keyName: string) {
    super(`API key not configured: ${keyName}`, 'MISSING_API_KEY', 401);
    this.name = 'MissingApiKeyError';
  }
}

/**
 * Error from external API calls (Gemini, Maps, etc.).
 * HTTP Status: 502 Bad Gateway
 */
export class ExternalApiError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(message, 'EXTERNAL_API_ERROR', 502, details);
    this.name = 'ExternalApiError';
  }
}

/**
 * Timeout error for external API calls.
 * HTTP Status: 504 Gateway Timeout
 */
export class TimeoutError extends ApiError {
  constructor(service: string, timeoutMs: number) {
    super(`Request to ${service} timed out after ${String(timeoutMs)}ms`, 'TIMEOUT_ERROR', 504);
    this.name = 'TimeoutError';
  }
}

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
