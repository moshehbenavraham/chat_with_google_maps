import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { health } from './_routes/health.js';
import { gemini } from './_routes/gemini.js';
import { maps } from './_routes/maps.js';
import { dbTest } from './_routes/db-test.js';
import { live } from './_routes/live.js';
import { traceTest } from './_routes/trace-test.js';
import { errorHandler } from './_middleware/error-handler.js';
import { requestLogger } from './_middleware/request-logger.js';
import { langfuseTrace } from './_middleware/langfuse-trace.js';
import { requireAuth } from './_middleware/auth-guard.js';
import { auth } from './_lib/auth.js';

// Create the main Hono application (platform-agnostic)
const app = new Hono();

// Configure CORS for auth routes
// Better Auth requires credentials (cookies) to be sent
// In development, allow any localhost origin (Vite may pick different ports)
const isDev = process.env.NODE_ENV !== 'production';
app.use(
  '/api/auth/*',
  cors({
    origin: (origin: string) => {
      // Allow requests with no origin (same-origin, Postman, curl)
      if (!origin) return process.env.BETTER_AUTH_URL ?? 'http://localhost:3003';
      // In development, allow any localhost origin
      if (isDev && /^http:\/\/localhost:\d+$/.exec(origin)) {
        return origin;
      }
      // In production, only allow configured origin
      return process.env.BETTER_AUTH_URL ?? 'http://localhost:3003';
    },
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

// Add request logging middleware (after CORS, before routes)
app.use('*', requestLogger);

// Add Langfuse tracing middleware (after logging, before routes)
// Creates traces for all requests, making them available via c.get('trace')
app.use('*', langfuseTrace);

// Apply auth middleware to protected routes (before mounting)
app.use('/api/gemini/*', requireAuth);
app.use('/api/maps/*', requireAuth);
app.use('/api/live/*', requireAuth);

// Mount routes
// Public routes
app.route('/api/health', health);
// Protected routes (auth middleware applied above)
app.route('/api/gemini', gemini);
app.route('/api/maps', maps);
app.route('/api/live', live);
// Development route - consider protecting or removing in production
app.route('/api/db/test', dbTest);
// Langfuse trace verification endpoint
app.route('/api/trace-test', traceTest);

// 404 handler for unmatched routes
app.notFound(c => {
  return c.json({ error: 'Not Found', message: 'Route not found' }, 404);
});

// Centralized error handler
app.onError(errorHandler);

export { app };
