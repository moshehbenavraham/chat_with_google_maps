/**
 * Drizzle Kit Configuration
 *
 * Configuration for Drizzle CLI commands:
 * - npm run db:generate - Generate migrations from schema changes
 * - npm run db:migrate - Apply pending migrations
 * - npm run db:push - Push schema directly (dev only)
 * - npm run db:studio - Launch Drizzle Studio UI
 */

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  // Schema location
  schema: './api/_db/schema/index.ts',

  // Migrations output directory
  out: './drizzle',

  // Database dialect
  dialect: 'postgresql',

  // Database connection
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  // Verbose logging
  verbose: true,

  // Strict mode for safer migrations
  strict: true,
});
