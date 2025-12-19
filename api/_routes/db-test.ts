import { Hono } from 'hono';
import { getClient } from '../_db/index.js';
import type { DbTestResponse, DbTestErrorResponse } from '../_lib/types.js';

/**
 * Timeout duration for database queries (3 seconds)
 */
const DB_QUERY_TIMEOUT_MS = 3000;

/**
 * Execute a query with timeout
 */
async function queryWithTimeout<T>(queryFn: () => Promise<T>, timeoutMs: number): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const result = await Promise.race([
      queryFn(),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error('Database query timeout'));
        });
      }),
    ]);
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Check if a table exists in the database
 */
async function tableExists(
  client: ReturnType<typeof getClient>,
  tableName: string
): Promise<boolean> {
  const result = await client`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
    ) as exists
  `;
  return result[0]?.exists === true;
}

const dbTest = new Hono();

dbTest.get('/', async c => {
  try {
    const client = getClient();

    // Test connectivity with SELECT 1
    await queryWithTimeout(async () => {
      await client`SELECT 1`;
    }, DB_QUERY_TIMEOUT_MS);

    // Check table existence
    const [usersExists, sessionsExists] = await queryWithTimeout(
      async () => Promise.all([tableExists(client, 'users'), tableExists(client, 'sessions')]),
      DB_QUERY_TIMEOUT_MS
    );

    const response: DbTestResponse = {
      status: 'connected',
      timestamp: new Date().toISOString(),
      tables: {
        users: usersExists,
        sessions: sessionsExists,
      },
    };

    return c.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';

    const response: DbTestErrorResponse = {
      status: 'error',
      message,
    };

    return c.json(response, 500);
  }
});

export { dbTest };
