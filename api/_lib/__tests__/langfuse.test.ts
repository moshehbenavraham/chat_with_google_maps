import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Store original env values
const originalEnv = { ...process.env };

describe('Langfuse Module', () => {
  beforeEach(() => {
    // Reset modules to get fresh langfuse instances
    vi.resetModules();
    // Reset env
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('getLangfuse', () => {
    it('returns null when API keys are not configured', async () => {
      delete process.env.LANGFUSE_SECRET_KEY;
      delete process.env.LANGFUSE_PUBLIC_KEY;

      const { getLangfuse } = await import('../langfuse.js');
      const client = getLangfuse();

      expect(client).toBeNull();
    });

    it('returns null when only secret key is configured', async () => {
      process.env.LANGFUSE_SECRET_KEY = 'sk-lf-test';
      delete process.env.LANGFUSE_PUBLIC_KEY;

      const { getLangfuse } = await import('../langfuse.js');
      const client = getLangfuse();

      expect(client).toBeNull();
    });

    it('returns null when only public key is configured', async () => {
      delete process.env.LANGFUSE_SECRET_KEY;
      process.env.LANGFUSE_PUBLIC_KEY = 'pk-lf-test';

      const { getLangfuse } = await import('../langfuse.js');
      const client = getLangfuse();

      expect(client).toBeNull();
    });

    it('returns Langfuse client when both keys are configured', async () => {
      process.env.LANGFUSE_SECRET_KEY = 'sk-lf-test-secret';
      process.env.LANGFUSE_PUBLIC_KEY = 'pk-lf-test-public';
      process.env.LANGFUSE_BASE_URL = 'http://localhost:3016';

      const { getLangfuse } = await import('../langfuse.js');
      const client = getLangfuse();

      expect(client).not.toBeNull();
      expect(client).toBeDefined();
    });

    it('returns singleton instance on multiple calls', async () => {
      process.env.LANGFUSE_SECRET_KEY = 'sk-lf-test-secret';
      process.env.LANGFUSE_PUBLIC_KEY = 'pk-lf-test-public';
      process.env.LANGFUSE_BASE_URL = 'http://localhost:3016';

      const { getLangfuse } = await import('../langfuse.js');
      const client1 = getLangfuse();
      const client2 = getLangfuse();

      expect(client1).toBe(client2);
    });

    it('uses default base URL when not configured', async () => {
      process.env.LANGFUSE_SECRET_KEY = 'sk-lf-test-secret';
      process.env.LANGFUSE_PUBLIC_KEY = 'pk-lf-test-public';
      delete process.env.LANGFUSE_BASE_URL;

      const { getLangfuse } = await import('../langfuse.js');
      const client = getLangfuse();

      // Client should be created successfully with default URL
      expect(client).not.toBeNull();
    });
  });

  describe('flushTraces', () => {
    it('completes without error when Langfuse is not configured', async () => {
      delete process.env.LANGFUSE_SECRET_KEY;
      delete process.env.LANGFUSE_PUBLIC_KEY;

      const { flushTraces } = await import('../langfuse.js');

      // Should not throw
      await expect(flushTraces()).resolves.toBeUndefined();
    });

    it('completes without error when Langfuse is configured', async () => {
      process.env.LANGFUSE_SECRET_KEY = 'sk-lf-test-secret';
      process.env.LANGFUSE_PUBLIC_KEY = 'pk-lf-test-public';
      process.env.LANGFUSE_BASE_URL = 'http://localhost:3016';

      const { getLangfuse, flushTraces } = await import('../langfuse.js');

      // Initialize client first
      getLangfuse();

      // Should not throw
      await expect(flushTraces()).resolves.toBeUndefined();
    });
  });

  describe('shutdownLangfuse', () => {
    it('completes without error when Langfuse is not configured', async () => {
      delete process.env.LANGFUSE_SECRET_KEY;
      delete process.env.LANGFUSE_PUBLIC_KEY;

      const { shutdownLangfuse } = await import('../langfuse.js');

      // Should not throw
      await expect(shutdownLangfuse()).resolves.toBeUndefined();
    });

    it('completes without error when Langfuse is configured', async () => {
      process.env.LANGFUSE_SECRET_KEY = 'sk-lf-test-secret';
      process.env.LANGFUSE_PUBLIC_KEY = 'pk-lf-test-public';
      process.env.LANGFUSE_BASE_URL = 'http://localhost:3016';

      const { getLangfuse, shutdownLangfuse } = await import('../langfuse.js');

      // Initialize client first
      getLangfuse();

      // Should not throw
      await expect(shutdownLangfuse()).resolves.toBeUndefined();
    });

    it('is idempotent - multiple calls are safe', async () => {
      process.env.LANGFUSE_SECRET_KEY = 'sk-lf-test-secret';
      process.env.LANGFUSE_PUBLIC_KEY = 'pk-lf-test-public';
      process.env.LANGFUSE_BASE_URL = 'http://localhost:3016';

      const { getLangfuse, shutdownLangfuse } = await import('../langfuse.js');

      // Initialize client first
      getLangfuse();

      // Multiple shutdown calls should not throw
      await expect(shutdownLangfuse()).resolves.toBeUndefined();
      await expect(shutdownLangfuse()).resolves.toBeUndefined();
    });
  });

  describe('module exports', () => {
    it('exports getLangfuse function', async () => {
      const langfuseModule = await import('../langfuse.js');

      expect(langfuseModule).toHaveProperty('getLangfuse');
      expect(typeof langfuseModule.getLangfuse).toBe('function');
    });

    it('exports flushTraces function', async () => {
      const langfuseModule = await import('../langfuse.js');

      expect(langfuseModule).toHaveProperty('flushTraces');
      expect(typeof langfuseModule.flushTraces).toBe('function');
    });

    it('exports shutdownLangfuse function', async () => {
      const langfuseModule = await import('../langfuse.js');

      expect(langfuseModule).toHaveProperty('shutdownLangfuse');
      expect(typeof langfuseModule.shutdownLangfuse).toBe('function');
    });
  });

  describe('shutdown handler registration', () => {
    it('module can be imported without throwing', async () => {
      // Simply importing the module should not throw
      // This verifies shutdown handler registration works
      await expect(import('../langfuse.js')).resolves.toBeDefined();
    });
  });
});
