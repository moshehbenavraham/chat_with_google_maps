import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { health } from './routes/health.js';
import { gemini } from './routes/gemini.js';
import { maps } from './routes/maps.js';
import { errorHandler } from './middleware/error-handler.js';

// Create the main Hono application
const app = new Hono();

// Mount routes
app.route('/api/health', health);
app.route('/api/gemini', gemini);
app.route('/api/maps', maps);

// 404 handler for unmatched routes
app.notFound(c => {
  return c.json({ error: 'Not Found', message: 'Route not found' }, 404);
});

// Centralized error handler
app.onError(errorHandler);

// Export app for testing
export { app };

// Start the server (only when run directly, not when imported for tests)
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
