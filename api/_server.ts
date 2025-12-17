// Development entry point - imports app and serves locally
import { serve } from '@hono/node-server';
// Note: _app.ts handles all route imports from underscore-prefixed directories
import { app } from './_app.js';

// Re-export app for testing
export { app };

// Start the server for local development
const port = Number(process.env.API_PORT) || 3001;

serve(
  {
    fetch: app.fetch,
    port,
  },
  info => {
    console.log(`API server running on http://localhost:${String(info.port)}`);
  }
);
