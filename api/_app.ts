import { Hono } from 'hono';
import { health } from './_routes/health.js';
import { gemini } from './_routes/gemini.js';
import { maps } from './_routes/maps.js';
import { dbTest } from './_routes/db-test.js';
import { errorHandler } from './_middleware/error-handler.js';

// Create the main Hono application (platform-agnostic)
const app = new Hono();

// Mount routes
app.route('/api/health', health);
app.route('/api/gemini', gemini);
app.route('/api/maps', maps);
app.route('/api/db/test', dbTest);

// 404 handler for unmatched routes
app.notFound(c => {
  return c.json({ error: 'Not Found', message: 'Route not found' }, 404);
});

// Centralized error handler
app.onError(errorHandler);

export { app };
