/**
 * API Response Types
 *
 * Shared type definitions for API responses.
 */

import type { ApiErrorCode } from './errors.js';

/**
 * Service status for health check services field
 */
export type ServiceStatus = 'connected' | 'disconnected';

/**
 * Health check services object
 */
export interface HealthServices {
  database: ServiceStatus;
}

/**
 * Health check response returned by GET /api/health
 */
export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  version: string;
  services?: HealthServices;
}

/**
 * Database test success response returned by GET /api/db/test
 */
export interface DbTestResponse {
  status: 'connected';
  timestamp: string;
  tables: {
    users: boolean;
    sessions: boolean;
  };
}

/**
 * Database test error response returned by GET /api/db/test
 */
export interface DbTestErrorResponse {
  status: 'error';
  message: string;
}

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
  error: {
    code: ApiErrorCode | 'INTERNAL_ERROR';
    message: string;
    details?: unknown;
  };
}

/**
 * Request body for POST /api/gemini/grounding
 */
export interface GeminiGroundingRequest {
  /** The user's text prompt for maps grounding */
  prompt: string;
  /** Enable widget in response (default: true) */
  enableWidget?: boolean;
  /** Latitude for location-based grounding */
  lat?: number;
  /** Longitude for location-based grounding */
  lng?: number;
  /** Custom system instruction for the model */
  systemInstruction?: string;
}

/**
 * Success response type - passes through external API response
 * The actual structure comes from Gemini API GenerateContentResponse
 */
export interface GeminiGroundingResponse {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
      role?: string;
    };
    finishReason?: string;
    groundingMetadata?: {
      webSearchQueries?: string[];
      searchEntryPoint?: {
        renderedContent?: string;
      };
      groundingSupports?: {
        segment?: {
          startIndex?: number;
          endIndex?: number;
          text?: string;
        };
        groundingChunkIndices?: number[];
        confidenceScores?: number[];
      }[];
    };
  }[];
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
  modelVersion?: string;
}

/**
 * Hono context variables for middleware data passing
 */
declare module 'hono' {
  interface ContextVariableMap {
    body: Record<string, unknown>;
    validatedRequest: GeminiGroundingRequest;
  }
}
