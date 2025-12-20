/**
 * Auth Validation Tests
 *
 * Unit tests for authentication form validation utilities.
 *
 * @module src/lib/__tests__/auth-validation.test
 */

import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateName,
  validateSignInForm,
  validateSignUpForm,
  isFormValid,
  MIN_PASSWORD_LENGTH,
} from '../auth-validation';

describe('validateEmail', () => {
  it('should return valid for correct email format', () => {
    expect(validateEmail('test@example.com')).toEqual({ valid: true });
    expect(validateEmail('user.name@domain.co.uk')).toEqual({ valid: true });
    expect(validateEmail('user+tag@example.org')).toEqual({ valid: true });
  });

  it('should return error for empty email', () => {
    const result = validateEmail('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Email is required');
  });

  it('should return error for whitespace-only email', () => {
    const result = validateEmail('   ');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Email is required');
  });

  it('should return error for invalid email format', () => {
    const invalidEmails = [
      'notanemail',
      'missing@tld',
      '@nodomain.com',
      'spaces in@email.com',
      'no@dots',
    ];

    for (const email of invalidEmails) {
      const result = validateEmail(email);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Please enter a valid email address');
    }
  });
});

describe('validatePassword', () => {
  it('should return valid for password meeting minimum length', () => {
    const validPassword = 'a'.repeat(MIN_PASSWORD_LENGTH);
    expect(validatePassword(validPassword)).toEqual({ valid: true });
  });

  it('should return valid for longer passwords', () => {
    expect(validatePassword('mysecurepassword123')).toEqual({ valid: true });
  });

  it('should return error for empty password', () => {
    const result = validatePassword('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Password is required');
  });

  it('should return error for password shorter than minimum', () => {
    const shortPassword = 'a'.repeat(MIN_PASSWORD_LENGTH - 1);
    const result = validatePassword(shortPassword);
    expect(result.valid).toBe(false);
    expect(result.error).toBe(
      `Password must be at least ${String(MIN_PASSWORD_LENGTH)} characters`
    );
  });
});

describe('validatePasswordMatch', () => {
  it('should return valid when passwords match', () => {
    expect(validatePasswordMatch('password123', 'password123')).toEqual({
      valid: true,
    });
  });

  it('should return error for empty confirmation', () => {
    const result = validatePasswordMatch('password123', '');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Please confirm your password');
  });

  it('should return error when passwords do not match', () => {
    const result = validatePasswordMatch('password123', 'password456');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Passwords do not match');
  });
});

describe('validateName', () => {
  it('should return valid for empty name (optional field)', () => {
    expect(validateName('')).toEqual({ valid: true });
    expect(validateName(undefined)).toEqual({ valid: true });
  });

  it('should return valid for non-empty name', () => {
    expect(validateName('John')).toEqual({ valid: true });
    expect(validateName('Jane Doe')).toEqual({ valid: true });
  });
});

describe('validateSignInForm', () => {
  it('should return empty errors for valid form', () => {
    const errors = validateSignInForm({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(errors).toEqual({});
  });

  it('should return email error for invalid email', () => {
    const errors = validateSignInForm({
      email: 'invalid',
      password: 'password123',
    });
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeUndefined();
  });

  it('should return password error for short password', () => {
    const errors = validateSignInForm({
      email: 'test@example.com',
      password: 'short',
    });
    expect(errors.email).toBeUndefined();
    expect(errors.password).toBeDefined();
  });

  it('should return multiple errors for invalid form', () => {
    const errors = validateSignInForm({
      email: '',
      password: '',
    });
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
  });
});

describe('validateSignUpForm', () => {
  it('should return empty errors for valid form', () => {
    const errors = validateSignUpForm({
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(errors).toEqual({});
  });

  it('should return error for password mismatch', () => {
    const errors = validateSignUpForm({
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password456',
    });
    expect(errors.confirmPassword).toBe('Passwords do not match');
  });

  it('should validate all fields', () => {
    const errors = validateSignUpForm({
      email: '',
      password: 'short',
      confirmPassword: 'different',
    });
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
    expect(errors.confirmPassword).toBeDefined();
  });

  it('should accept optional name field', () => {
    const errors = validateSignUpForm({
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      name: 'John Doe',
    });
    expect(errors).toEqual({});
  });
});

describe('isFormValid', () => {
  it('should return true for empty errors object', () => {
    expect(isFormValid({})).toBe(true);
  });

  it('should return false for errors object with entries', () => {
    expect(isFormValid({ email: 'Email is required' })).toBe(false);
    expect(isFormValid({ email: 'Invalid', password: 'Required' })).toBe(false);
  });
});
