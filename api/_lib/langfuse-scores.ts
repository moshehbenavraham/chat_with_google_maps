/**
 * Langfuse Scoring Utilities
 *
 * Project-specific scores for evaluating AI interactions.
 * Scores can be applied to traces (sessions) or generations (individual calls).
 *
 * @module api/_lib/langfuse-scores
 */

import { getLangfuse } from './langfuse.js';
import { createChildLogger } from './logger.js';

const log = createChildLogger('langfuse-scores');

// ============================================
// Score Definitions
// ============================================

/**
 * Score names used in this project.
 * Use these constants to ensure consistency.
 */
export const SCORES = {
  // REST API (Grounding) Scores
  /** Whether the grounding response contained place results */
  HAS_RESULTS: 'has_results',
  /** Number of places returned (0-10 scale normalized) */
  RESULT_COUNT: 'result_count',
  /** Response latency rating (1 = fast, 0 = slow/timeout) */
  LATENCY_RATING: 'latency_rating',

  // Voice Session Scores
  /** Whether session completed normally vs error/timeout */
  SESSION_COMPLETED: 'session_completed',
  /** User engagement based on turn count (normalized 0-1) */
  ENGAGEMENT: 'engagement',
  /** Whether any tools were used during session */
  TOOL_USAGE: 'tool_usage',
  /** Session duration rating (longer = more engaged, capped) */
  SESSION_DURATION: 'session_duration',

  // Quality Scores (for manual/automated evaluation)
  /** Overall response quality (0-1 numeric) */
  QUALITY: 'quality',
  /** User feedback: thumbs up/down */
  USER_FEEDBACK: 'user_feedback',
  /** Relevance to user query (0-1 numeric) */
  RELEVANCE: 'relevance',
} as const;

export type ScoreName = (typeof SCORES)[keyof typeof SCORES];

// ============================================
// Score Functions
// ============================================

interface ScoreOptions {
  comment?: string;
  observationId?: string;
}

/**
 * Score a trace or generation with a boolean value.
 */
export function scoreBoolean(
  traceId: string,
  name: ScoreName,
  value: boolean,
  options?: ScoreOptions
): void {
  const langfuse = getLangfuse();
  if (!langfuse) return;

  try {
    langfuse.score({
      traceId,
      observationId: options?.observationId,
      name,
      value: value ? 1 : 0,
      dataType: 'BOOLEAN',
      comment: options?.comment,
    });
    log.debug({ traceId, name, value }, 'Boolean score recorded');
  } catch (error) {
    log.error({ traceId, name, error }, 'Failed to record boolean score');
  }
}

/**
 * Score a trace or generation with a numeric value (0-1).
 */
export function scoreNumeric(
  traceId: string,
  name: ScoreName,
  value: number,
  options?: ScoreOptions
): void {
  const langfuse = getLangfuse();
  if (!langfuse) return;

  // Clamp to 0-1 range
  const clampedValue = Math.max(0, Math.min(1, value));

  try {
    langfuse.score({
      traceId,
      observationId: options?.observationId,
      name,
      value: clampedValue,
      dataType: 'NUMERIC',
      comment: options?.comment,
    });
    log.debug({ traceId, name, value: clampedValue }, 'Numeric score recorded');
  } catch (error) {
    log.error({ traceId, name, error }, 'Failed to record numeric score');
  }
}

/**
 * Score a trace or generation with a categorical value.
 */
export function scoreCategorical(
  traceId: string,
  name: ScoreName,
  value: string,
  options?: ScoreOptions
): void {
  const langfuse = getLangfuse();
  if (!langfuse) return;

  try {
    langfuse.score({
      traceId,
      observationId: options?.observationId,
      name,
      value,
      dataType: 'CATEGORICAL',
      comment: options?.comment,
    });
    log.debug({ traceId, name, value }, 'Categorical score recorded');
  } catch (error) {
    log.error({ traceId, name, error }, 'Failed to record categorical score');
  }
}

// ============================================
// Project-Specific Scoring Helpers
// ============================================

/**
 * Score a grounding (maps search) response.
 * Call after receiving Gemini grounding response.
 */
export function scoreGroundingResponse(
  traceId: string,
  response: {
    hasResults: boolean;
    resultCount: number;
    latencyMs: number;
  },
  observationId?: string
): void {
  const opts = { observationId };

  // Has results (boolean)
  scoreBoolean(traceId, SCORES.HAS_RESULTS, response.hasResults, opts);

  // Result count (normalized: 3+ results = 1.0)
  const normalizedCount = Math.min(response.resultCount / 3, 1);
  scoreNumeric(traceId, SCORES.RESULT_COUNT, normalizedCount, {
    ...opts,
    comment: `${String(response.resultCount)} results returned`,
  });

  // Latency rating (under 2s = 1.0, over 10s = 0)
  const latencyRating = Math.max(0, 1 - (response.latencyMs - 2000) / 8000);
  scoreNumeric(traceId, SCORES.LATENCY_RATING, latencyRating, {
    ...opts,
    comment: `${String(response.latencyMs)}ms`,
  });
}

/**
 * Score a voice session at completion.
 * Call when session ends.
 */
export function scoreVoiceSession(
  traceId: string,
  session: {
    completed: boolean;
    endReason: string;
    turnCount: number;
    toolCallCount: number;
    durationMs: number;
  }
): void {
  // Session completed normally
  const completedNormally = session.completed && session.endReason === 'user_disconnect';
  scoreBoolean(traceId, SCORES.SESSION_COMPLETED, completedNormally, {
    comment: session.endReason,
  });

  // Engagement (5+ turns = fully engaged)
  const engagement = Math.min(session.turnCount / 5, 1);
  scoreNumeric(traceId, SCORES.ENGAGEMENT, engagement, {
    comment: `${String(session.turnCount)} turns`,
  });

  // Tool usage
  scoreBoolean(traceId, SCORES.TOOL_USAGE, session.toolCallCount > 0, {
    comment: `${String(session.toolCallCount)} tool calls`,
  });

  // Duration rating (5+ minutes = fully engaged, max 1 hour)
  const durationMinutes = session.durationMs / 60000;
  const durationRating = Math.min(durationMinutes / 5, 1);
  scoreNumeric(traceId, SCORES.SESSION_DURATION, durationRating, {
    comment: `${durationMinutes.toFixed(1)} minutes`,
  });
}

/**
 * Record user feedback (thumbs up/down).
 * Call from a feedback endpoint.
 */
export function scoreUserFeedback(
  traceId: string,
  feedback: 'positive' | 'negative',
  comment?: string
): void {
  scoreCategorical(traceId, SCORES.USER_FEEDBACK, feedback, { comment });
}

/**
 * Score response quality (for manual or automated evaluation).
 */
export function scoreQuality(
  traceId: string,
  quality: number,
  options?: { comment?: string; observationId?: string }
): void {
  scoreNumeric(traceId, SCORES.QUALITY, quality, options);
}

/**
 * Score response relevance (for manual or automated evaluation).
 */
export function scoreRelevance(
  traceId: string,
  relevance: number,
  options?: { comment?: string; observationId?: string }
): void {
  scoreNumeric(traceId, SCORES.RELEVANCE, relevance, options);
}
