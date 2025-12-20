// Development entry point - imports app and serves locally
import { serve } from '@hono/node-server';
// Note: _app.ts handles all route imports from underscore-prefixed directories
import { app } from './_app.js';
import { createChildLogger } from './_lib/logger.js';

const log = createChildLogger('server');

// Re-export app for testing
export { app };

// Start the server for local development
const port = Number(process.env.API_PORT) || 3011;

serve(
  {
    fetch: app.fetch,
    port,
  },
  info => {
    log.info(
      { port: info.port, url: `http://localhost:${String(info.port)}` },
      'API server started'
    );
  }
);
