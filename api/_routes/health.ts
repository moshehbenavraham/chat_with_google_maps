import { Hono } from 'hono';
import { getClient } from '../_db/index.js';
import type { HealthResponse, ServiceStatus } from '../_lib/types.js';

// Version is hardcoded for serverless compatibility
// Update this when package.json version changes
const VERSION = '0.0.7';

/**
 * Timeout duration for database ping (3 seconds)
 */
const DB_PING_TIMEOUT_MS = 3000;

/**
 * Ping the database with SELECT 1 to verify connectivity.
 * Returns 'connected' on success, 'disconnected' on any failure.
 */
async function pingDatabase(): Promise<ServiceStatus> {
  try {
    const client = getClient();

    // Race the query against a timeout
    const result = await Promise.race([
      client`SELECT 1`,
      new Promise<null>(resolve => {
        setTimeout(() => {
          resolve(null);
        }, DB_PING_TIMEOUT_MS);
      }),
    ]);

    // If timeout won, result is null
    return result !== null ? 'connected' : 'disconnected';
  } catch {
    return 'disconnected';
  }
}

const health = new Hono();

health.get('/', async c => {
  const databaseStatus = await pingDatabase();
  const isHealthy = databaseStatus === 'connected';

  const response: HealthResponse = {
    status: isHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    version: VERSION,
    services: {
      database: databaseStatus,
    },
  };

  return c.json(response);
});

export { health };
