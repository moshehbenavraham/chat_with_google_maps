/**
 * Auth-aware Fetch Utilities
 *
 * Provides a fetch wrapper that handles 401 authentication errors
 * and throws typed AuthenticationError for consistent error handling.
 *
 * @module src/lib/api/auth-fetch
 */

/**
 * Error thrown when a 401 Unauthorized response is received.
 * Used to trigger session expiry handling in the UI.
 */
export class AuthenticationError extends Error {
  /** HTTP status code (always 401) */
  readonly status = 401;
  /** Error code from API response, if available */
  readonly code: string;

  constructor(message = 'Authentication required', code = 'AUTH_REQUIRED') {
    super(message);
    this.name = 'AuthenticationError';
    this.code = code;
  }
}

/**
 * Type guard to check if an error is an AuthenticationError
 */
export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

/**
 * API error response shape from backend
 */
interface ApiErrorResponse {
  error?: string;
  message?: string;
  code?: string;
}

/**
 * Fetch wrapper that automatically handles 401 responses.
 * Includes credentials by default to send session cookies.
 *
 * @param url - The URL to fetch
 * @param options - Fetch options (credentials: 'include' is added by default)
 * @returns The fetch Response object
 * @throws {AuthenticationError} When a 401 response is received
 * @throws {Error} For other non-OK responses
 *
 * @example
 * ```ts
 * try {
 *   const response = await fetchWithAuth('/api/protected-resource');
 *   const data = await response.json();
 * } catch (error) {
 *   if (isAuthenticationError(error)) {
 *     // Handle session expiry - redirect to login
 *   }
 *   throw error;
 * }
 * ```
 */
export async function fetchWithAuth(url: string, options?: RequestInit): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Always send cookies for session auth
  });

  if (response.status === 401) {
    // Try to extract error details from response
    let message = 'Authentication required';
    let code = 'AUTH_REQUIRED';

    try {
      const errorData = (await response.clone().json()) as ApiErrorResponse;
      message = errorData.message ?? errorData.error ?? message;
      code = errorData.code ?? code;
    } catch {
      // JSON parsing failed, use defaults
    }

    throw new AuthenticationError(message, code);
  }

  return response;
}

/**
 * Converts HeadersInit to a plain record for merging.
 * Handles Headers objects, arrays, and plain objects.
 */
function headersToRecord(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};

  if (headers instanceof Headers) {
    const record: Record<string, string> = {};
    headers.forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }

  if (Array.isArray(headers)) {
    const record: Record<string, string> = {};
    for (const [key, value] of headers) {
      record[key] = value;
    }
    return record;
  }

  return headers;
}

/**
 * Creates a fetch function pre-configured with common options.
 * Useful for creating API-specific fetch utilities.
 *
 * @param baseOptions - Default options to merge with each request
 * @returns A configured fetch function
 *
 * @example
 * ```ts
 * const apiFetch = createAuthFetch({
 *   headers: { 'Content-Type': 'application/json' },
 * });
 *
 * const response = await apiFetch('/api/data', {
 *   method: 'POST',
 *   body: JSON.stringify({ key: 'value' }),
 * });
 * ```
 */
export function createAuthFetch(baseOptions: RequestInit = {}) {
  return (url: string, options?: RequestInit): Promise<Response> => {
    const mergedOptions: RequestInit = {
      ...baseOptions,
      ...options,
      headers: {
        ...headersToRecord(baseOptions.headers),
        ...headersToRecord(options?.headers),
      },
    };
    return fetchWithAuth(url, mergedOptions);
  };
}

/**
 * Pre-configured fetch for JSON API requests.
 * Sets Content-Type header and includes credentials.
 */
export const jsonFetch = createAuthFetch({
  headers: {
    'Content-Type': 'application/json',
  },
});
