/**
 * Session Trace Manager for WebSocket Voice Sessions
 *
 * Manages active voice session traces in memory, creating Langfuse traces
 * and spans for session events. Handles the lifecycle of traces from
 * session start (token request) through turn events to session end.
 *
 * @module api/_lib/session-trace-manager
 */

import type { LangfuseTraceClient } from 'langfuse';
import { getLangfuse } from './langfuse.js';
import { createChildLogger } from './logger.js';
import type {
  TrackedSession,
  LiveTraceEventData,
  LiveTraceEventType,
  TurnStartData,
  TurnCompleteData,
  ToolCallData,
  ToolResultData,
  SessionSummary,
  SessionEndReason,
  SessionCostTracking,
  SessionCostSummary,
} from './types/live-trace.js';
import { calculateAudioCost } from './cost-calculator.js';
import { scoreVoiceSession } from './langfuse-scores.js';

const log = createChildLogger('session-trace');

/** Session timeout in milliseconds (30 minutes) */
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

/** Cleanup interval in milliseconds (5 minutes) */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

/**
 * In-memory store for active session traces.
 */
const activeSessions = new Map<string, TrackedSession>();

/**
 * Store for Langfuse trace clients per session.
 * Kept separate to allow TrackedSession to be serializable.
 */
const sessionTraces = new Map<string, LangfuseTraceClient>();

/**
 * Store for turn start times to calculate duration.
 */
const turnStartTimes = new Map<string, number>();

/**
 * Cleanup timer reference.
 */
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

/** Default model for voice sessions */
const DEFAULT_VOICE_MODEL = 'gemini-2.0-flash-live';

/**
 * Create a new session trace.
 *
 * Called when a client requests a token for a voice session.
 * Creates a Langfuse trace that will be used to record all
 * events during the session.
 *
 * @param sessionId - Unique session identifier
 * @param userId - Optional user ID for authenticated sessions
 * @param model - Optional model name for cost tracking (default: gemini-2.0-flash-live)
 * @returns The session ID and trace ID, or null if Langfuse unavailable
 */
export function createSession(
  sessionId: string,
  userId?: string,
  model: string = DEFAULT_VOICE_MODEL
): { sessionId: string; traceId: string } | null {
  const langfuse = getLangfuse();

  if (!langfuse) {
    log.debug('Langfuse not available, skipping session trace creation');
    return null;
  }

  // Check if session already exists (shouldn't happen, but handle gracefully)
  const existing = activeSessions.get(sessionId);
  if (existing) {
    log.warn({ sessionId }, 'Session already exists, returning existing trace');
    return { sessionId, traceId: existing.traceId };
  }

  // Create Langfuse trace for this session
  const trace = langfuse.trace({
    id: sessionId, // Use sessionId as trace ID for easy lookup
    name: 'voice-session',
    metadata: {
      type: 'websocket',
      source: 'gemini-live',
    },
    userId,
    tags: ['voice', 'live-api', 'websocket'],
  });

  // Initialize cost tracking state
  const costTracking: SessionCostTracking = {
    model,
    audioMinutes: 0,
    inputTokens: 0,
    outputTokens: 0,
  };

  // Store session data
  const session: TrackedSession = {
    sessionId,
    traceId: trace.id,
    startedAt: new Date(),
    currentTurn: 0,
    toolCallCount: 0,
    userId,
    costTracking,
  };

  activeSessions.set(sessionId, session);
  sessionTraces.set(sessionId, trace);

  log.info({ sessionId, traceId: trace.id, userId }, 'Session trace created');

  // Start cleanup timer if not already running
  startCleanupTimer();

  return { sessionId, traceId: trace.id };
}

/**
 * Record an event for a session.
 *
 * Creates appropriate Langfuse spans based on event type.
 * Fire-and-forget: errors are logged but don't throw.
 *
 * @param sessionId - Session identifier
 * @param type - Event type
 * @param data - Event-specific data
 * @param timestamp - ISO timestamp from client
 */
export function recordEvent(
  sessionId: string,
  type: LiveTraceEventType,
  data: LiveTraceEventData,
  timestamp: string
): void {
  const session = activeSessions.get(sessionId);
  const trace = sessionTraces.get(sessionId);

  if (!session || !trace) {
    log.debug({ sessionId, type }, 'Session not found, ignoring event');
    return;
  }

  try {
    switch (type) {
      case 'turn_start':
        handleTurnStart(session, trace, data as TurnStartData, timestamp);
        break;
      case 'turn_complete':
        handleTurnComplete(session, trace, data as TurnCompleteData, timestamp);
        break;
      case 'tool_call':
        handleToolCall(session, trace, data as ToolCallData, timestamp);
        break;
      case 'tool_result':
        handleToolResult(session, trace, data as ToolResultData, timestamp);
        break;
      default:
        log.warn({ sessionId, type }, 'Unknown event type');
    }
  } catch (error) {
    log.error({ sessionId, type, error }, 'Failed to record event');
  }
}

/**
 * Handle turn_start event.
 */
function handleTurnStart(
  session: TrackedSession,
  trace: LangfuseTraceClient,
  data: TurnStartData,
  timestamp: string
): void {
  session.currentTurn = data.turnNumber;

  // Store turn start time for duration calculation
  const turnKey = `${session.sessionId}-turn-${String(data.turnNumber)}`;
  turnStartTimes.set(turnKey, Date.parse(timestamp));

  // Create span for this turn
  trace.span({
    name: `turn-${String(data.turnNumber)}`,
    startTime: new Date(timestamp),
    input: { userTranscript: data.userTranscript },
    metadata: {
      turnNumber: data.turnNumber,
      type: 'conversation_turn',
    },
  });

  log.debug({ sessionId: session.sessionId, turnNumber: data.turnNumber }, 'Turn started');
}

/**
 * Handle turn_complete event.
 */
function handleTurnComplete(
  session: TrackedSession,
  trace: LangfuseTraceClient,
  data: TurnCompleteData,
  timestamp: string
): void {
  const turnKey = `${session.sessionId}-turn-${String(data.turnNumber)}`;
  const startTime = turnStartTimes.get(turnKey);

  // Create span with completion data
  const span = trace.span({
    name: `turn-${String(data.turnNumber)}`,
    startTime: startTime ? new Date(startTime) : new Date(timestamp),
    output: { aiTranscript: data.aiTranscript },
    metadata: {
      turnNumber: data.turnNumber,
      durationMs: data.durationMs,
      type: 'conversation_turn',
    },
  });

  // End the span with the timestamp
  span.end();

  // Cleanup turn start time
  turnStartTimes.delete(turnKey);

  log.debug(
    { sessionId: session.sessionId, turnNumber: data.turnNumber, durationMs: data.durationMs },
    'Turn completed'
  );
}

/**
 * Handle tool_call event.
 */
function handleToolCall(
  session: TrackedSession,
  trace: LangfuseTraceClient,
  data: ToolCallData,
  timestamp: string
): void {
  session.toolCallCount++;

  // Create span for tool call (will be ended on tool_result)
  trace.span({
    name: `tool-${data.toolName}`,
    startTime: new Date(timestamp),
    input: data.toolArgs,
    metadata: {
      turnNumber: data.turnNumber,
      toolName: data.toolName,
      type: 'tool_execution',
    },
  });

  log.debug({ sessionId: session.sessionId, toolName: data.toolName }, 'Tool call started');
}

/**
 * Handle tool_result event.
 */
function handleToolResult(
  session: TrackedSession,
  trace: LangfuseTraceClient,
  data: ToolResultData,
  _timestamp: string
): void {
  // Create span with result
  const span = trace.span({
    name: `tool-${data.toolName}`,
    output: data.result,
    metadata: {
      turnNumber: data.turnNumber,
      toolName: data.toolName,
      durationMs: data.durationMs,
      type: 'tool_execution',
    },
  });

  span.end();

  log.debug(
    { sessionId: session.sessionId, toolName: data.toolName, durationMs: data.durationMs },
    'Tool result recorded'
  );
}

/**
 * End a session and finalize the trace.
 *
 * @param sessionId - Session identifier
 * @param reason - Reason for session end
 * @returns Session summary or null if session not found
 */
export function endSession(
  sessionId: string,
  reason: SessionEndReason
): { traceId: string; summary: SessionSummary } | null {
  const session = activeSessions.get(sessionId);
  const trace = sessionTraces.get(sessionId);

  if (!session) {
    log.debug({ sessionId }, 'Session not found for end');
    return null;
  }

  const durationMs = Date.now() - session.startedAt.getTime();

  // Calculate cost if tracking is enabled
  let costSummary: SessionCostSummary | undefined;
  if (session.costTracking) {
    const { model, audioMinutes, inputTokens, outputTokens } = session.costTracking;

    // For audio sessions, use session duration as audio minutes if not tracked
    // Convert milliseconds to minutes
    const effectiveAudioMinutes = audioMinutes > 0 ? audioMinutes : durationMs / 60000;

    const totalCost = calculateAudioCost(model, effectiveAudioMinutes, inputTokens, outputTokens);

    costSummary = {
      totalCost,
      model,
      audioMinutes: effectiveAudioMinutes,
      inputTokens,
      outputTokens,
    };
  }

  const summary: SessionSummary = {
    totalTurns: session.currentTurn,
    totalToolCalls: session.toolCallCount,
    durationMs,
    cost: costSummary,
  };

  // Update trace with final metadata (graceful degradation)
  if (trace) {
    try {
      trace.update({
        output: summary,
        metadata: {
          endReason: reason,
          totalTurns: summary.totalTurns,
          totalToolCalls: summary.totalToolCalls,
          durationMs: summary.durationMs,
          ...(costSummary && {
            totalCost: costSummary.totalCost,
            audioMinutes: costSummary.audioMinutes,
            model: costSummary.model,
          }),
        },
      });
    } catch (error) {
      // Log but don't throw - graceful degradation
      log.error({ sessionId, error }, 'Failed to update Langfuse trace');
    }
  }

  // Score the voice session
  scoreVoiceSession(session.traceId, {
    completed: reason !== 'error' && reason !== 'timeout',
    endReason: reason,
    turnCount: summary.totalTurns,
    toolCallCount: summary.totalToolCalls,
    durationMs: summary.durationMs,
  });

  // Cleanup
  activeSessions.delete(sessionId);
  sessionTraces.delete(sessionId);

  // Cleanup any orphaned turn start times
  for (const key of turnStartTimes.keys()) {
    if (key.startsWith(sessionId)) {
      turnStartTimes.delete(key);
    }
  }

  log.info({ sessionId, reason, ...summary }, 'Session ended');

  return { traceId: session.traceId, summary };
}

/**
 * Get the number of active sessions.
 * Useful for monitoring and testing.
 */
export function getActiveSessionCount(): number {
  return activeSessions.size;
}

/**
 * Check if a session exists.
 */
export function hasSession(sessionId: string): boolean {
  return activeSessions.has(sessionId);
}

/**
 * Update cost tracking for a session.
 *
 * Call this to accumulate audio minutes or token usage during a session.
 * These values will be used to calculate total cost when session ends.
 *
 * @param sessionId - Session identifier
 * @param updates - Partial cost tracking updates
 */
export function updateSessionCost(
  sessionId: string,
  updates: Partial<Omit<SessionCostTracking, 'model'>>
): void {
  const session = activeSessions.get(sessionId);
  if (!session?.costTracking) {
    log.debug({ sessionId }, 'Session not found or cost tracking not enabled');
    return;
  }

  if (updates.audioMinutes !== undefined) {
    session.costTracking.audioMinutes += updates.audioMinutes;
  }
  if (updates.inputTokens !== undefined) {
    session.costTracking.inputTokens += updates.inputTokens;
  }
  if (updates.outputTokens !== undefined) {
    session.costTracking.outputTokens += updates.outputTokens;
  }

  log.debug({ sessionId, updates }, 'Session cost updated');
}

/**
 * Get current session cost tracking state.
 *
 * @param sessionId - Session identifier
 * @returns Cost tracking state or null if session not found
 */
export function getSessionCostTracking(sessionId: string): SessionCostTracking | null {
  const session = activeSessions.get(sessionId);
  return session?.costTracking ?? null;
}

/**
 * Start the cleanup timer if not already running.
 */
function startCleanupTimer(): void {
  if (cleanupTimer) return;

  cleanupTimer = setInterval(() => {
    cleanupTimedOutSessions();
  }, CLEANUP_INTERVAL_MS);

  // Don't prevent Node from exiting
  cleanupTimer.unref();

  log.debug('Session cleanup timer started');
}

/**
 * Clean up sessions that have timed out.
 */
function cleanupTimedOutSessions(): void {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [sessionId, session] of activeSessions) {
    const age = now - session.startedAt.getTime();
    if (age > SESSION_TIMEOUT_MS) {
      log.warn({ sessionId, ageMs: age }, 'Cleaning up timed out session');
      endSession(sessionId, 'timeout');
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    log.info({ cleanedCount }, 'Cleaned up timed out sessions');
  }

  // Stop timer if no more sessions
  if (activeSessions.size === 0 && cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
    log.debug('Session cleanup timer stopped (no active sessions)');
  }
}

/**
 * Stop the cleanup timer and clear all sessions.
 * Used for testing and shutdown.
 */
export function shutdown(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }

  // End all active sessions
  for (const sessionId of activeSessions.keys()) {
    endSession(sessionId, 'timeout');
  }

  turnStartTimes.clear();

  log.info('Session trace manager shutdown complete');
}
