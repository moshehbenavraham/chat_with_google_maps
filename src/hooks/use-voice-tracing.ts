/**
 * Voice Tracing React Hook
 *
 * Provides a React-friendly interface for tracking voice session events.
 * Integrates with the voice trace client to report events to Langfuse.
 *
 * @module src/hooks/use-voice-tracing
 */

import { useCallback, useRef } from 'react';
import { getVoiceTraceClient } from '@/lib/tracing/voice-trace-client';
import type {
  TurnStartData,
  TurnCompleteData,
  ToolCallData,
  ToolResultData,
  SessionEndReason,
  SessionEndResponse,
} from '@/lib/tracing/types';

/**
 * Return type for the useVoiceTracing hook.
 */
export interface UseVoiceTracingResult {
  /** Start tracking a new session */
  startSession: (sessionId: string) => void;
  /** Record turn start event */
  recordTurnStart: (turnNumber: number, userTranscript: string) => void;
  /** Record turn complete event */
  recordTurnComplete: (turnNumber: number, aiTranscript: string, durationMs: number) => void;
  /** Record tool call event */
  recordToolCall: (turnNumber: number, toolName: string, toolArgs: Record<string, unknown>) => void;
  /** Record tool result event */
  recordToolResult: (
    turnNumber: number,
    toolName: string,
    result: unknown,
    durationMs: number
  ) => void;
  /** End the session and get summary */
  endSession: (reason: SessionEndReason) => Promise<SessionEndResponse | null>;
}

/**
 * Hook for tracking voice session events.
 *
 * Usage:
 * ```tsx
 * const { startSession, recordTurnStart, recordTurnComplete, endSession } = useVoiceTracing();
 *
 * // When token is received
 * startSession(tokenResponse.sessionId);
 *
 * // When user starts speaking
 * recordTurnStart(1, 'Take me to the Eiffel Tower');
 *
 * // When AI finishes responding
 * recordTurnComplete(1, 'Navigating to...', 1847);
 *
 * // When session ends
 * const summary = await endSession('user_disconnect');
 * ```
 */
export function useVoiceTracing(): UseVoiceTracingResult {
  const sessionIdRef = useRef<string | null>(null);
  const client = getVoiceTraceClient();

  const startSession = useCallback((sessionId: string) => {
    sessionIdRef.current = sessionId;
  }, []);

  const recordTurnStart = useCallback(
    (turnNumber: number, userTranscript: string) => {
      if (!sessionIdRef.current) return;

      const data: TurnStartData = { turnNumber, userTranscript };
      client.recordEvent({
        sessionId: sessionIdRef.current,
        type: 'turn_start',
        data,
      });
    },
    [client]
  );

  const recordTurnComplete = useCallback(
    (turnNumber: number, aiTranscript: string, durationMs: number) => {
      if (!sessionIdRef.current) return;

      const data: TurnCompleteData = { turnNumber, aiTranscript, durationMs };
      client.recordEvent({
        sessionId: sessionIdRef.current,
        type: 'turn_complete',
        data,
      });
    },
    [client]
  );

  const recordToolCall = useCallback(
    (turnNumber: number, toolName: string, toolArgs: Record<string, unknown>) => {
      if (!sessionIdRef.current) return;

      const data: ToolCallData = { turnNumber, toolName, toolArgs };
      client.recordEvent({
        sessionId: sessionIdRef.current,
        type: 'tool_call',
        data,
      });
    },
    [client]
  );

  const recordToolResult = useCallback(
    (turnNumber: number, toolName: string, result: unknown, durationMs: number) => {
      if (!sessionIdRef.current) return;

      const data: ToolResultData = { turnNumber, toolName, result, durationMs };
      client.recordEvent({
        sessionId: sessionIdRef.current,
        type: 'tool_result',
        data,
      });
    },
    [client]
  );

  const endSession = useCallback(
    async (reason: SessionEndReason): Promise<SessionEndResponse | null> => {
      if (!sessionIdRef.current) return null;

      const result = await client.endSession(sessionIdRef.current, reason);
      sessionIdRef.current = null;
      return result;
    },
    [client]
  );

  return {
    startSession,
    recordTurnStart,
    recordTurnComplete,
    recordToolCall,
    recordToolResult,
    endSession,
  };
}
