/**
 * Request Validation Middleware
 *
 * Validates incoming request bodies against expected schemas.
 */

import type { Context, MiddlewareHandler, Next } from 'hono';
import { ValidationError } from '../lib/errors.js';
import type { GeminiGroundingRequest } from '../lib/types.js';

/**
 * Validate that request body is valid JSON.
 * Throws ValidationError if body is empty or invalid.
 */
export const validateJsonBody: MiddlewareHandler = async (c: Context, next: Next) => {
  const contentType = c.req.header('content-type');

  if (!contentType?.includes('application/json')) {
    throw new ValidationError('Content-Type must be application/json', { received: contentType });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- json() returns any, we validate below
    const body = await c.req.json();

    if (!body || typeof body !== 'object') {
      throw new ValidationError('Request body must be a JSON object');
    }

    // Store parsed body for use in route handlers
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- body validated as object above
    c.set('body', body);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError('Invalid JSON in request body');
  }

  await next();
};

/**
 * Validate Gemini grounding request body.
 * Ensures required fields are present and properly typed.
 */
export const validateGeminiRequest: MiddlewareHandler = async (c: Context, next: Next) => {
  const body = c.get('body');

  // Validate required field: prompt
  if (typeof body.prompt !== 'string') {
    throw new ValidationError('prompt is required and must be a string', {
      received: typeof body.prompt,
    });
  }

  if (body.prompt.trim().length === 0) {
    throw new ValidationError('prompt cannot be empty');
  }

  // Validate optional field: enableWidget
  if (body.enableWidget !== undefined && typeof body.enableWidget !== 'boolean') {
    throw new ValidationError('enableWidget must be a boolean', {
      received: typeof body.enableWidget,
    });
  }

  // Validate optional field: lat
  if (body.lat !== undefined) {
    if (typeof body.lat !== 'number' || isNaN(body.lat)) {
      throw new ValidationError('lat must be a number', { received: typeof body.lat });
    }
    if (body.lat < -90 || body.lat > 90) {
      throw new ValidationError('lat must be between -90 and 90', { received: body.lat });
    }
  }

  // Validate optional field: lng
  if (body.lng !== undefined) {
    if (typeof body.lng !== 'number' || isNaN(body.lng)) {
      throw new ValidationError('lng must be a number', { received: typeof body.lng });
    }
    if (body.lng < -180 || body.lng > 180) {
      throw new ValidationError('lng must be between -180 and 180', { received: body.lng });
    }
  }

  // Validate lat/lng pair (both must be present or both absent)
  if ((body.lat !== undefined) !== (body.lng !== undefined)) {
    throw new ValidationError('lat and lng must both be provided or both be omitted');
  }

  // Validate optional field: systemInstruction
  if (body.systemInstruction !== undefined && typeof body.systemInstruction !== 'string') {
    throw new ValidationError('systemInstruction must be a string', {
      received: typeof body.systemInstruction,
    });
  }

  // Store validated request
  const validatedRequest: GeminiGroundingRequest = {
    prompt: body.prompt,
    enableWidget: body.enableWidget,
    lat: body.lat,
    lng: body.lng,
    systemInstruction: body.systemInstruction,
  };

  c.set('validatedRequest', validatedRequest);

  await next();
};
