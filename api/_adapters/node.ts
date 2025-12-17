// Node.js adapter for local development and Docker deployment
import { serve, type ServerType } from '@hono/node-server';
import { app } from '../_app.js';

const port = Number(process.env.API_PORT) || 3001;

export function startServer(): ServerType {
  return serve(
    {
      fetch: app.fetch,
      port,
    },
    info => {
      console.log(`API server running on http://localhost:${String(info.port)}`);
    }
  );
}

// Auto-start when run directly
startServer();
