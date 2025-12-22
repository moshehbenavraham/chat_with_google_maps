/**
 * Voice Trace Client
 *
 * Lightweight client for reporting voice session events to the backend.
 * Uses fire-and-forget pattern to avoid impacting voice latency.
 *
 * @module src/lib/tracing/voice-trace-client
 */

import type {
  VoiceTraceEvent,
  VoiceTraceClientConfig,
  IVoiceTraceClient,
  SessionEndReason,
  SessionEndResponse,
} from './types';

/**
 * Default configuration for the voice trace client.
 */
const DEFAULT_CONFIG: Required<VoiceTraceClientConfig> = {
  baseUrl: '',
  enabled: true,
};

/**
 * Voice trace client implementation.
 *
 * Reports events to the backend without blocking.
 * Handles errors gracefully - tracing failures don't break the voice session.
 */
class VoiceTraceClient implements IVoiceTraceClient {
  private config: Required<VoiceTraceClientConfig>;

  constructor(config: VoiceTraceClientConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if tracing is enabled.
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Record a trace event.
   *
   * Fire-and-forget: does not wait for response or throw errors.
   * Events are timestamped automatically.
   *
   * @param event - Event to record (without timestamp)
   */
  recordEvent(event: Omit<VoiceTraceEvent, 'timestamp'>): void {
    if (!this.config.enabled) return;

    const fullEvent: VoiceTraceEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    // Fire-and-forget: don't await, don't throw
    void this.postEvent(fullEvent);
  }

  /**
   * End a session and get summary metrics.
   *
   * Unlike recordEvent, this returns a response with session summary.
   *
   * @param sessionId - Session to end
   * @param reason - Reason for ending
   * @returns Session summary or null on error
   */
  async endSession(
    sessionId: string,
    reason: SessionEndReason
  ): Promise<SessionEndResponse | null> {
    if (!this.config.enabled) return null;

    try {
      const response = await fetch(`${this.config.baseUrl}/api/live/trace/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId, reason }),
      });

      if (!response.ok) {
        console.warn('[VoiceTrace] Failed to end session:', response.status);
        return null;
      }

      return (await response.json()) as SessionEndResponse;
    } catch (error) {
      console.warn('[VoiceTrace] Error ending session:', error);
      return null;
    }
  }

  /**
   * Post an event to the backend.
   * Private method - handles the actual HTTP request.
   */
  private async postEvent(event: VoiceTraceEvent): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/live/trace/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(event),
      });

      // Log non-success but don't throw
      if (!response.ok && response.status !== 204) {
        console.warn('[VoiceTrace] Event post returned:', response.status);
      }
    } catch (error) {
      // Swallow errors - tracing should never break the session
      console.warn('[VoiceTrace] Failed to post event:', error);
    }
  }
}

/**
 * Singleton instance of the voice trace client.
 */
let clientInstance: VoiceTraceClient | null = null;

/**
 * Get or create the voice trace client singleton.
 *
 * @param config - Optional configuration (only used on first call)
 * @returns Voice trace client instance
 */
export function getVoiceTraceClient(config?: VoiceTraceClientConfig): IVoiceTraceClient {
  clientInstance ??= new VoiceTraceClient(config);
  return clientInstance;
}

/**
 * Reset the client singleton (for testing).
 */
export function resetVoiceTraceClient(): void {
  clientInstance = null;
}

/**
 * Create a new client instance (for testing or custom config).
 *
 * @param config - Client configuration
 * @returns New voice trace client instance
 */
export function createVoiceTraceClient(config?: VoiceTraceClientConfig): IVoiceTraceClient {
  return new VoiceTraceClient(config);
}
