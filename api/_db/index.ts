/**
 * Database Module Entry Point
 *
 * Exports the Drizzle ORM instance configured for PostgreSQL.
 * Import from '../_db' to access database operations.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { getClient, closeClient, POOL_CONFIG } from './client.js';
import * as schema from './schema/index.js';

/**
 * Cached Drizzle instance (singleton)
 */
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Get or create the Drizzle ORM instance.
 * Uses lazy initialization - instance created on first call.
 *
 * @returns Configured Drizzle instance with schema
 */
export function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!db) {
    const client = getClient();
    db = drizzle(client, { schema });
  }
  return db;
}

/**
 * Close database connections.
 * Call during graceful shutdown or in tests.
 */
export async function closeDb(): Promise<void> {
  db = null;
  await closeClient();
}

// Re-export client utilities for direct SQL access if needed
export { getClient, closeClient, POOL_CONFIG };

// Re-export schema for type access
export * from './schema/index.js';
