/**
 * Centralized Pino Logger Configuration
 *
 * Features:
 * - JSON structured logging (production)
 * - Pretty printing (development)
 * - Optional file output with rotation
 * - Child loggers for component isolation
 */

import * as pino from 'pino';
import { createStream, type Options as RfsOptions } from 'rotating-file-stream';
import * as path from 'node:path';
import * as fs from 'node:fs';

export interface LogConfig {
  level: string;
  toFile: boolean;
  dir: string;
  format: 'json' | 'pretty';
  maxSize: string;
  maxFiles: number;
  rotationInterval: 'daily' | 'hourly' | 'none';
}

function getLogConfig(): LogConfig {
  const isDev = process.env.NODE_ENV !== 'production';
  const defaultLogLevel = isDev ? 'debug' : 'info';
  const defaultLogFormat: 'json' | 'pretty' = isDev ? 'pretty' : 'json';

  const logFormat = process.env.LOG_FORMAT;
  const logRotation = process.env.LOG_ROTATION_INTERVAL;

  return {
    level: process.env.LOG_LEVEL ?? defaultLogLevel,
    toFile: process.env.LOG_TO_FILE === 'true',
    dir: process.env.LOG_DIR ?? './logs',
    format: logFormat === 'json' || logFormat === 'pretty' ? logFormat : defaultLogFormat,
    maxSize: process.env.LOG_MAX_SIZE ?? '10M',
    maxFiles: parseInt(process.env.LOG_MAX_FILES ?? '14', 10),
    rotationInterval:
      logRotation === 'daily' || logRotation === 'hourly' || logRotation === 'none'
        ? logRotation
        : 'daily',
  };
}

function createFileStream(config: LogConfig) {
  // Ensure log directory exists
  const logDir = path.resolve(config.dir);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Filename generator: app-YYYY-MM-DD.log or app-YYYY-MM-DD-HH.log
  const generator = (time: Date | number, index?: number): string => {
    if (!time) return 'app.log';

    const date = time instanceof Date ? time : new Date(time);
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');

    let filename = `app-${year}-${month}-${day}`;
    if (config.rotationInterval === 'hourly') {
      filename += `-${hour}`;
    }
    if (index !== undefined && index > 1) {
      filename += `-${String(index)}`;
    }
    return `${filename}.log`;
  };

  // Configure rotation options
  const intervalMap: Record<string, string | undefined> = {
    daily: '1d',
    hourly: '1h',
    none: undefined,
  };

  const rfsOptions: RfsOptions = {
    size: config.maxSize as `${number}M` | `${number}K` | `${number}G` | `${number}B`,
    path: logDir,
    compress: 'gzip',
    maxFiles: config.maxFiles,
  };

  const interval = intervalMap[config.rotationInterval];
  if (interval) {
    rfsOptions.interval = interval as `${number}d` | `${number}h` | `${number}m` | `${number}s`;
  }

  return createStream(generator, rfsOptions);
}

function createLogger(): pino.Logger {
  const config = getLogConfig();

  const options: pino.LoggerOptions = {
    level: config.level,
    base: {
      pid: process.pid,
      env: process.env.NODE_ENV ?? 'development',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: label => ({ level: label }),
    },
  };

  // Development: pretty printing to stdout
  if (config.format === 'pretty' && !config.toFile) {
    return pino.pino({
      ...options,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    });
  }

  // File logging enabled
  if (config.toFile) {
    const streams = [
      // Always log to stdout
      { stream: process.stdout },
      // Also log to rotating file
      { stream: createFileStream(config) },
    ];

    return pino.pino(options, pino.multistream(streams));
  }

  // Default: JSON to stdout
  return pino.pino(options);
}

// Singleton logger instance
export const logger = createLogger();

// Child logger factory for component isolation
export function createChildLogger(component: string): pino.Logger {
  return logger.child({ component });
}

// Re-export Logger type
export type { Logger } from 'pino';

/**
 * Create a child logger with Langfuse trace ID for correlation.
 *
 * Use this in route handlers to include the trace ID in all log entries,
 * enabling easy correlation between application logs and Langfuse traces.
 *
 * @param component - The component name for the logger
 * @param traceId - The Langfuse trace ID (from c.get('traceId'))
 * @returns A child logger with the trace ID included
 *
 * @example
 * ```typescript
 * const traceId = c.get('traceId');
 * const log = createTracedLogger('gemini', traceId);
 * log.info('Processing request'); // Includes traceId in log entry
 * ```
 */
export function createTracedLogger(component: string, traceId: string | null): pino.Logger {
  const child = logger.child({ component });
  if (traceId) {
    return child.child({ traceId });
  }
  return child;
}
