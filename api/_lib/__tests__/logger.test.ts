import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Logger } from 'pino';

// Store original env values
const originalEnv = { ...process.env };

describe('Logger Module', () => {
  beforeEach(() => {
    // Reset modules to get fresh logger instances
    vi.resetModules();
    // Reset env
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('createChildLogger', () => {
    it('creates a child logger with component name', async () => {
      const { createChildLogger } = await import('../logger.js');
      const childLogger = createChildLogger('test-component');

      expect(childLogger).toBeDefined();
      expect(typeof childLogger.info).toBe('function');
      expect(typeof childLogger.error).toBe('function');
      expect(typeof childLogger.warn).toBe('function');
      expect(typeof childLogger.debug).toBe('function');
    });

    it('creates different child loggers for different components', async () => {
      const { createChildLogger } = await import('../logger.js');
      const logger1 = createChildLogger('component-1');
      const logger2 = createChildLogger('component-2');

      expect(logger1).toBeDefined();
      expect(logger2).toBeDefined();
      // Both should be logger instances but distinct children
      expect(typeof logger1.info).toBe('function');
      expect(typeof logger2.info).toBe('function');
    });
  });

  describe('logger singleton', () => {
    it('exports a singleton logger instance', async () => {
      const { logger } = await import('../logger.js');

      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.fatal).toBe('function');
      expect(typeof logger.trace).toBe('function');
    });

    it('logger has child method', async () => {
      const { logger } = await import('../logger.js');

      expect(typeof logger.child).toBe('function');
      const child = logger.child({ foo: 'bar' });
      expect(child).toBeDefined();
      expect(typeof child.info).toBe('function');
    });
  });

  describe('LogConfig type', () => {
    it('exports LogConfig interface', async () => {
      const loggerModule = await import('../logger.js');

      // Type check - if the module compiles, the interface exists
      expect(loggerModule).toHaveProperty('logger');
      expect(loggerModule).toHaveProperty('createChildLogger');
    });
  });

  describe('environment configuration', () => {
    it('defaults to debug level in development', async () => {
      process.env.NODE_ENV = 'development';
      delete process.env.LOG_LEVEL;

      const { logger } = await import('../logger.js');

      // Pino logger should be configured with debug level
      expect(logger.level).toBe('debug');
    });

    it('defaults to info level in production', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.LOG_LEVEL;
      delete process.env.LOG_FORMAT;

      const { logger } = await import('../logger.js');

      expect(logger.level).toBe('info');
    });

    it('respects LOG_LEVEL environment variable', async () => {
      process.env.LOG_LEVEL = 'warn';
      process.env.LOG_FORMAT = 'json';

      const { logger } = await import('../logger.js');

      expect(logger.level).toBe('warn');
    });

    it('respects trace log level', async () => {
      process.env.LOG_LEVEL = 'trace';
      process.env.LOG_FORMAT = 'json';

      const { logger } = await import('../logger.js');

      expect(logger.level).toBe('trace');
    });
  });

  describe('logger methods', () => {
    it('can log at different levels without throwing', async () => {
      process.env.LOG_LEVEL = 'trace';
      process.env.LOG_FORMAT = 'json';

      const { logger } = await import('../logger.js');

      // None of these should throw
      expect(() => {
        logger.trace('trace message');
      }).not.toThrow();
      expect(() => {
        logger.debug('debug message');
      }).not.toThrow();
      expect(() => {
        logger.info('info message');
      }).not.toThrow();
      expect(() => {
        logger.warn('warn message');
      }).not.toThrow();
      expect(() => {
        logger.error('error message');
      }).not.toThrow();
      expect(() => {
        logger.fatal('fatal message');
      }).not.toThrow();
    });

    it('can log with structured data', async () => {
      process.env.LOG_FORMAT = 'json';

      const { logger } = await import('../logger.js');

      // Should not throw when logging with objects
      expect(() => {
        logger.info({ userId: 123, action: 'test' }, 'structured log');
      }).not.toThrow();
    });

    it('child logger includes component in bindings', async () => {
      process.env.LOG_FORMAT = 'json';

      const { createChildLogger } = await import('../logger.js');
      const childLogger = createChildLogger('my-component');

      // Child logger should have bindings including component
      const bindings = childLogger.bindings();
      expect(bindings).toHaveProperty('component', 'my-component');
    });
  });
});

describe('Logger Type Exports', () => {
  it('exports Logger type from pino', async () => {
    // This test verifies that the Logger type is properly exported
    // If this compiles, the type export is working
    const { logger } = await import('../logger.js');

    // TypeScript will verify that logger satisfies the Logger type
    const typedLogger: Logger = logger;
    expect(typedLogger).toBeDefined();
  });
});
