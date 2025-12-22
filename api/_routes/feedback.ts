/**
 * User Feedback Routes
 *
 * Endpoints for collecting user feedback on AI responses.
 * Feedback is recorded as Langfuse scores for quality analysis.
 *
 * @module api/_routes/feedback
 */

import { Hono } from 'hono';
import { scoreUserFeedback, scoreQuality, scoreRelevance } from '../_lib/langfuse-scores.js';
import { createChildLogger } from '../_lib/logger.js';

const log = createChildLogger('feedback');

const feedback = new Hono();

/**
 * POST /api/feedback
 *
 * Submit user feedback for a trace.
 *
 * Request body:
 * - traceId: string (required) - The trace ID to score
 * - feedback: 'positive' | 'negative' (required) - Thumbs up/down
 * - comment?: string - Optional user comment
 * - quality?: number - Optional quality score (0-1)
 * - relevance?: number - Optional relevance score (0-1)
 */
feedback.post('/', async c => {
  const body = await c.req.json<{
    traceId?: string;
    feedback?: 'positive' | 'negative';
    comment?: string;
    quality?: number;
    relevance?: number;
  }>();

  // Validate required fields
  if (!body.traceId) {
    return c.json({ error: 'traceId is required' }, 400);
  }

  if (!body.feedback || !['positive', 'negative'].includes(body.feedback)) {
    return c.json({ error: 'feedback must be "positive" or "negative"' }, 400);
  }

  const { traceId, feedback: feedbackValue, comment, quality, relevance } = body;

  // Record user feedback score
  scoreUserFeedback(traceId, feedbackValue, comment);

  // Record optional quality score
  if (typeof quality === 'number') {
    scoreQuality(traceId, quality, { comment });
  }

  // Record optional relevance score
  if (typeof relevance === 'number') {
    scoreRelevance(traceId, relevance, { comment });
  }

  log.info({ traceId, feedback: feedbackValue }, 'User feedback recorded');

  return c.json({ success: true });
});

export { feedback };
