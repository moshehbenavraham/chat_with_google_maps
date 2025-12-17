import { Hono } from 'hono';
import type { HealthResponse } from '../_lib/types.js';

// Version is hardcoded for serverless compatibility
// Update this when package.json version changes
const VERSION = '0.0.7';

const health = new Hono();

health.get('/', c => {
  const response: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: VERSION,
  };
  return c.json(response);
});

export { health };
