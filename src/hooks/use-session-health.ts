/**
 * useSessionHealth Hook
 *
 * Periodically checks session validity to detect expiry during app usage.
 * Reports auth errors to the AuthErrorBoundary when session is no longer valid.
 *
 * @module src/hooks/use-session-health
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/components/auth';
import { useAuthError } from '@/components/AuthErrorBoundary';
import { AuthenticationError } from '@/lib/api/auth-fetch';

/**
 * Default interval for session health checks (5 minutes)
 */
const DEFAULT_CHECK_INTERVAL = 5 * 60 * 1000;

/**
 * Options for useSessionHealth hook
 */
interface UseSessionHealthOptions {
  /** Check interval in milliseconds (default: 5 minutes) */
  checkInterval?: number;
  /** Whether to enable periodic checks (default: true) */
  enabled?: boolean;
  /** Callback when session becomes invalid */
  onSessionInvalid?: () => void;
}

/**
 * Hook that monitors session health and reports expiry
 *
 * Uses the Better Auth session check endpoint to verify the session
 * is still valid. If the session has expired, it reports the error
 * to the AuthErrorBoundary which shows the session expired modal.
 *
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * function AppContent() {
 *   // Check session every 5 minutes
 *   useSessionHealth();
 *
 *   return <MyApp />;
 * }
 * ```
 */
export function useSessionHealth(options: UseSessionHealthOptions = {}) {
  const { checkInterval = DEFAULT_CHECK_INTERVAL, enabled = true, onSessionInvalid } = options;

  const { isAuthenticated, checkSession } = useAuth();
  const { reportAuthError } = useAuthError();
  const intervalRef = useRef<number | null>(null);
  const lastCheckRef = useRef<number>(0);

  /**
   * Perform a session health check
   */
  const checkHealth = useCallback(async () => {
    // Only check if user is supposed to be authenticated
    if (!isAuthenticated) {
      return;
    }

    try {
      // Use the auth provider's checkSession which calls the API
      const sessionValid = await checkSession();

      if (!sessionValid) {
        // Session has expired
        onSessionInvalid?.();
        reportAuthError(new AuthenticationError('Your session has expired', 'SESSION_EXPIRED'));
      }

      lastCheckRef.current = Date.now();
    } catch (error) {
      // Network error or other issue - don't report as auth error
      // The user might just be temporarily offline
      console.warn('Session health check failed:', error);
    }
  }, [isAuthenticated, checkSession, reportAuthError, onSessionInvalid]);

  // Set up periodic health checks
  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      return;
    }

    // Perform initial check
    void checkHealth();

    // Set up interval for periodic checks
    intervalRef.current = window.setInterval(() => {
      void checkHealth();
    }, checkInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, isAuthenticated, checkInterval, checkHealth]);

  // Also check on visibility change (when user returns to tab)
  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Only check if enough time has passed since last check
        const timeSinceLastCheck = Date.now() - lastCheckRef.current;
        if (timeSinceLastCheck >= checkInterval / 2) {
          void checkHealth();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, isAuthenticated, checkInterval, checkHealth]);

  return {
    /** Manually trigger a health check */
    checkNow: checkHealth,
  };
}

export default useSessionHealth;
