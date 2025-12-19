/**
 * Database Schema Barrel Export
 *
 * This file exports all schema definitions for the database.
 *
 * Usage:
 *   import * as schema from './schema/index.js';
 *   const db = drizzle(client, { schema });
 */

// Note: Using .ts extension with bundler moduleResolution
// drizzle-kit will strip extensions when loading
export * from './users.ts';
export * from './sessions.ts';
export * from './accounts.ts';
export * from './verifications.ts';
