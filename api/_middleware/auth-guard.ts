/**
 * Auth Guard Middleware
 *
 * Middleware that requires a valid session for protected routes.
 * Returns 401 if not authenticated, attaches user/session to context if valid.
 */

import type { Context, Next } from 'hono';
import { auth } from '../_lib/auth.js';
import { createChildLogger } from '../_lib/logger.js';

const log = createChildLogger('auth-guard');

/**
 * Middleware that requires a valid session.
 * Returns 401 if not authenticated.
 * Attaches user and session to context if authenticated.
 *
 * Usage:
 * ```typescript
 * app.use('/api/protected/*', requireAuth);
 * ```
 */
export async function requireAuth(c: Context, next: Next) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    log.warn({ path: c.req.path, method: c.req.method }, 'unauthorized request');
    return c.json(
      {
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      },
      401
    );
  }

  // Attach to context for downstream handlers
  c.set('user', session.user);
  c.set('session', session.session);

  log.debug({ userId: session.user.id, path: c.req.path }, 'authenticated request');

  return next();
}
