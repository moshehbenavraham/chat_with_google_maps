/**
 * AuthPage Component
 *
 * Container page for authentication forms.
 * Handles switching between sign-in and sign-up forms.
 *
 * @module src/components/auth/AuthPage
 */

import React, { useState, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import './auth.css';

/**
 * Authentication mode
 */
type AuthMode = 'signin' | 'signup';

/**
 * Props for AuthPage
 */
interface AuthPageProps {
  /** Initial mode to display */
  initialMode?: AuthMode;
  /** Callback when authentication succeeds */
  onAuthSuccess?: () => void;
}

/**
 * AuthPage Component
 *
 * Features:
 * - Switch between sign-in and sign-up forms
 * - Shows user info when authenticated
 * - Sign-out functionality for authenticated users
 *
 * @example
 * ```tsx
 * // As a standalone page
 * <AuthPage onAuthSuccess={() => navigate('/dashboard')} />
 *
 * // Starting with sign-up
 * <AuthPage initialMode="signup" />
 * ```
 */
export function AuthPage({ initialMode = 'signin', onAuthSuccess }: AuthPageProps) {
  const { user, isAuthenticated, isLoading, handleSignOut } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Switch to sign-up mode
  const handleSwitchToSignUp = useCallback(() => {
    setMode('signup');
  }, []);

  // Switch to sign-in mode
  const handleSwitchToSignIn = useCallback(() => {
    setMode('signin');
  }, []);

  // Handle successful authentication
  const handleSuccess = useCallback(() => {
    onAuthSuccess?.();
  }, [onAuthSuccess]);

  // Handle sign out click
  const handleSignOutClick = useCallback(async () => {
    await handleSignOut();
  }, [handleSignOut]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <span className="auth-loading" />
            <p style={{ marginTop: '1rem', color: '#888888' }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show authenticated user info
  if (isAuthenticated && user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2 className="auth-title">Signed In</h2>
          <div className="auth-user-info">
            <p className="auth-user-email">{user.email}</p>
            {user.name && <p style={{ color: '#888888', margin: 0 }}>{user.name}</p>}
            <button
              type="button"
              className="auth-sign-out-button"
              onClick={() => void handleSignOutClick()}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication forms
  return (
    <div className="auth-page">
      {mode === 'signin' ? (
        <SignInForm onSuccess={handleSuccess} onSwitchToSignUp={handleSwitchToSignUp} />
      ) : (
        <SignUpForm onSuccess={handleSuccess} onSwitchToSignIn={handleSwitchToSignIn} />
      )}
    </div>
  );
}

export default AuthPage;
