// Vercel serverless function - full API implementation
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { createChildLogger } from './_lib/logger.js';

const log = createChildLogger('vercel');

/** Version constant */
const VERSION = '0.0.7';

/** Timeout for external API calls (30 seconds) */
const API_TIMEOUT_MS = 30000;

/** Gemini REST API endpoint */
const GEMINI_API_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/** Default system instruction */
const DEFAULT_SYSTEM_INSTRUCTION =
  "You are a helpful assistant that provides concise answers based on the user's query. Provide details for the top 3 results, unless the user requests less. Provide the name and a concise one line description that highlights a unique, interesting, or fun aspect about the place. Do not state addresses. ";

/** Request body type */
interface GeminiRequest {
  prompt: string;
  enableWidget?: boolean;
  lat?: number;
  lng?: number;
  systemInstruction?: string;
}

/** Send JSON response */
function jsonResponse(res: VercelResponse, data: unknown, status = 200) {
  res.setHeader('Content-Type', 'application/json');
  return res.status(status).json(data);
}

/** Send error response */
function errorResponse(
  res: VercelResponse,
  code: string,
  message: string,
  status = 500,
  details?: unknown
) {
  return jsonResponse(res, { error: { code, message, details } }, status);
}

/** Validate gemini request body */
function validateGeminiRequest(
  body: unknown
): { valid: true; data: GeminiRequest } | { valid: false; error: string; details?: unknown } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  const b = body as Record<string, unknown>;

  if (typeof b.prompt !== 'string') {
    return {
      valid: false,
      error: 'prompt is required and must be a string',
      details: { received: typeof b.prompt },
    };
  }

  if (b.prompt.trim().length === 0) {
    return { valid: false, error: 'prompt cannot be empty' };
  }

  if (b.enableWidget !== undefined && typeof b.enableWidget !== 'boolean') {
    return {
      valid: false,
      error: 'enableWidget must be a boolean',
      details: { received: typeof b.enableWidget },
    };
  }

  if (b.lat !== undefined) {
    if (typeof b.lat !== 'number' || isNaN(b.lat)) {
      return { valid: false, error: 'lat must be a number', details: { received: typeof b.lat } };
    }
    if (b.lat < -90 || b.lat > 90) {
      return {
        valid: false,
        error: 'lat must be between -90 and 90',
        details: { received: b.lat },
      };
    }
  }

  if (b.lng !== undefined) {
    if (typeof b.lng !== 'number' || isNaN(b.lng)) {
      return { valid: false, error: 'lng must be a number', details: { received: typeof b.lng } };
    }
    if (b.lng < -180 || b.lng > 180) {
      return {
        valid: false,
        error: 'lng must be between -180 and 180',
        details: { received: b.lng },
      };
    }
  }

  if ((b.lat !== undefined) !== (b.lng !== undefined)) {
    return { valid: false, error: 'lat and lng must both be provided or both be omitted' };
  }

  if (b.systemInstruction !== undefined && typeof b.systemInstruction !== 'string') {
    return {
      valid: false,
      error: 'systemInstruction must be a string',
      details: { received: typeof b.systemInstruction },
    };
  }

  return {
    valid: true,
    data: {
      prompt: b.prompt,
      enableWidget: b.enableWidget,
      lat: b.lat,
      lng: b.lng,
      systemInstruction: b.systemInstruction,
    } as GeminiRequest,
  };
}

/** Build Gemini request body */
function buildGeminiRequestBody(request: GeminiRequest): Record<string, unknown> {
  const requestBody: Record<string, unknown> = {
    contents: [{ parts: [{ text: request.prompt }] }],
    system_instruction: {
      parts: [{ text: request.systemInstruction ?? DEFAULT_SYSTEM_INSTRUCTION }],
    },
    tools: [{ google_maps: { enable_widget: request.enableWidget ?? true } }],
    generationConfig: { thinkingConfig: { thinkingBudget: 0 } },
  };

  if (request.lat !== undefined && request.lng !== undefined) {
    requestBody.toolConfig = {
      retrievalConfig: { latLng: { latitude: request.lat, longitude: request.lng } },
    };
  }

  return requestBody;
}

/** Call Gemini API */
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
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      log.error({ status: response.status, body: errorBody }, 'Gemini API error');
      throw new Error(`Gemini API returned status ${String(response.status)}: ${errorBody}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Gemini API request timed out after ${String(API_TIMEOUT_MS)}ms`);
    }
    throw error;
  }
}

/** Handle health endpoint */
function handleHealth(res: VercelResponse) {
  return jsonResponse(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: VERSION,
  });
}

/** Handle live token endpoint - generates ephemeral tokens for Live API */
async function handleLiveToken(res: VercelResponse) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return errorResponse(res, 'MISSING_API_KEY', 'GEMINI_API_KEY not configured', 500);
  }

  try {
    const client = new GoogleGenAI({ apiKey });

    // Token expires in 30 minutes (max session duration)
    const expireTime = new Date(Date.now() + 30 * 60 * 1000);
    // Must start session within 2 minutes
    const newSessionExpireTime = new Date(Date.now() + 2 * 60 * 1000);

    const token = await client.authTokens.create({
      config: {
        uses: 1,
        expireTime: expireTime.toISOString(),
        newSessionExpireTime: newSessionExpireTime.toISOString(),
        httpOptions: { apiVersion: 'v1alpha' },
      },
    });

    return jsonResponse(res, {
      token: token.name,
      expiresAt: expireTime.toISOString(),
    });
  } catch (error) {
    log.error(
      { error: error instanceof Error ? error.message : String(error) },
      'Live token error'
    );
    const message = error instanceof Error ? error.message : 'Failed to create token';
    return errorResponse(res, 'TOKEN_CREATION_ERROR', message, 500);
  }
}

/** Handle gemini/grounding endpoint */
async function handleGeminiGrounding(req: VercelRequest, res: VercelResponse) {
  // Validate content type
  const contentType = req.headers['content-type'];
  if (!contentType?.includes('application/json')) {
    return errorResponse(res, 'VALIDATION_ERROR', 'Content-Type must be application/json', 400, {
      received: contentType,
    });
  }

  // Validate body
  const validation = validateGeminiRequest(req.body);
  if (!validation.valid) {
    return errorResponse(res, 'VALIDATION_ERROR', validation.error, 400, validation.details);
  }

  // Check API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return errorResponse(res, 'MISSING_API_KEY', 'GEMINI_API_KEY not configured', 401);
  }

  try {
    const requestBody = buildGeminiRequestBody(validation.data);
    const response = await callGeminiApi(requestBody, apiKey);
    return jsonResponse(res, response);
  } catch (error) {
    log.error({ error: error instanceof Error ? error.message : String(error) }, 'Grounding error');
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'EXTERNAL_API_ERROR', message, 502);
  }
}

/** Main handler */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.url ?? '/';
  const method = req.method ?? 'GET';

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Route handling
  if (path.includes('/api/health') && method === 'GET') {
    return handleHealth(res);
  }

  if (path.includes('/api/live/token') && method === 'POST') {
    return handleLiveToken(res);
  }

  if (
    (path.includes('/api/gemini/grounding') || path.includes('/api/maps/grounding')) &&
    method === 'POST'
  ) {
    return handleGeminiGrounding(req, res);
  }

  // 404
  return errorResponse(res, 'NOT_FOUND', 'Route not found', 404, { path, method });
}
