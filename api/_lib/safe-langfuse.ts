/**
 * Safe Langfuse Wrappers for Graceful Degradation
 *
 * Provides wrapper functions that ensure the application continues
 * functioning even when Langfuse is unavailable or experiencing errors.
 *
 * @module api/_lib/safe-langfuse
 */

import type { Langfuse } from 'langfuse';
import { getLangfuse, flushTraces } from './langfuse.js';
import { createChildLogger } from './logger.js';

const log = createChildLogger('safe-langfuse');

/**
 * Langfuse health status states.
 */
export type LangfuseHealthState = 'healthy' | 'degraded' | 'unavailable';

/**
 * Langfuse health status response.
 */
export interface LangfuseStatus {
  /** Current health state */
  status: LangfuseHealthState;
  /** ISO timestamp of health check */
  timestamp: string;
  /** Error message if status is not healthy */
  error?: string;
  /** Langfuse version if available */
  version?: string;
}

/**
 * Result of a safe Langfuse operation.
 */
export interface SafeLangfuseResult<T> {
  /** Whether the operation succeeded */
  success: boolean;
  /** The result value if successful */
  value?: T;
  /** Error message if operation failed */
  error?: string;
}

/**
 * Langfuse base URL from environment or default.
 */
const LANGFUSE_BASE_URL = process.env.LANGFUSE_BASE_URL ?? 'http://localhost:3016';

/**
 * Safely get the Langfuse client instance.
 *
 * Returns the client if available and configured, null otherwise.
 * Catches any errors during initialization.
 *
 * @returns SafeLangfuseResult containing the client or error info
 */
export function safeGetLangfuse(): SafeLangfuseResult<Langfuse> {
  try {
    const client = getLangfuse();

    if (!client) {
      return {
        success: false,
        error: 'Langfuse not configured (missing API keys)',
      };
    }

    return {
      success: true,
      value: client,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error({ error }, 'Failed to get Langfuse client');

    return {
      success: false,
      error: `Langfuse initialization failed: ${message}`,
    };
  }
}

/**
 * Check Langfuse health by calling the health endpoint.
 *
 * Makes a request to Langfuse's public health endpoint to verify
 * the service is running and accessible.
 *
 * @returns Promise resolving to LangfuseStatus
 */
export async function checkLangfuseHealth(): Promise<LangfuseStatus> {
  const timestamp = new Date().toISOString();

  try {
    // First check if client is configured
    const clientResult = safeGetLangfuse();
    if (!clientResult.success) {
      return {
        status: 'unavailable',
        timestamp,
        error: clientResult.error,
      };
    }

    // Check Langfuse health endpoint
    const healthUrl = `${LANGFUSE_BASE_URL}/api/public/health`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 5000); // 5 second timeout

    try {
      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          status: 'degraded',
          timestamp,
          error: `Langfuse returned status ${String(response.status)}`,
        };
      }

      const data = (await response.json()) as { status?: string; version?: string };

      if (data.status === 'OK') {
        return {
          status: 'healthy',
          timestamp,
          version: data.version,
        };
      }

      return {
        status: 'degraded',
        timestamp,
        error: `Langfuse status: ${String(data.status)}`,
        version: data.version,
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return {
          status: 'degraded',
          timestamp,
          error: 'Langfuse health check timed out',
        };
      }

      throw fetchError;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.warn({ error }, 'Langfuse health check failed');

    return {
      status: 'unavailable',
      timestamp,
      error: `Health check failed: ${message}`,
    };
  }
}

/**
 * Safely execute a Langfuse operation with error handling.
 *
 * Wraps any Langfuse operation to catch errors and return a
 * result object instead of throwing.
 *
 * @param operation - The async operation to execute
 * @returns Promise resolving to SafeLangfuseResult
 *
 * @example
 * ```typescript
 * const result = await safeExecute(async (client) => {
 *   return client.trace({ name: 'my-trace' });
 * });
 *
 * if (result.success) {
 *   console.log('Trace created:', result.value);
 * } else {
 *   console.log('Failed:', result.error);
 * }
 * ```
 */
export async function safeExecute<T>(
  operation: (client: Langfuse) => T | Promise<T>
): Promise<SafeLangfuseResult<T>> {
  const clientResult = safeGetLangfuse();

  if (!clientResult.success || !clientResult.value) {
    return {
      success: false,
      error: clientResult.error ?? 'Langfuse client not available',
    };
  }

  try {
    const result = await operation(clientResult.value);
    return {
      success: true,
      value: result,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error({ error }, 'Langfuse operation failed');

    return {
      success: false,
      error: `Operation failed: ${message}`,
    };
  }
}

/**
 * Safely flush Langfuse traces.
 *
 * Attempts to flush pending traces, but does not throw on failure.
 *
 * @returns Promise resolving to success/failure status
 */
export async function safeFlushTraces(): Promise<SafeLangfuseResult<void>> {
  try {
    await flushTraces();
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error({ error }, 'Failed to flush traces');

    return {
      success: false,
      error: `Flush failed: ${message}`,
    };
  }
}

/**
 * Check if Langfuse is available for tracing.
 *
 * Quick check that returns true if the client is configured,
 * without making a network request.
 *
 * @returns True if Langfuse client is available
 */
export function isLangfuseAvailable(): boolean {
  return safeGetLangfuse().success;
}
