/**
 * SignUpForm Component
 *
 * Email/password sign-up form with password confirmation.
 * Includes validation, error handling, and loading states.
 *
 * @module src/components/auth/SignUpForm
 */

import React, { useState, useCallback, type FormEvent, type ChangeEvent } from 'react';
import { signUp } from '@/lib/auth-client';
import {
  validateSignUpForm,
  isFormValid,
  MIN_PASSWORD_LENGTH,
  type SignUpFormData,
} from '@/lib/auth-validation';
import { AuthError } from './AuthError';
import './auth.css';

/**
 * Props for SignUpForm
 */
interface SignUpFormProps {
  /** Callback when sign-up succeeds */
  onSuccess?: () => void;
  /** Callback to switch to sign-in form */
  onSwitchToSignIn?: () => void;
}

/**
 * SignUpForm Component
 *
 * Features:
 * - Email, password, and confirm password inputs
 * - Optional name field
 * - Client-side validation
 * - Password match verification
 * - Loading state during submission
 * - Error display from server
 * - Switch to sign-in link
 *
 * @example
 * ```tsx
 * <SignUpForm
 *   onSuccess={() => navigate('/dashboard')}
 *   onSwitchToSignIn={() => setMode('signin')}
 * />
 * ```
 */
export function SignUpForm({ onSuccess, onSwitchToSignIn }: SignUpFormProps) {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Clear specific field error
  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      if (!prev[field]) return prev;
      const { [field]: _, ...next } = prev;
      return next;
    });
  }, []);

  // Handle email input change
  const handleEmailChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
      clearFieldError('email');
    },
    [clearFieldError]
  );

  // Handle name input change
  const handleNameChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value);
      clearFieldError('name');
    },
    [clearFieldError]
  );

  // Handle password input change
  const handlePasswordChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      clearFieldError('password');
      // Also clear confirm error since password changed
      clearFieldError('confirmPassword');
    },
    [clearFieldError]
  );

  // Handle confirm password input change
  const handleConfirmPasswordChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setConfirmPassword(e.target.value);
      clearFieldError('confirmPassword');
    },
    [clearFieldError]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setServerError(null);

      // Validate form
      const formData: SignUpFormData = {
        email: email.trim(),
        password,
        confirmPassword,
        name: name.trim() || undefined,
      };
      const errors = validateSignUpForm(formData);

      if (!isFormValid(errors)) {
        setFieldErrors(errors);
        return;
      }

      setFieldErrors({});
      setIsLoading(true);

      try {
        const result = await signUp.email({
          email: email.trim(),
          password,
          name: name.trim(),
        });

        if (result.error) {
          setServerError(result.error.message ?? 'Sign up failed');
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
    [email, password, confirmPassword, name, onSuccess]
  );

  return (
    <div className="auth-card">
      <h2 className="auth-title">Create Account</h2>

      <AuthError error={serverError} />

      <form className="auth-form" onSubmit={e => void handleSubmit(e)} noValidate>
        <div className="auth-field">
          <label htmlFor="signup-name" className="auth-label">
            Name (optional)
          </label>
          <input
            id="signup-name"
            type="text"
            className="auth-input"
            value={name}
            onChange={handleNameChange}
            placeholder="Your name"
            autoComplete="name"
            disabled={isLoading}
            aria-invalid={!!fieldErrors.name}
            aria-describedby={fieldErrors.name ? 'signup-name-error' : undefined}
          />
          {fieldErrors.name && (
            <span id="signup-name-error" className="auth-hint error">
              {fieldErrors.name}
            </span>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="signup-email" className="auth-label">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            className="auth-input"
            value={email}
            onChange={handleEmailChange}
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isLoading}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined}
          />
          {fieldErrors.email && (
            <span id="signup-email-error" className="auth-hint error">
              {fieldErrors.email}
            </span>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="signup-password" className="auth-label">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            className="auth-input"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Create a password"
            autoComplete="new-password"
            disabled={isLoading}
            aria-invalid={!!fieldErrors.password}
            aria-describedby="signup-password-hint"
          />
          <span
            id="signup-password-hint"
            className={`auth-hint ${fieldErrors.password ? 'error' : ''}`}
          >
            {fieldErrors.password ?? `Must be at least ${String(MIN_PASSWORD_LENGTH)} characters`}
          </span>
        </div>

        <div className="auth-field">
          <label htmlFor="signup-confirm" className="auth-label">
            Confirm Password
          </label>
          <input
            id="signup-confirm"
            type="password"
            className="auth-input"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder="Confirm your password"
            autoComplete="new-password"
            disabled={isLoading}
            aria-invalid={!!fieldErrors.confirmPassword}
            aria-describedby={fieldErrors.confirmPassword ? 'signup-confirm-error' : undefined}
          />
          {fieldErrors.confirmPassword && (
            <span id="signup-confirm-error" className="auth-hint error">
              {fieldErrors.confirmPassword}
            </span>
          )}
        </div>

        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? <span className="auth-loading" /> : 'Create Account'}
        </button>
      </form>

      {onSwitchToSignIn && (
        <div className="auth-switch">
          <span>Already have an account? </span>
          <button
            type="button"
            className="auth-switch-link"
            onClick={onSwitchToSignIn}
            disabled={isLoading}
          >
            Sign In
          </button>
        </div>
      )}
    </div>
  );
}

export default SignUpForm;
