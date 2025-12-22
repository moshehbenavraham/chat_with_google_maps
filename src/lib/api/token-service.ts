/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Token service for fetching ephemeral tokens from the backend.
 * These tokens are used to authenticate with the Gemini Live API
 * without exposing the API key in the browser.
 */

import { jsonFetch, AuthenticationError } from './auth-fetch';

export interface TokenResponse {
  token: string;
  expiresAt: string;
  sessionId: string;
}

export interface TokenError {
  error?: {
    code: string;
    message: string;
  };
}

// Re-export AuthenticationError for consumers
export { AuthenticationError };

/**
 * Fetches an ephemeral token from the backend for Live API authentication.
 * The token is single-use and expires after 30 minutes.
 *
 * @throws {AuthenticationError} If the user is not authenticated (401)
 * @throws {Error} If the token fetch fails for other reasons
 * @returns Promise<TokenResponse> The token and expiration time
 */
export async function fetchLiveToken(): Promise<TokenResponse> {
  // Uses fetchWithAuth which handles 401 and includes credentials
  const response = await jsonFetch('/api/live/token', {
    method: 'POST',
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as TokenError;
    const message = errorData.error?.message ?? `Failed to fetch token: ${String(response.status)}`;
    throw new Error(message);
  }

  return response.json() as Promise<TokenResponse>;
}
