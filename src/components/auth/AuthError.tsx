/**
 * AuthError Component
 *
 * Displays authentication error messages in a user-friendly format.
 * Translates technical error codes to human-readable messages.
 *
 * @module src/components/auth/AuthError
 */

import React from 'react';
import './auth.css';

/**
 * Props for the AuthError component
 */
interface AuthErrorProps {
  /** Error message or error object to display */
  error: string | Error | null | undefined;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Map of Better Auth error codes to user-friendly messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: 'Invalid email or password. Please try again.',
  USER_ALREADY_EXISTS: 'An account with this email already exists.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters.',
  INVALID_PASSWORD: 'Password does not meet requirements.',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

/**
 * Extract user-friendly message from error
 */
function getErrorMessage(error: string | Error | null | undefined): string {
  if (!error) return '';

  const errorString = error instanceof Error ? error.message : error;

  // Check if error matches a known error code
  for (const [code, message] of Object.entries(ERROR_MESSAGES)) {
    if (errorString.toUpperCase().includes(code)) {
      return message;
    }
  }

  // Return the original message if no match found
  return errorString;
}

/**
 * AuthError displays authentication errors
 *
 * Features:
 * - Translates error codes to friendly messages
 * - Renders nothing when no error
 * - Accessible with role="alert"
 */
export function AuthError({ error, className = '' }: AuthErrorProps) {
  const message = getErrorMessage(error);

  if (!message) {
    return null;
  }

  return (
    <div className={`auth-error ${className}`.trim()} role="alert">
      {message}
    </div>
  );
}

export default AuthError;
