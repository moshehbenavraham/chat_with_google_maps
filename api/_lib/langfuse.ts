/**
 * Langfuse client wrapper for AI observability
 *
 * This module provides a singleton Langfuse client with:
 * - Environment-aware flush configuration (dev vs prod)
 * - Graceful shutdown handlers for SIGTERM/SIGINT
 * - Tracing utilities for the Hono backend
 *
 * @module api/_lib/langfuse
 */

import { Langfuse } from 'langfuse';
import { createChildLogger } from './logger.js';

const log = createChildLogger('langfuse');

// Environment detection
const isDev = process.env.NODE_ENV !== 'production';

// Validate required environment variables
function validateConfig(): {
  secretKey: string;
  publicKey: string;
  baseUrl: string;
} {
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const baseUrl = process.env.LANGFUSE_BASE_URL ?? 'http://localhost:3016';

  if (!secretKey || !publicKey) {
    log.warn(
      'Langfuse API keys not configured. Tracing will be disabled. ' +
        'Set LANGFUSE_SECRET_KEY and LANGFUSE_PUBLIC_KEY to enable tracing.'
    );
    return { secretKey: '', publicKey: '', baseUrl };
  }

  return { secretKey, publicKey, baseUrl };
}

// Singleton instance
let langfuseInstance: Langfuse | null = null;
let isShuttingDown = false;

/**
 * Get the Langfuse client singleton instance.
 *
 * Returns null if Langfuse is not configured (missing API keys).
 * The client is lazily initialized on first call.
 *
 * @returns Langfuse client instance or null if not configured
 */
export function getLangfuse(): Langfuse | null {
  if (langfuseInstance) {
    return langfuseInstance;
  }

  const config = validateConfig();

  if (!config.secretKey || !config.publicKey) {
    return null;
  }

  langfuseInstance = new Langfuse({
    secretKey: config.secretKey,
    publicKey: config.publicKey,
    baseUrl: config.baseUrl,
    // Environment-aware flush settings
    // Development: flush frequently for real-time debugging
    // Production: batch for efficiency
    flushAt: isDev ? 1 : 15,
    flushInterval: isDev ? 100 : 10000,
  });

  log.info(
    { baseUrl: config.baseUrl, mode: isDev ? 'development' : 'production' },
    'Langfuse client initialized'
  );

  return langfuseInstance;
}

/**
 * Flush all pending traces to Langfuse.
 *
 * Call this during graceful shutdown to ensure no trace data is lost.
 *
 * @returns Promise that resolves when flush is complete
 */
export async function flushTraces(): Promise<void> {
  if (!langfuseInstance) {
    return;
  }

  try {
    log.info('Flushing pending Langfuse traces...');
    await langfuseInstance.flushAsync();
    log.info('Langfuse traces flushed successfully');
  } catch (error) {
    log.error({ error }, 'Failed to flush Langfuse traces');
  }
}

/**
 * Shutdown the Langfuse client gracefully.
 *
 * This flushes pending traces and shuts down the client.
 * Safe to call multiple times.
 */
export async function shutdownLangfuse(): Promise<void> {
  if (isShuttingDown || !langfuseInstance) {
    return;
  }

  isShuttingDown = true;

  try {
    await flushTraces();
    await langfuseInstance.shutdownAsync();
    log.info('Langfuse client shutdown complete');
  } catch (error) {
    log.error({ error }, 'Error during Langfuse shutdown');
  }
}

// Register graceful shutdown handlers
function registerShutdownHandlers(): void {
  const handleShutdown = async (signal: string): Promise<void> => {
    log.info({ signal }, 'Received shutdown signal, flushing Langfuse traces');
    await shutdownLangfuse();
  };

  process.on('SIGTERM', () => {
    void handleShutdown('SIGTERM');
  });

  process.on('SIGINT', () => {
    void handleShutdown('SIGINT');
  });

  log.debug('Langfuse shutdown handlers registered');
}

// Register handlers on module load
registerShutdownHandlers();

// Re-export types for convenience
export type { LangfuseTraceClient, LangfuseGenerationClient } from 'langfuse';
export type { GeminiUsageMetadata, LangfuseUsage } from './types/langfuse.js';
