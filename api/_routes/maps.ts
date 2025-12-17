/**
 * Maps API Proxy Routes
 *
 * Provides an alias endpoint for maps grounding that routes
 * to the same Gemini grounding functionality with clearer naming.
 */

import { Hono } from 'hono';
import { getGeminiApiKey } from '../_lib/env.js';
import { ExternalApiError, TimeoutError } from '../_lib/errors.js';
import { validateJsonBody, validateGeminiRequest } from '../_middleware/validate-request.js';
import type { GeminiGroundingRequest } from '../_lib/types.js';

/** Timeout for external API calls (30 seconds) */
const API_TIMEOUT_MS = 30000;

/** Gemini REST API endpoint for content generation */
const GEMINI_API_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/** Default system instruction for maps grounding */
const DEFAULT_SYSTEM_INSTRUCTION =
  "You are a helpful assistant that provides concise answers based on the user's query. Provide details for the top 3 results, unless the user requests less. Provide the name and a concise one line description that highlights a unique, interesting, or fun aspect about the place. Do not state addresses. ";

/**
 * Build the Gemini API request body from validated input.
 */
function buildGeminiRequestBody(request: GeminiGroundingRequest): Record<string, unknown> {
  const requestBody: Record<string, unknown> = {
    contents: [
      {
        parts: [
          {
            text: request.prompt,
          },
        ],
      },
    ],
    system_instruction: {
      parts: [{ text: request.systemInstruction ?? DEFAULT_SYSTEM_INSTRUCTION }],
    },
    tools: [
      {
        google_maps: {
          enable_widget: request.enableWidget ?? true,
        },
      },
    ],
    generationConfig: {
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
  };

  // Add location config if lat/lng provided
  if (request.lat !== undefined && request.lng !== undefined) {
    requestBody.toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: request.lat,
          longitude: request.lng,
        },
      },
    };
  }

  return requestBody;
}

/**
 * Call Gemini API with timeout handling.
 */
async function callGeminiApi(
  requestBody: Record<string, unknown>,
  apiKey: string
): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, API_TIMEOUT_MS);

  try {
    const response = await fetch(GEMINI_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[Maps Grounding API Error]', {
        status: response.status,
        body: errorBody,
      });

      throw new ExternalApiError(`Gemini API returned status ${String(response.status)}`, {
        status: response.status,
        body: errorBody,
      });
    }

    const data: unknown = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new TimeoutError('Maps Grounding API', API_TIMEOUT_MS);
    }

    if (error instanceof ExternalApiError || error instanceof TimeoutError) {
      throw error;
    }

    throw new ExternalApiError(
      `Failed to call Maps Grounding API: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { originalError: String(error) }
    );
  }
}

// Create router for Maps endpoints
const maps = new Hono();

/**
 * POST /api/maps/grounding
 *
 * Alias endpoint for maps grounding - semantically clearer name.
 * Internally uses the same Gemini API with googleMaps tool.
 */
maps.post('/grounding', validateJsonBody, validateGeminiRequest, async c => {
  const request = c.get('validatedRequest');
  const apiKey = getGeminiApiKey();

  const requestBody = buildGeminiRequestBody(request);
  const response = await callGeminiApi(requestBody, apiKey);

  return c.json(response);
});

export { maps };
