/**
 * SignInForm Component
 *
 * Email/password sign-in form with validation and error handling.
 * Reusable for page or modal integration.
 *
 * @module src/components/auth/SignInForm
 */

import React, { useState, useCallback, type FormEvent, type ChangeEvent } from 'react';
import { signIn } from '@/lib/auth-client';
import { validateSignInForm, isFormValid, type SignInFormData } from '@/lib/auth-validation';
import { AuthError } from './AuthError';
import './auth.css';

/**
 * Props for SignInForm
 */
interface SignInFormProps {
  /** Callback when sign-in succeeds */
  onSuccess?: () => void;
  /** Callback to switch to sign-up form */
  onSwitchToSignUp?: () => void;
}

/**
 * SignInForm Component
 *
 * Features:
 * - Email and password inputs
 * - Client-side validation
 * - Loading state during submission
 * - Error display from server
 * - Switch to sign-up link
 *
 * @example
 * ```tsx
 * <SignInForm
 *   onSuccess={() => navigate('/dashboard')}
 *   onSwitchToSignUp={() => setMode('signup')}
 * />
 * ```
 */
export function SignInForm({ onSuccess, onSwitchToSignUp }: SignInFormProps) {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Handle email input change
  const handleEmailChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
      // Clear field error on change
      if (fieldErrors.email) {
        setFieldErrors(prev => {
          const next = { ...prev };
          delete next.email;
          return next;
        });
      }
    },
    [fieldErrors.email]
  );

  // Handle password input change
  const handlePasswordChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      // Clear field error on change
      if (fieldErrors.password) {
        setFieldErrors(prev => {
          const next = { ...prev };
          delete next.password;
          return next;
        });
      }
    },
    [fieldErrors.password]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setServerError(null);

      // Validate form
      const formData: SignInFormData = { email: email.trim(), password };
      const errors = validateSignInForm(formData);

      if (!isFormValid(errors)) {
        setFieldErrors(errors);
        return;
      }

      setFieldErrors({});
      setIsLoading(true);

      try {
        const result = await signIn.email({
          email: email.trim(),
          password,
        });

        if (result.error) {
          setServerError(result.error.message ?? 'Sign in failed');
          return;
        }

        // Success - call callback
        onSuccess?.();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred';
        setServerError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, onSuccess]
  );

  return (
    <div className="auth-card">
      <h2 className="auth-title">Sign In</h2>

      <AuthError error={serverError} />

      <form className="auth-form" onSubmit={e => void handleSubmit(e)} noValidate>
        <div className="auth-field">
          <label htmlFor="signin-email" className="auth-label">
            Email
          </label>
          <input
            id="signin-email"
            type="email"
            className="auth-input"
            value={email}
            onChange={handleEmailChange}
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isLoading}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? 'signin-email-error' : undefined}
          />
          {fieldErrors.email && (
            <span id="signin-email-error" className="auth-hint error">
              {fieldErrors.email}
            </span>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="signin-password" className="auth-label">
            Password
          </label>
          <input
            id="signin-password"
            type="password"
            className="auth-input"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={isLoading}
            aria-invalid={!!fieldErrors.password}
            aria-describedby={fieldErrors.password ? 'signin-password-error' : undefined}
          />
          {fieldErrors.password && (
            <span id="signin-password-error" className="auth-hint error">
              {fieldErrors.password}
            </span>
          )}
        </div>

        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? <span className="auth-loading" /> : 'Sign In'}
        </button>
      </form>

      {onSwitchToSignUp && (
        <div className="auth-switch">
          <span>Do not have an account? </span>
          <button
            type="button"
            className="auth-switch-link"
            onClick={onSwitchToSignUp}
            disabled={isLoading}
          >
            Sign Up
          </button>
        </div>
      )}
    </div>
  );
}

export default SignInForm;
