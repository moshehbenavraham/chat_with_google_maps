/**
 * PostgreSQL Client Configuration
 *
 * Configures postgres.js client with connection pooling.
 * Uses lazy initialization - connection established on first use.
 */

import postgres from 'postgres';
import { getDatabaseUrl } from '../_lib/env.js';

/**
 * Connection pool configuration
 * - max: Maximum connections in pool (10)
 * - idle_timeout: Close idle connections after 20 seconds
 */
const POOL_CONFIG = {
  max: 10,
  idle_timeout: 20,
} as const;

/**
 * Cached postgres client instance (singleton)
 */
let client: postgres.Sql | null = null;

/**
 * Get or create the PostgreSQL client.
 * Uses lazy initialization - connection pool created on first call.
 *
 * @returns Configured postgres.js client with connection pooling
 */
export function getClient(): postgres.Sql {
  if (!client) {
    const databaseUrl = getDatabaseUrl();
    client = postgres(databaseUrl, {
      max: POOL_CONFIG.max,
      idle_timeout: POOL_CONFIG.idle_timeout,
    });
  }
  return client;
}

/**
 * Close the database connection pool.
 * Call during graceful shutdown or in tests.
 */
export async function closeClient(): Promise<void> {
  if (client) {
    await client.end();
    client = null;
  }
}

/**
 * Export pool configuration for testing
 */
export { POOL_CONFIG };
