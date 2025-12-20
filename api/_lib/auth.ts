/**
 * Better Auth Server Configuration
 *
 * Configures authentication for the Chat with Google Maps application.
 * Uses Better Auth with Drizzle adapter for PostgreSQL database integration.
 *
 * Features:
 * - Email/password authentication
 * - Cookie-based session management
 * - CORS configuration for frontend integration
 *
 * @module api/_lib/auth
 */

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/postgres-js';
import { getClient } from '../_db/client.js';
import * as schema from '../_db/schema/index.js';
import { getBetterAuthSecret, getBetterAuthUrl, getTrustedOrigins } from './env.js';

/**
 * Create Drizzle ORM instance with schema for Better Auth
 */
const db = drizzle(getClient(), { schema });

/**
 * Better Auth server instance
 *
 * Configuration includes:
 * - Drizzle adapter for PostgreSQL
 * - Email and password authentication enabled
 * - Session cookie caching for performance
 * - Trusted origins for CORS
 */
export const auth = betterAuth({
  /**
   * Database adapter configuration
   * Uses Drizzle with PostgreSQL driver
   */
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),

  /**
   * Secret key for signing cookies and tokens
   */
  secret: getBetterAuthSecret(),

  /**
   * Base URL for authentication (frontend URL)
   */
  baseURL: getBetterAuthUrl(),

  /**
   * Trusted origins for CORS
   * Includes primary URL and additional dev ports in development
   */
  trustedOrigins: getTrustedOrigins(),

  /**
   * Email and password authentication configuration
   */
  emailAndPassword: {
    enabled: true,
    /**
     * Minimum password length for security
     */
    minPasswordLength: 8,
  },

  /**
   * Session configuration
   */
  session: {
    /**
     * Cookie cache for improved performance
     * Reduces database queries for session validation
     */
    cookieCache: {
      enabled: true,
      /**
       * Cache duration in seconds (5 minutes)
       */
      maxAge: 60 * 5,
    },
    /**
     * Session expiration in seconds (7 days)
     */
    expiresIn: 60 * 60 * 24 * 7,
    /**
     * Update session expiration on activity
     */
    updateAge: 60 * 60 * 24,
  },

  /**
   * Advanced configuration
   */
  advanced: {
    /**
     * Cookie configuration for cross-site requests
     */
    crossSubDomainCookies: {
      enabled: false,
    },
  },
});

/**
 * Export auth handler for mounting on Hono
 */
export const authHandler = auth.handler;

/**
 * Export session type for type-safe session access
 */
export type Session = typeof auth.$Infer.Session;
