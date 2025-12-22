/**
 * Langfuse Tracing Context Types for Hono
 *
 * Extends Hono's ContextVariableMap to provide type-safe access
 * to Langfuse trace instances via c.get('trace') and c.get('traceId').
 *
 * @module api/_lib/types/langfuse
 */

import type { LangfuseTraceClient } from 'langfuse';

/**
 * Extend Hono's context variable map to include Langfuse tracing.
 *
 * This enables type-safe access:
 * - `c.get('trace')` - The Langfuse trace client for the request
 * - `c.get('traceId')` - The trace ID string for log correlation
 */
declare module 'hono' {
  interface ContextVariableMap {
    /**
     * Langfuse trace client for the current request.
     * Null when Langfuse is not configured or tracing is disabled.
     */
    trace: LangfuseTraceClient | null;

    /**
     * Langfuse trace ID for the current request.
     * Useful for correlating logs with traces in the dashboard.
     * Null when tracing is not active.
     */
    traceId: string | null;
  }
}

/**
 * Token usage from Gemini API response.
 * Maps to usageMetadata field in Gemini response.
 */
export interface GeminiUsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

/**
 * Langfuse generation usage format.
 * Used when calling generation.end() with usage data.
 */
export interface LangfuseUsage {
  input: number;
  output: number;
  totalCost?: number;
}
