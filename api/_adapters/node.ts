// Node.js adapter for local development and Docker deployment
import { serve, type ServerType } from '@hono/node-server';
import { app } from '../_app.js';
import { createChildLogger } from '../_lib/logger.js';

const log = createChildLogger('server');
const port = Number(process.env.API_PORT) || 3011;

export function startServer(): ServerType {
  return serve(
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
}

// Auto-start when run directly
startServer();
