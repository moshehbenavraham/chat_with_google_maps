import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { health } from './routes/health.js';

// Create the main Hono application
const app = new Hono();

// Mount routes
app.route('/api/health', health);

// 404 handler for unmatched routes
app.notFound(c => {
  return c.json({ error: 'Not Found', message: 'Route not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json(
    {
      error: 'Internal Server Error',
      message: err.message,
    },
    500
  );
});

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
