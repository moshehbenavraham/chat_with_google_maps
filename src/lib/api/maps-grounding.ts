/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { GenerateContentResponse } from '@google/genai';

/**
 * Proxy endpoint for maps grounding - calls server-side API
 * which keeps the API key secure.
 */
const PROXY_ENDPOINT = '/api/gemini/grounding';

/**
 * Request body for maps grounding proxy
 */
interface MapsGroundingRequest {
  prompt: string;
  enableWidget?: boolean;
  lat?: number;
  lng?: number;
  systemInstruction?: string;
}

/**
 * API error response format
 */
interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Calls the server-side proxy to get a Maps-grounded response.
 * The API key is handled securely on the server.
 *
 * @param options The request parameters.
 * @returns A promise that resolves to the API's GenerateContentResponse.
 */
export async function fetchMapsGroundedResponseREST({
  prompt,
  enableWidget = true,
  lat,
  lng,
  systemInstruction,
}: MapsGroundingRequest): Promise<GenerateContentResponse> {
  const requestBody: MapsGroundingRequest = {
    prompt,
    enableWidget,
    lat,
    lng,
    systemInstruction,
  };

  // Remove undefined values
  const cleanBody = Object.fromEntries(
    Object.entries(requestBody).filter(([, v]) => v !== undefined)
  );

  try {
    const response = await fetch(PROXY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanBody),
    });

    if (!response.ok) {
      let errorMessage = `API request failed with status ${String(response.status)}`;

      try {
        const errorData = (await response.json()) as ApiErrorResponse;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- error may be undefined depending on API response
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch {
        // Use default error message if JSON parsing fails
      }

      console.error('Error from Maps Grounding proxy:', errorMessage);
      throw new Error(errorMessage);
    }

    const data: unknown = await response.json();
    return data as GenerateContentResponse;
  } catch (error) {
    console.error(`Error calling Maps grounding proxy: ${String(error)}`);
    throw error;
  }
}

/**
 * SDK-based implementation - uses server-side proxy.
 * Kept for backwards compatibility with existing code.
 *
 * @param options The request parameters.
 * @returns A promise that resolves to the API's GenerateContentResponse.
 */
export async function fetchMapsGroundedResponseSDK({
  prompt,
  enableWidget = true,
  lat,
  lng,
  systemInstruction,
}: MapsGroundingRequest): Promise<GenerateContentResponse> {
  // Route through REST proxy for API key security
  return fetchMapsGroundedResponseREST({
    prompt,
    enableWidget,
    lat,
    lng,
    systemInstruction,
  });
}
