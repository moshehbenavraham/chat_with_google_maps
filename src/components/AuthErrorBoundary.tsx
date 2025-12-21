/**
 * AuthErrorBoundary Component
 *
 * Provides centralized handling for authentication errors across the app.
 * Shows a session expired modal when auth errors occur and handles redirect to landing.
 *
 * Uses React Context to allow any component to report auth errors, since React
 * Error Boundaries don't catch errors in async code (API calls, event handlers).
 *
 * @module src/components/AuthErrorBoundary
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '@/components/auth';
import { isAuthenticationError, type AuthenticationError } from '@/lib/api/auth-fetch';

/**
 * Auth error state stored in context
 */
interface AuthErrorState {
  /** The authentication error that occurred */
  error: AuthenticationError | null;
  /** Timestamp when the error occurred */
  timestamp: number | null;
}

/**
 * Context value for reporting and handling auth errors
 */
interface AuthErrorContextValue {
  /** Current auth error state */
  authError: AuthErrorState;
  /** Report an authentication error from anywhere in the app */
  reportAuthError: (error: AuthenticationError) => void;
  /** Clear the current auth error */
  clearAuthError: () => void;
}

const AuthErrorContext = createContext<AuthErrorContextValue | undefined>(undefined);

/**
 * Hook to access auth error reporting from any component
 *
 * @returns Context value with reportAuthError function
 * @throws Error if used outside AuthErrorBoundary
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { reportAuthError } = useAuthError();
 *
 *   const fetchData = async () => {
 *     try {
 *       await fetchWithAuth('/api/data');
 *     } catch (error) {
 *       if (isAuthenticationError(error)) {
 *         reportAuthError(error);
 *       }
 *     }
 *   };
 * }
 * ```
 */
export function useAuthError(): AuthErrorContextValue {
  const context = useContext(AuthErrorContext);
  if (context === undefined) {
    throw new Error('useAuthError must be used within an AuthErrorBoundary');
  }
  return context;
}

/**
 * Helper function to handle auth errors in API calls.
 * Reports the error if it's an AuthenticationError, otherwise re-throws.
 *
 * @param error - The error to handle
 * @param reportFn - The reportAuthError function from useAuthError
 * @throws The original error if it's not an AuthenticationError
 */
export function handleAuthError(
  error: unknown,
  reportFn: (error: AuthenticationError) => void
): void {
  if (isAuthenticationError(error)) {
    reportFn(error);
  } else {
    throw error;
  }
}

/**
 * Props for AuthErrorBoundary
 */
interface AuthErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Session Expired Modal Component
 *
 * Displayed when an auth error is detected.
 * Provides options to sign in again or go to landing page.
 */
function SessionExpiredModal({
  onSignIn,
  onDismiss,
}: {
  onSignIn: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      className="auth-error-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        className="auth-error-modal"
        style={{
          backgroundColor: 'var(--Neutral-800, #262626)',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--Red-500, #ef4444)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}
        >
          <Lock className="size-6 text-white" />
        </div>

        <h2
          style={{
            color: 'var(--Neutral-50, #fafafa)',
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: '0.5rem',
          }}
        >
          Session Expired
        </h2>

        <p
          style={{
            color: 'var(--Neutral-400, #a3a3a3)',
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
            lineHeight: 1.5,
          }}
        >
          Your session has expired. Please sign in again to continue using the app.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={onDismiss}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid var(--Neutral-600, #525252)',
              backgroundColor: 'transparent',
              color: 'var(--Neutral-300, #d4d4d4)',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--Neutral-700, #3d3d3d)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Go to Home
          </button>

          <button
            onClick={onSignIn}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'var(--Green-500, #22c55e)',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--Green-600, #16a34a)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'var(--Green-500, #22c55e)';
            }}
          >
            Sign In Again
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * AuthErrorBoundary Component
 *
 * Wraps the application to provide centralized auth error handling.
 * When an auth error is reported via useAuthError(), displays a modal
 * and handles navigation to the auth page.
 *
 * @example
 * ```tsx
 * // In main.tsx or router
 * <AuthProvider>
 *   <AuthErrorBoundary>
 *     <RouterProvider router={router} />
 *   </AuthErrorBoundary>
 * </AuthProvider>
 * ```
 */
export function AuthErrorBoundary({ children }: AuthErrorBoundaryProps) {
  const navigate = useNavigate();
  const { handleSignOut } = useAuth();

  const [authError, setAuthError] = useState<AuthErrorState>({
    error: null,
    timestamp: null,
  });

  /**
   * Report an authentication error
   */
  const reportAuthError = useCallback((error: AuthenticationError) => {
    setAuthError({
      error,
      timestamp: Date.now(),
    });
  }, []);

  /**
   * Clear the current auth error
   */
  const clearAuthError = useCallback(() => {
    setAuthError({
      error: null,
      timestamp: null,
    });
  }, []);

  /**
   * Handle sign in - clears auth state and navigates to auth page
   */
  const handleSignIn = useCallback(() => {
    // Clear stale auth state then navigate
    handleSignOut()
      .then(() => {
        clearAuthError();
      })
      .catch((err: unknown) => {
        console.error('Error signing out:', err);
        clearAuthError();
      })
      .finally(() => {
        void navigate('/auth', { replace: true });
      });
  }, [handleSignOut, clearAuthError, navigate]);

  /**
   * Handle dismiss - clears auth state and navigates to landing page
   */
  const handleDismiss = useCallback(() => {
    // Clear stale auth state then navigate
    handleSignOut()
      .then(() => {
        clearAuthError();
      })
      .catch((err: unknown) => {
        console.error('Error signing out:', err);
        clearAuthError();
      })
      .finally(() => {
        void navigate('/', { replace: true });
      });
  }, [handleSignOut, clearAuthError, navigate]);

  // Auto-clear error after 30 seconds if user doesn't interact
  useEffect(() => {
    if (authError.timestamp) {
      const timeout = setTimeout(handleDismiss, 30000);
      return () => {
        clearTimeout(timeout);
      };
    }
    return undefined;
  }, [authError.timestamp, handleDismiss]);

  const contextValue: AuthErrorContextValue = {
    authError,
    reportAuthError,
    clearAuthError,
  };

  return (
    <AuthErrorContext.Provider value={contextValue}>
      {children}
      {authError.error && <SessionExpiredModal onSignIn={handleSignIn} onDismiss={handleDismiss} />}
    </AuthErrorContext.Provider>
  );
}

export default AuthErrorBoundary;
