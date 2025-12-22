/**
 * Gemini API Proxy Routes
 *
 * Provides server-side proxy for Gemini REST API calls,
 * keeping the API key secure on the server.
 */

import { Hono } from 'hono';
import { getGeminiApiKey } from '../_lib/env.js';
import { ExternalApiError, TimeoutError } from '../_lib/errors.js';
import { validateJsonBody, validateGeminiRequest } from '../_middleware/validate-request.js';
import type { GeminiGroundingRequest } from '../_lib/types.js';
import { createChildLogger, createTracedLogger } from '../_lib/logger.js';
import { calculateCost } from '../_lib/cost-calculator.js';
import type { GeminiUsageMetadata } from '../_lib/types/langfuse.js';
import { scoreGroundingResponse } from '../_lib/langfuse-scores.js';

// Import for Hono context type augmentation
import '../_lib/types/langfuse.js';

const log = createChildLogger('gemini');

/** Model name used for this endpoint */
const GEMINI_MODEL = 'gemini-2.5-flash';

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
 *
 * @param requestBody - The request body to send
 * @param apiKey - The Gemini API key
 * @returns The API response data
 * @throws TimeoutError if request times out
 * @throws ExternalApiError if API returns error
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
      log.error({ status: response.status, body: errorBody }, 'Gemini API error');

      throw new ExternalApiError(`Gemini API returned status ${String(response.status)}`, {
        status: response.status,
        body: errorBody,
      });
    }

    const data: unknown = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle abort (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TimeoutError('Gemini API', API_TIMEOUT_MS);
    }

    // Re-throw known errors
    if (error instanceof ExternalApiError || error instanceof TimeoutError) {
      throw error;
    }

    // Wrap unknown errors
    throw new ExternalApiError(
      `Failed to call Gemini API: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { originalError: String(error) }
    );
  }
}

// Create router for Gemini endpoints
const gemini = new Hono();

/**
 * Extract the count of place results from Gemini grounding response.
 * Looks for groundingMetadata.groundingChunks which contain place results.
 */
function extractResultCount(response: unknown): number {
  if (typeof response !== 'object' || response === null) return 0;

  const resp = response as Record<string, unknown>;
  const candidates = resp.candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return 0;

  const candidate = candidates[0] as Record<string, unknown>;
  const groundingMetadata = candidate.groundingMetadata as Record<string, unknown> | undefined;
  if (!groundingMetadata) return 0;

  const groundingChunks = groundingMetadata.groundingChunks;
  if (Array.isArray(groundingChunks)) {
    return groundingChunks.length;
  }

  return 0;
}

/**
 * Extract usage metadata from Gemini API response.
 * Handles missing or malformed usageMetadata gracefully.
 */
function extractUsageMetadata(response: unknown): GeminiUsageMetadata {
  if (typeof response === 'object' && response !== null && 'usageMetadata' in response) {
    const usage = (response as { usageMetadata: unknown }).usageMetadata;
    if (typeof usage === 'object' && usage !== null) {
      const meta = usage as Record<string, unknown>;
      return {
        promptTokenCount: typeof meta.promptTokenCount === 'number' ? meta.promptTokenCount : 0,
        candidatesTokenCount:
          typeof meta.candidatesTokenCount === 'number' ? meta.candidatesTokenCount : 0,
        totalTokenCount: typeof meta.totalTokenCount === 'number' ? meta.totalTokenCount : 0,
      };
    }
  }
  return { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 };
}

/**
 * POST /api/gemini/grounding
 *
 * Proxy endpoint for maps grounding requests to Gemini REST API.
 * Validates request, adds API key server-side, and returns response.
 *
 * Instrumented with Langfuse tracing:
 * - Creates a generation span for the Gemini API call
 * - Records input (prompt, location), output (response), and token usage
 * - Calculates and records cost based on token usage
 */
gemini.post('/grounding', validateJsonBody, validateGeminiRequest, async c => {
  const request = c.get('validatedRequest');
  const apiKey = getGeminiApiKey();
  const trace = c.get('trace');
  const traceId = c.get('traceId');

  // Use traced logger for correlation
  const tracedLog = createTracedLogger('gemini', traceId);

  const requestBody = buildGeminiRequestBody(request);
  const startTime = Date.now();

  // Create generation span if tracing is active
  const generation = trace?.generation({
    name: 'gemini-grounding',
    model: GEMINI_MODEL,
    input: {
      prompt: request.prompt,
      lat: request.lat,
      lng: request.lng,
      systemInstruction: request.systemInstruction ?? DEFAULT_SYSTEM_INSTRUCTION,
    },
    modelParameters: {
      thinkingBudget: 0,
      enableWidget: request.enableWidget ?? true,
    },
  });

  try {
    const response = await callGeminiApi(requestBody, apiKey);

    // Extract token usage from response
    const usage = extractUsageMetadata(response);
    const inputTokens = usage.promptTokenCount ?? 0;
    const outputTokens = usage.candidatesTokenCount ?? 0;

    // Calculate cost
    const cost = calculateCost(GEMINI_MODEL, inputTokens, outputTokens);

    // Log with trace correlation
    tracedLog.info(
      { inputTokens, outputTokens, cost: cost.toFixed(8) },
      'Gemini grounding request completed'
    );

    // Finalize generation span with success
    generation?.end({
      output: response,
      usage: {
        input: inputTokens,
        output: outputTokens,
        totalCost: cost,
      },
    });

    // Score the grounding response
    if (traceId) {
      const latencyMs = Date.now() - startTime;
      const resultCount = extractResultCount(response);
      scoreGroundingResponse(traceId, {
        hasResults: resultCount > 0,
        resultCount,
        latencyMs,
      });
    }

    return c.json(response);
  } catch (error) {
    // Log error with trace correlation
    tracedLog.error(
      { error: error instanceof Error ? error.message : String(error) },
      'Gemini grounding request failed'
    );

    // Finalize generation span with error
    generation?.end({
      output: { error: error instanceof Error ? error.message : 'Unknown error' },
      level: 'ERROR',
    });

    throw error;
  }
});

export { gemini };
