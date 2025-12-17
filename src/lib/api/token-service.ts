/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Token service for fetching ephemeral tokens from the backend.
 * These tokens are used to authenticate with the Gemini Live API
 * without exposing the API key in the browser.
 */

export interface TokenResponse {
  token: string;
  expiresAt: string;
}

export interface TokenError {
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Fetches an ephemeral token from the backend for Live API authentication.
 * The token is single-use and expires after 30 minutes.
 *
 * @throws {Error} If the token fetch fails
 * @returns Promise<TokenResponse> The token and expiration time
 */
export async function fetchLiveToken(): Promise<TokenResponse> {
  const response = await fetch('/api/live/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as TokenError;
    const message = errorData.error?.message ?? `Failed to fetch token: ${String(response.status)}`;
    throw new Error(message);
  }

  return response.json() as Promise<TokenResponse>;
}
