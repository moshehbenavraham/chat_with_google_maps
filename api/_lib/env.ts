/**
 * Environment Variable Loading and Validation
 *
 * Centralized module for server-side environment configuration.
 * Validates required variables and provides typed access.
 */

import { MissingApiKeyError } from './errors.js';

/**
 * Server-side environment configuration
 */
export interface ServerEnv {
  /** Gemini API key for REST API calls */
  geminiApiKey: string;
  /** Google Maps API key for grounding configuration */
  googleMapsApiKey: string;
  /** API server port */
  apiPort: number;
  /** PostgreSQL database connection URL */
  databaseUrl: string;
  /** Better Auth secret key for signing cookies/tokens */
  betterAuthSecret: string;
  /** Better Auth base URL for callbacks and redirects */
  betterAuthUrl: string;
}

/**
 * Cached environment values (loaded once at startup)
 */
let cachedEnv: ServerEnv | null = null;

/**
 * Load and validate server-side environment variables.
 * Throws MissingApiKeyError if required variables are not set.
 *
 * @returns Validated environment configuration
 * @throws MissingApiKeyError if required variables are missing
 */
export function loadEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
  const databaseUrl = process.env.DATABASE_URL;
  const betterAuthSecret = process.env.BETTER_AUTH_SECRET;
  const betterAuthUrl = process.env.BETTER_AUTH_URL;
  const apiPort = Number(process.env.API_PORT) || 3011;

  // Validate required keys
  if (!geminiApiKey) {
    throw new MissingApiKeyError('GEMINI_API_KEY');
  }

  if (!googleMapsApiKey) {
    throw new MissingApiKeyError('GOOGLE_MAPS_API_KEY');
  }

  if (!databaseUrl) {
    throw new MissingApiKeyError('DATABASE_URL');
  }

  if (!betterAuthSecret) {
    throw new MissingApiKeyError('BETTER_AUTH_SECRET');
  }

  if (betterAuthSecret.length < 32) {
    throw new Error('BETTER_AUTH_SECRET must be at least 32 characters long');
  }

  if (!betterAuthUrl) {
    throw new MissingApiKeyError('BETTER_AUTH_URL');
  }

  cachedEnv = {
    geminiApiKey,
    googleMapsApiKey,
    apiPort,
    databaseUrl,
    betterAuthSecret,
    betterAuthUrl,
  };

  return cachedEnv;
}

/**
 * Get the Gemini API key.
 * Validates that the key is configured.
 *
 * @returns Gemini API key
 * @throws MissingApiKeyError if not configured
 */
export function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new MissingApiKeyError('GEMINI_API_KEY');
  }
  return key;
}

/**
 * Get the Google Maps API key.
 * Validates that the key is configured.
 *
 * @returns Google Maps API key
 * @throws MissingApiKeyError if not configured
 */
export function getGoogleMapsApiKey(): string {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new MissingApiKeyError('GOOGLE_MAPS_API_KEY');
  }
  return key;
}

/**
 * Get the database connection URL.
 * Validates that the URL is configured.
 *
 * @returns PostgreSQL connection URL
 * @throws MissingApiKeyError if not configured
 */
export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new MissingApiKeyError('DATABASE_URL');
  }
  return url;
}

/**
 * Get the Better Auth secret key.
 * Validates that the key is configured and meets minimum length.
 *
 * @returns Better Auth secret key
 * @throws MissingApiKeyError if not configured
 * @throws Error if key is too short
 */
export function getBetterAuthSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new MissingApiKeyError('BETTER_AUTH_SECRET');
  }
  if (secret.length < 32) {
    throw new Error('BETTER_AUTH_SECRET must be at least 32 characters long');
  }
  return secret;
}

/**
 * Get the Better Auth base URL.
 * Validates that the URL is configured.
 *
 * @returns Better Auth base URL
 * @throws MissingApiKeyError if not configured
 */
export function getBetterAuthUrl(): string {
  const url = process.env.BETTER_AUTH_URL;
  if (!url) {
    throw new MissingApiKeyError('BETTER_AUTH_URL');
  }
  return url;
}

/**
 * Check if environment is properly configured (without throwing).
 * Useful for health checks.
 *
 * @returns Object with validation status for each key
 */
export function validateEnv(): {
  valid: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  if (!process.env.GEMINI_API_KEY) {
    missing.push('GEMINI_API_KEY');
  }

  if (!process.env.GOOGLE_MAPS_API_KEY) {
    missing.push('GOOGLE_MAPS_API_KEY');
  }

  if (!process.env.DATABASE_URL) {
    missing.push('DATABASE_URL');
  }

  if (!process.env.BETTER_AUTH_SECRET) {
    missing.push('BETTER_AUTH_SECRET');
  }

  if (!process.env.BETTER_AUTH_URL) {
    missing.push('BETTER_AUTH_URL');
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Clear cached environment (useful for testing).
 */
export function clearEnvCache(): void {
  cachedEnv = null;
}
