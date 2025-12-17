/**
 * API Response Types
 *
 * Shared type definitions for API responses.
 */

/**
 * Health check response returned by GET /api/health
 */
export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
}

/**
 * Standard API error response
 */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
