/**
 * Live API Token Routes
 *
 * Provides server-side generation of ephemeral tokens for the Gemini Live API.
 * This keeps the API key secure on the server while allowing client-side Live API access.
 *
 * Token requests also create Langfuse traces for session observability.
 */

import { Hono } from 'hono';
import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey } from '../_lib/env.js';
import { ExternalApiError } from '../_lib/errors.js';
import { createChildLogger } from '../_lib/logger.js';
import { createSession } from '../_lib/session-trace-manager.js';
import type { LiveTokenResponseWithSession } from '../_lib/types/live-trace.js';

const log = createChildLogger('live');

/** Default token expiration time (30 minutes) */
const TOKEN_EXPIRE_MINUTES = 30;

/** New session expire time (1 minute to initiate connection) */
const NEW_SESSION_EXPIRE_MINUTES = 1;

/**
 * Create a GoogleGenAI client configured for ephemeral token generation.
 * Uses v1alpha API version as required for ephemeral tokens.
 */
function createGenAIClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    httpOptions: { apiVersion: 'v1alpha' },
  });
}

/**
 * Generate an ephemeral token for Live API access.
 *
 * @param client - GoogleGenAI client
 * @returns Token and expiration time
 */
async function generateEphemeralToken(
  client: GoogleGenAI
): Promise<{ token: string; expiresAt: string }> {
  const now = new Date();
  const expireTime = new Date(now.getTime() + TOKEN_EXPIRE_MINUTES * 60 * 1000);
  const newSessionExpireTime = new Date(now.getTime() + NEW_SESSION_EXPIRE_MINUTES * 60 * 1000);

  try {
    const tokenResponse = await client.authTokens.create({
      config: {
        uses: 1, // Single-use token
        expireTime: expireTime.toISOString(),
        newSessionExpireTime: newSessionExpireTime.toISOString(),
      },
    });

    // The SDK returns AuthToken with the token in the 'name' field
    if (!tokenResponse.name) {
      log.error({ tokenResponse }, 'Unexpected token response structure');
      throw new Error('No token returned from authTokens.create');
    }

    return {
      token: tokenResponse.name,
      expiresAt: expireTime.toISOString(),
    };
  } catch (error) {
    log.error({ error }, 'Failed to generate ephemeral token');

    if (error instanceof Error) {
      throw new ExternalApiError(`Failed to generate ephemeral token: ${error.message}`, {
        originalError: error.message,
      });
    }

    throw new ExternalApiError('Failed to generate ephemeral token', {
      originalError: String(error),
    });
  }
}

// Create router for Live API endpoints
const live = new Hono();

/**
 * POST /api/live/token
 *
 * Generate an ephemeral token for Gemini Live API access.
 * The token is single-use and expires after 30 minutes.
 * Also creates a Langfuse trace for the session.
 *
 * Response:
 * {
 *   "token": "ephemeral-token-string",
 *   "expiresAt": "2025-01-01T00:30:00.000Z",
 *   "sessionId": "uuid-v4-session-id"
 * }
 */
live.post('/token', async c => {
  const apiKey = getGeminiApiKey();
  const client = createGenAIClient(apiKey);

  // Generate unique session ID
  const sessionId = crypto.randomUUID();

  log.info({ sessionId }, 'Generating ephemeral token for Live API');

  const result = await generateEphemeralToken(client);

  // Create session trace (graceful degradation if Langfuse unavailable)
  const traceResult = createSession(sessionId);
  if (traceResult) {
    log.info(
      { sessionId, traceId: traceResult.traceId, expiresAt: result.expiresAt },
      'Ephemeral token and session trace created'
    );
  } else {
    log.info(
      { sessionId, expiresAt: result.expiresAt },
      'Ephemeral token generated (tracing disabled)'
    );
  }

  const response: LiveTokenResponseWithSession = {
    ...result,
    sessionId,
  };

  return c.json(response);
});

export { live };
