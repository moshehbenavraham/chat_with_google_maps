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
  const apiPort = Number(process.env.API_PORT) || 3011;

  // Validate required keys
  if (!geminiApiKey) {
    throw new MissingApiKeyError('GEMINI_API_KEY');
  }

  if (!googleMapsApiKey) {
    throw new MissingApiKeyError('GOOGLE_MAPS_API_KEY');
  }

  cachedEnv = {
    geminiApiKey,
    googleMapsApiKey,
    apiPort,
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
