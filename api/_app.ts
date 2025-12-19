import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { health } from './_routes/health.js';
import { gemini } from './_routes/gemini.js';
import { maps } from './_routes/maps.js';
import { dbTest } from './_routes/db-test.js';
import { errorHandler } from './_middleware/error-handler.js';
import { auth } from './_lib/auth.js';

// Create the main Hono application (platform-agnostic)
const app = new Hono();

// Configure CORS for auth routes
// Better Auth requires credentials (cookies) to be sent
app.use(
  '/api/auth/*',
  cors({
    origin: process.env.BETTER_AUTH_URL ?? 'http://localhost:5173',
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Set-Cookie'],
  })
);

// Mount Better Auth handler at /api/auth/*
app.on(['GET', 'POST'], '/api/auth/**', c => {
  return auth.handler(c.req.raw);
});

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
