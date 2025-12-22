/**
 * Frontend Voice Tracing Types
 *
 * Type definitions for the client-side voice tracing system
 * that reports events to the backend for Langfuse recording.
 *
 * @module src/lib/tracing/types
 */

/**
 * Event types that the frontend can emit during voice sessions.
 */
export type VoiceTraceEventType = 'turn_start' | 'turn_complete' | 'tool_call' | 'tool_result';

/**
 * Data for turn_start events.
 */
export interface TurnStartData {
  turnNumber: number;
  userTranscript: string;
}

/**
 * Data for turn_complete events.
 */
export interface TurnCompleteData {
  turnNumber: number;
  aiTranscript: string;
  durationMs: number;
}

/**
 * Data for tool_call events.
 */
export interface ToolCallData {
  turnNumber: number;
  toolName: string;
  toolArgs: Record<string, unknown>;
}

/**
 * Data for tool_result events.
 */
export interface ToolResultData {
  turnNumber: number;
  toolName: string;
  result: unknown;
  durationMs: number;
}

/**
 * Union type for all event data.
 */
export type VoiceTraceEventData = TurnStartData | TurnCompleteData | ToolCallData | ToolResultData;

/**
 * Complete event structure sent to backend.
 */
export interface VoiceTraceEvent {
  sessionId: string;
  type: VoiceTraceEventType;
  timestamp: string;
  data: VoiceTraceEventData;
}

/**
 * Reason for session end.
 */
export type SessionEndReason = 'user_disconnect' | 'error' | 'timeout';

/**
 * Request to end a session.
 */
export interface SessionEndRequest {
  sessionId: string;
  reason: SessionEndReason;
}

/**
 * Session summary returned when session ends.
 */
export interface SessionSummary {
  totalTurns: number;
  totalToolCalls: number;
  durationMs: number;
}

/**
 * Response from session end endpoint.
 */
export interface SessionEndResponse {
  traceId: string;
  summary: SessionSummary;
}

/**
 * Token response including session ID for tracing.
 */
export interface TokenWithSession {
  token: string;
  expiresAt: string;
  sessionId: string;
}

/**
 * Configuration for the voice trace client.
 */
export interface VoiceTraceClientConfig {
  /** Base URL for API calls, defaults to empty string (relative) */
  baseUrl?: string;
  /** Whether to enable tracing, defaults to true */
  enabled?: boolean;
}

/**
 * Interface for the voice trace client.
 */
export interface IVoiceTraceClient {
  /** Record a trace event */
  recordEvent(event: Omit<VoiceTraceEvent, 'timestamp'>): void;
  /** End a session and get summary */
  endSession(sessionId: string, reason: SessionEndReason): Promise<SessionEndResponse | null>;
  /** Check if tracing is enabled */
  isEnabled(): boolean;
}
