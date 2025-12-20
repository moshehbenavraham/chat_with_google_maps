/**
 * Better Auth React Client Configuration
 *
 * Creates and exports the authentication client for React components.
 * This client communicates with the server-side Better Auth instance
 * mounted at /api/auth/* endpoints.
 *
 * @module src/lib/auth-client
 */

import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth client instance for React
 *
 * Configuration:
 * - Empty baseURL uses same-origin requests (works with Vite proxy)
 * - Credentials are included automatically by Better Auth
 *
 * Exports:
 * - signIn: Sign in with email/password
 * - signUp: Create new account with email/password
 * - signOut: Invalidate current session
 * - useSession: React hook for session state
 */
export const authClient = createAuthClient({
  /**
   * Base URL for auth API requests
   * Empty string means same-origin (relative to current host)
   * Vite dev proxy forwards /api/* to backend
   */
  baseURL: '',
});

/**
 * Sign in with email and password
 */
export const signIn = authClient.signIn;

/**
 * Sign up with email and password
 */
export const signUp = authClient.signUp;

/**
 * Sign out current user
 */
export const signOut = authClient.signOut;

/**
 * React hook to access session state
 * Returns: { data: session, isPending, error }
 */
export const useSession = authClient.useSession;

/**
 * Re-export the full client for advanced use cases
 */
export default authClient;
