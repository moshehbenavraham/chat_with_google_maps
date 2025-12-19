/**
 * Database Connection Tests
 *
 * Tests for DATABASE_URL validation and connection pooling configuration.
 * Uses mocks to avoid requiring Docker in CI.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POOL_CONFIG } from '../client.js';

// Mock postgres to avoid actual database connections
vi.mock('postgres', () => ({
  default: vi.fn(() => ({
    end: vi.fn(),
  })),
}));

describe('Database Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
    // Clear module cache to reset singleton state
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe('DATABASE_URL validation', () => {
    it('should throw MissingApiKeyError when DATABASE_URL is missing', async () => {
      // Ensure DATABASE_URL is not set
      delete process.env.DATABASE_URL;
      // Set other required env vars
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.GOOGLE_MAPS_API_KEY = 'test-maps-key';

      // Import getDatabaseUrl fresh
      const { getDatabaseUrl } = await import('../../_lib/env.js');

      expect(() => getDatabaseUrl()).toThrow('API key not configured: DATABASE_URL');
    });

    it('should return DATABASE_URL when it is set', async () => {
      const testUrl = 'postgresql://user:pass@localhost:5432/testdb';
      process.env.DATABASE_URL = testUrl;
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.GOOGLE_MAPS_API_KEY = 'test-maps-key';

      const { getDatabaseUrl } = await import('../../_lib/env.js');

      expect(getDatabaseUrl()).toBe(testUrl);
    });

    it('should include DATABASE_URL in validateEnv missing list when not set', async () => {
      delete process.env.DATABASE_URL;
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.GOOGLE_MAPS_API_KEY = 'test-maps-key';

      const { validateEnv } = await import('../../_lib/env.js');
      const result = validateEnv();

      expect(result.valid).toBe(false);
      expect(result.missing).toContain('DATABASE_URL');
    });

    it('should validate successfully when all required vars are set', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.GOOGLE_MAPS_API_KEY = 'test-maps-key';
      process.env.BETTER_AUTH_SECRET = 'test-secret-key-minimum-32-characters!';
      process.env.BETTER_AUTH_URL = 'http://localhost:5173';

      const { validateEnv } = await import('../../_lib/env.js');
      const result = validateEnv();

      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });
  });

  describe('Connection pool configuration', () => {
    it('should have max connections set to 10', () => {
      expect(POOL_CONFIG.max).toBe(10);
    });

    it('should have idle timeout set to 20 seconds', () => {
      expect(POOL_CONFIG.idle_timeout).toBe(20);
    });
  });

  describe('loadEnv with DATABASE_URL', () => {
    it('should include databaseUrl in ServerEnv when loadEnv succeeds', async () => {
      const testUrl = 'postgresql://user:pass@localhost:5432/testdb';
      process.env.DATABASE_URL = testUrl;
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.GOOGLE_MAPS_API_KEY = 'test-maps-key';
      process.env.BETTER_AUTH_SECRET = 'test-secret-key-minimum-32-characters!';
      process.env.BETTER_AUTH_URL = 'http://localhost:5173';

      const { loadEnv, clearEnvCache } = await import('../../_lib/env.js');
      clearEnvCache();

      const env = loadEnv();

      expect(env.databaseUrl).toBe(testUrl);
    });

    it('should throw when DATABASE_URL is missing in loadEnv', async () => {
      delete process.env.DATABASE_URL;
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.GOOGLE_MAPS_API_KEY = 'test-maps-key';

      const { loadEnv, clearEnvCache } = await import('../../_lib/env.js');
      clearEnvCache();

      expect(() => loadEnv()).toThrow('API key not configured: DATABASE_URL');
    });
  });
});
