/**
 * Auth Form Validation Utilities
 *
 * Provides validation functions for authentication forms.
 * Ensures email format, password requirements, and field matching.
 *
 * @module src/lib/auth-validation
 */

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Email validation regex
 * Matches standard email format: local@domain.tld
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Minimum password length (matches server config)
 */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Validate email format
 *
 * @param email - Email address to validate
 * @returns Validation result with error message if invalid
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'Email is required' };
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true };
}

/**
 * Validate password requirements
 *
 * @param password - Password to validate
 * @returns Validation result with error message if invalid
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      error: `Password must be at least ${String(MIN_PASSWORD_LENGTH)} characters`,
    };
  }

  return { valid: true };
}

/**
 * Validate password confirmation matches
 *
 * @param password - Original password
 * @param confirmPassword - Confirmation password
 * @returns Validation result with error message if mismatch
 */
export function validatePasswordMatch(password: string, confirmPassword: string): ValidationResult {
  if (!confirmPassword) {
    return { valid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match' };
  }

  return { valid: true };
}

/**
 * Validate name field (optional but must be valid if provided)
 *
 * @param name - Name to validate
 * @returns Validation result
 */
export function validateName(name: string | undefined): ValidationResult {
  // Name is optional
  if (!name || name.trim() === '') {
    return { valid: true };
  }

  // If provided, should have at least 1 character
  if (name.trim().length < 1) {
    return { valid: false, error: 'Name cannot be empty' };
  }

  return { valid: true };
}

/**
 * Sign-in form data type
 */
export interface SignInFormData {
  email: string;
  password: string;
}

/**
 * Sign-up form data type
 */
export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
}

/**
 * Validate sign-in form
 *
 * @param data - Sign-in form data
 * @returns Object with field errors, empty if valid
 */
export function validateSignInForm(data: SignInFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  const emailResult = validateEmail(data.email);
  if (!emailResult.valid && emailResult.error) {
    errors.email = emailResult.error;
  }

  const passwordResult = validatePassword(data.password);
  if (!passwordResult.valid && passwordResult.error) {
    errors.password = passwordResult.error;
  }

  return errors;
}

/**
 * Validate sign-up form
 *
 * @param data - Sign-up form data
 * @returns Object with field errors, empty if valid
 */
export function validateSignUpForm(data: SignUpFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  const emailResult = validateEmail(data.email);
  if (!emailResult.valid && emailResult.error) {
    errors.email = emailResult.error;
  }

  const passwordResult = validatePassword(data.password);
  if (!passwordResult.valid && passwordResult.error) {
    errors.password = passwordResult.error;
  }

  const matchResult = validatePasswordMatch(data.password, data.confirmPassword);
  if (!matchResult.valid && matchResult.error) {
    errors.confirmPassword = matchResult.error;
  }

  if (data.name !== undefined) {
    const nameResult = validateName(data.name);
    if (!nameResult.valid && nameResult.error) {
      errors.name = nameResult.error;
    }
  }

  return errors;
}

/**
 * Check if form has no validation errors
 *
 * @param errors - Error object from validation
 * @returns True if no errors
 */
export function isFormValid(errors: Record<string, string>): boolean {
  return Object.keys(errors).length === 0;
}
