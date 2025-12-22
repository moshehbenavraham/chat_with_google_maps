/**
 * Live Trace Types for WebSocket Session Tracing
 *
 * Defines the event types and data structures for tracing
 * real-time voice sessions with Langfuse.
 *
 * @module api/_lib/types/live-trace
 */

/**
 * Event types that can be recorded during a voice session.
 */
export type LiveTraceEventType = 'turn_start' | 'turn_complete' | 'tool_call' | 'tool_result';

/**
 * Base structure for all live trace events.
 */
export interface LiveTraceEventBase {
  /** Unique session identifier from token response */
  sessionId: string;
  /** Type of event being recorded */
  type: LiveTraceEventType;
  /** ISO timestamp when event occurred on client */
  timestamp: string;
}

/**
 * Data for turn_start events - when user begins speaking.
 */
export interface TurnStartData {
  /** Sequential turn number within session */
  turnNumber: number;
  /** Transcript of what user said */
  userTranscript: string;
}

/**
 * Data for turn_complete events - when AI finishes responding.
 */
export interface TurnCompleteData {
  /** Sequential turn number within session */
  turnNumber: number;
  /** Transcript of AI response */
  aiTranscript: string;
  /** Duration of this turn in milliseconds */
  durationMs: number;
}

/**
 * Data for tool_call events - when AI invokes a tool.
 */
export interface ToolCallData {
  /** Turn number when tool was called */
  turnNumber: number;
  /** Name of the tool being called */
  toolName: string;
  /** Arguments passed to the tool */
  toolArgs: Record<string, unknown>;
}

/**
 * Data for tool_result events - when tool execution completes.
 */
export interface ToolResultData {
  /** Turn number when tool was called */
  turnNumber: number;
  /** Name of the tool that was called */
  toolName: string;
  /** Result returned by the tool */
  result: unknown;
  /** Duration of tool execution in milliseconds */
  durationMs: number;
}

/**
 * Union type for event-specific data.
 */
export type LiveTraceEventData = TurnStartData | TurnCompleteData | ToolCallData | ToolResultData;

/**
 * Complete live trace event structure.
 */
export interface LiveTraceEvent extends LiveTraceEventBase {
  /** Event-specific data */
  data: LiveTraceEventData;
}

/**
 * Request body for POST /api/live/trace/event
 */
export interface LiveTraceEventRequest {
  sessionId: string;
  type: LiveTraceEventType;
  timestamp: string;
  data: LiveTraceEventData;
}

/**
 * Reason why a session ended.
 */
export type SessionEndReason = 'user_disconnect' | 'error' | 'timeout';

/**
 * Request body for POST /api/live/trace/end
 */
export interface LiveTraceEndRequest {
  sessionId: string;
  reason: SessionEndReason;
}

/**
 * Cost summary for a completed session.
 */
export interface SessionCostSummary {
  /** Total cost in USD */
  totalCost: number;
  /** Model used */
  model: string;
  /** Audio minutes billed */
  audioMinutes: number;
  /** Input tokens billed */
  inputTokens: number;
  /** Output tokens billed */
  outputTokens: number;
}

/**
 * Summary metrics for a completed session.
 */
export interface SessionSummary {
  /** Total number of conversation turns */
  totalTurns: number;
  /** Total number of tool calls made */
  totalToolCalls: number;
  /** Total session duration in milliseconds */
  durationMs: number;
  /** Cost summary if tracking was enabled */
  cost?: SessionCostSummary;
}

/**
 * Response from POST /api/live/trace/end
 */
export interface LiveTraceEndResponse {
  /** Langfuse trace ID for the session */
  traceId: string;
  /** Session summary metrics */
  summary: SessionSummary;
}

/**
 * Token response with session ID for tracing.
 */
export interface LiveTokenResponseWithSession {
  token: string;
  expiresAt: string;
  sessionId: string;
}

/**
 * Cost tracking state for a session.
 */
export interface SessionCostTracking {
  /** Model used for the session (e.g., 'gemini-2.0-flash-live') */
  model: string;
  /** Accumulated audio minutes in this session */
  audioMinutes: number;
  /** Accumulated input tokens (for text portions) */
  inputTokens: number;
  /** Accumulated output tokens (for text portions) */
  outputTokens: number;
}

/**
 * Internal session state tracked by SessionTraceManager.
 */
export interface TrackedSession {
  /** Session ID */
  sessionId: string;
  /** Langfuse trace ID */
  traceId: string;
  /** When session started */
  startedAt: Date;
  /** Current turn number */
  currentTurn: number;
  /** Total tool calls count */
  toolCallCount: number;
  /** User ID if authenticated */
  userId?: string;
  /** Cost tracking state */
  costTracking?: SessionCostTracking;
}
