/**
 * Live Trace Routes for WebSocket Session Events
 *
 * Provides endpoints for frontend to report voice session events
 * that are recorded as Langfuse traces and spans.
 *
 * Endpoints:
 * - POST /api/live/trace/event - Record a session event
 * - POST /api/live/trace/end - End a session and get summary
 *
 * @module api/_routes/live-trace
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { recordEvent, endSession, hasSession } from '../_lib/session-trace-manager.js';
import { createChildLogger } from '../_lib/logger.js';
import type { LiveTraceEndResponse } from '../_lib/types/live-trace.js';

const log = createChildLogger('live-trace');

// Validation schemas
const eventTypeSchema = z.enum(['turn_start', 'turn_complete', 'tool_call', 'tool_result']);

const turnStartDataSchema = z.object({
  turnNumber: z.number().int().positive(),
  userTranscript: z.string(),
});

const turnCompleteDataSchema = z.object({
  turnNumber: z.number().int().positive(),
  aiTranscript: z.string(),
  durationMs: z.number().int().nonnegative(),
});

const toolCallDataSchema = z.object({
  turnNumber: z.number().int().positive(),
  toolName: z.string().min(1),
  toolArgs: z.record(z.string(), z.unknown()),
});

const toolResultDataSchema = z.object({
  turnNumber: z.number().int().positive(),
  toolName: z.string().min(1),
  result: z.unknown(),
  durationMs: z.number().int().nonnegative(),
});

const eventRequestSchema = z.object({
  sessionId: z.uuid(),
  type: eventTypeSchema,
  timestamp: z.iso.datetime(),
  data: z.union([
    turnStartDataSchema,
    turnCompleteDataSchema,
    toolCallDataSchema,
    toolResultDataSchema,
  ]),
});

const endRequestSchema = z.object({
  sessionId: z.uuid(),
  reason: z.enum(['user_disconnect', 'error', 'timeout']),
});

// Create router
const liveTrace = new Hono();

/**
 * POST /api/live/trace/event
 *
 * Record a session event (turn start, turn complete, tool call, tool result).
 * This is a fire-and-forget endpoint - returns 204 immediately.
 *
 * Body:
 * {
 *   "sessionId": "uuid",
 *   "type": "turn_start" | "turn_complete" | "tool_call" | "tool_result",
 *   "timestamp": "ISO datetime",
 *   "data": { ... event-specific data ... }
 * }
 *
 * Returns: 204 No Content
 */
liveTrace.post('/event', async c => {
  try {
    const body: unknown = await c.req.json();

    // Validate request
    const parseResult = eventRequestSchema.safeParse(body);
    if (!parseResult.success) {
      log.debug({ errors: parseResult.error.issues }, 'Invalid event request');
      // Still return 204 - don't fail the client for invalid events
      return c.body(null, 204);
    }

    const { sessionId, type, timestamp, data } = parseResult.data;

    // Check if session exists
    if (!hasSession(sessionId)) {
      log.debug({ sessionId, type }, 'Event for unknown session');
      return c.body(null, 204);
    }

    // Record the event (fire-and-forget)
    recordEvent(sessionId, type, data, timestamp);

    return c.body(null, 204);
  } catch (error) {
    // Log error but still return 204 - don't fail the client
    log.error({ error }, 'Error processing event');
    return c.body(null, 204);
  }
});

/**
 * POST /api/live/trace/end
 *
 * End a session and get summary metrics.
 *
 * Body:
 * {
 *   "sessionId": "uuid",
 *   "reason": "user_disconnect" | "error" | "timeout"
 * }
 *
 * Returns:
 * {
 *   "traceId": "langfuse-trace-id",
 *   "summary": {
 *     "totalTurns": 5,
 *     "totalToolCalls": 3,
 *     "durationMs": 45000
 *   }
 * }
 */
liveTrace.post('/end', async c => {
  try {
    const body: unknown = await c.req.json();

    // Validate request
    const parseResult = endRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return c.json({ error: 'Invalid request', details: parseResult.error.issues }, 400);
    }

    const { sessionId, reason } = parseResult.data;

    // End the session
    const result = endSession(sessionId, reason);

    if (!result) {
      // Session not found - return a default response
      log.debug({ sessionId }, 'Session not found for end');
      const defaultResponse: LiveTraceEndResponse = {
        traceId: sessionId,
        summary: {
          totalTurns: 0,
          totalToolCalls: 0,
          durationMs: 0,
        },
      };
      return c.json(defaultResponse);
    }

    const response: LiveTraceEndResponse = result;
    return c.json(response);
  } catch (error) {
    log.error({ error }, 'Error ending session');
    return c.json({ error: 'Failed to end session' }, 500);
  }
});

export { liveTrace };
