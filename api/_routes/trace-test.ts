/**
 * Test endpoint for verifying Langfuse tracing
 *
 * This endpoint creates a test trace that should appear in the
 * Langfuse dashboard. Use it to verify that tracing is working
 * correctly after initial setup.
 *
 * @module api/_routes/trace-test
 */

import { Hono } from 'hono';
import { getLangfuse } from '../_lib/langfuse.js';
import { createChildLogger } from '../_lib/logger.js';

const log = createChildLogger('trace-test');

export const traceTest = new Hono();

/**
 * GET /api/trace-test
 *
 * Creates a test trace in Langfuse with sample generation data.
 * Returns the trace ID if successful, or an error if Langfuse is not configured.
 */
traceTest.get('/', c => {
  const langfuse = getLangfuse();

  if (!langfuse) {
    log.warn('Trace test called but Langfuse is not configured');
    return c.json(
      {
        success: false,
        error: 'Langfuse not configured',
        message: 'Set LANGFUSE_SECRET_KEY and LANGFUSE_PUBLIC_KEY to enable tracing',
      },
      503
    );
  }

  // Create a test trace
  const trace = langfuse.trace({
    name: 'trace-test-endpoint',
    metadata: {
      endpoint: '/api/trace-test',
      testType: 'verification',
      timestamp: new Date().toISOString(),
    },
  });

  // Add a sample generation to the trace
  trace.generation({
    name: 'test-generation',
    model: 'test-model',
    input: { message: 'This is a test input for Langfuse verification' },
    output: { response: 'Test trace created successfully' },
    usage: {
      input: 10,
      output: 5,
    },
    metadata: {
      purpose: 'Verify Langfuse integration is working',
    },
  });

  log.info({ traceId: trace.id }, 'Test trace created');

  return c.json({
    success: true,
    traceId: trace.id,
    message: 'Test trace created - check Langfuse dashboard',
    dashboardUrl: `${process.env.LANGFUSE_BASE_URL ?? 'http://localhost:3016'}/traces`,
  });
});
