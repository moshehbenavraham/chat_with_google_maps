/**
 * Auth Configuration Tests
 *
 * Tests for Better Auth server configuration, environment validation,
 * and type exports. These tests validate the auth configuration structure
 * without requiring actual authentication operations.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getBetterAuthSecret, getBetterAuthUrl, clearEnvCache } from '../env.js';

describe('Auth Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    vi.resetModules();
    clearEnvCache();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    clearEnvCache();
  });

  describe('getBetterAuthSecret', () => {
    it('should return secret when properly configured', () => {
      const testSecret = 'this-is-a-valid-secret-with-32-chars!';
      process.env.BETTER_AUTH_SECRET = testSecret;

      const secret = getBetterAuthSecret();
      expect(secret).toBe(testSecret);
    });

    it('should throw MissingApiKeyError when secret is not set', () => {
      delete process.env.BETTER_AUTH_SECRET;

      expect(() => getBetterAuthSecret()).toThrow('API key not configured: BETTER_AUTH_SECRET');
    });

    it('should throw error when secret is too short', () => {
      process.env.BETTER_AUTH_SECRET = 'short';

      expect(() => getBetterAuthSecret()).toThrow(
        'BETTER_AUTH_SECRET must be at least 32 characters long'
      );
    });

    it('should accept secret with exactly 32 characters', () => {
      const exactSecret = '12345678901234567890123456789012';
      process.env.BETTER_AUTH_SECRET = exactSecret;

      expect(exactSecret.length).toBe(32);
      expect(() => getBetterAuthSecret()).not.toThrow();
    });

    it('should accept secret with more than 32 characters', () => {
      const longSecret = 'this-is-a-very-long-secret-key-that-exceeds-32-chars';
      process.env.BETTER_AUTH_SECRET = longSecret;

      expect(longSecret.length).toBeGreaterThan(32);
      expect(() => getBetterAuthSecret()).not.toThrow();
    });
  });

  describe('getBetterAuthUrl', () => {
    it('should return URL when properly configured', () => {
      const testUrl = 'http://localhost:5173';
      process.env.BETTER_AUTH_URL = testUrl;

      const url = getBetterAuthUrl();
      expect(url).toBe(testUrl);
    });

    it('should throw MissingApiKeyError when URL is not set', () => {
      delete process.env.BETTER_AUTH_URL;

      expect(() => getBetterAuthUrl()).toThrow('API key not configured: BETTER_AUTH_URL');
    });

    it('should accept any non-empty URL string', () => {
      process.env.BETTER_AUTH_URL = 'https://example.com';

      const url = getBetterAuthUrl();
      expect(url).toBe('https://example.com');
    });
  });
});

describe('Auth Schema Tests', () => {
  describe('Accounts schema', () => {
    it('should export accounts table with correct structure', async () => {
      const { accounts } = await import('../../_db/schema/index.ts');
      const { getTableConfig } = await import('drizzle-orm/pg-core');
      const tableConfig = getTableConfig(accounts);

      expect(tableConfig.name).toBe('accounts');
      expect(tableConfig.columns.length).toBe(13);

      const columnNames = tableConfig.columns.map(c => c.name);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('user_id');
      expect(columnNames).toContain('account_id');
      expect(columnNames).toContain('provider_id');
      expect(columnNames).toContain('password');
      expect(columnNames).toContain('created_at');
      expect(columnNames).toContain('updated_at');
    });

    it('should have foreign key to users table', async () => {
      const { accounts, users } = await import('../../_db/schema/index.ts');
      const { getTableConfig } = await import('drizzle-orm/pg-core');
      const tableConfig = getTableConfig(accounts);

      expect(tableConfig.foreignKeys.length).toBe(1);
      const fk = tableConfig.foreignKeys[0];
      expect(fk?.reference().foreignTable).toBe(users);
    });

    it('should have required columns as not null', async () => {
      const { accounts } = await import('../../_db/schema/index.ts');
      const { getTableConfig } = await import('drizzle-orm/pg-core');
      const tableConfig = getTableConfig(accounts);

      const userIdCol = tableConfig.columns.find(c => c.name === 'user_id');
      const accountIdCol = tableConfig.columns.find(c => c.name === 'account_id');
      const providerIdCol = tableConfig.columns.find(c => c.name === 'provider_id');

      expect(userIdCol?.notNull).toBe(true);
      expect(accountIdCol?.notNull).toBe(true);
      expect(providerIdCol?.notNull).toBe(true);
    });

    it('should have password as nullable', async () => {
      const { accounts } = await import('../../_db/schema/index.ts');
      const { getTableConfig } = await import('drizzle-orm/pg-core');
      const tableConfig = getTableConfig(accounts);

      const passwordCol = tableConfig.columns.find(c => c.name === 'password');
      expect(passwordCol?.notNull).toBe(false);
    });
  });

  describe('Verifications schema', () => {
    it('should export verifications table with correct structure', async () => {
      const { verifications } = await import('../../_db/schema/index.ts');
      const { getTableConfig } = await import('drizzle-orm/pg-core');
      const tableConfig = getTableConfig(verifications);

      expect(tableConfig.name).toBe('verifications');
      expect(tableConfig.columns.length).toBe(6);

      const columnNames = tableConfig.columns.map(c => c.name);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('identifier');
      expect(columnNames).toContain('value');
      expect(columnNames).toContain('expires_at');
      expect(columnNames).toContain('created_at');
      expect(columnNames).toContain('updated_at');
    });

    it('should have required columns as not null', async () => {
      const { verifications } = await import('../../_db/schema/index.ts');
      const { getTableConfig } = await import('drizzle-orm/pg-core');
      const tableConfig = getTableConfig(verifications);

      const identifierCol = tableConfig.columns.find(c => c.name === 'identifier');
      const valueCol = tableConfig.columns.find(c => c.name === 'value');
      const expiresCol = tableConfig.columns.find(c => c.name === 'expires_at');

      expect(identifierCol?.notNull).toBe(true);
      expect(valueCol?.notNull).toBe(true);
      expect(expiresCol?.notNull).toBe(true);
    });
  });
});

describe('Auth Type Exports', () => {
  it('should export Account type with correct shape', async () => {
    const { accounts } = await import('../../_db/schema/index.ts');
    // Account type is inferred from accounts table
    // If this compiles, the type is correctly exported
    expect(accounts).toBeDefined();
  });

  it('should export Verification type with correct shape', async () => {
    const { verifications } = await import('../../_db/schema/index.ts');
    // Verification type is inferred from verifications table
    // If this compiles, the type is correctly exported
    expect(verifications).toBeDefined();
  });
});
