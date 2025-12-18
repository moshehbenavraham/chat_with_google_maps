# Session 02: Drizzle Configuration

**Session ID**: `phase02-session02-drizzle-configuration`
**Status**: Not Started
**Estimated Tasks**: ~20
**Estimated Duration**: 2-3 hours

---

## Objective

Install and configure Drizzle ORM with PostgreSQL driver, establishing the database connection layer integrated with the Hono backend.

---

## Scope

### In Scope (MVP)
- Install `drizzle-orm` and `drizzle-kit` packages
- Install `postgres` driver (postgres.js)
- Create `/api/db/index.ts` database connection module
- Configure `drizzle.config.ts` for migrations
- Set up connection pooling configuration
- Add TypeScript types for database operations
- Create database utility functions
- Integrate database connection with Hono app lifecycle
- Add npm scripts for Drizzle CLI commands

### Out of Scope
- Schema definition (Session 03)
- Migration execution (Session 03)
- Production connection configuration (Session 04)
- Query caching
- Connection monitoring

---

## Prerequisites

- [ ] Session 01 complete (PostgreSQL running locally)
- [ ] Docker database accessible at `localhost:5432`
- [ ] Understanding of Drizzle ORM basics

---

## Deliverables

1. `/api/db/index.ts` - Database connection and Drizzle instance
2. `/api/db/client.ts` - PostgreSQL client configuration
3. `drizzle.config.ts` - Drizzle Kit configuration
4. Updated `package.json` - Drizzle dependencies and scripts
5. Updated TypeScript configuration for Drizzle

---

## Technical Details

### Directory Structure

```
api/
├── db/
│   ├── index.ts       # Drizzle instance export
│   ├── client.ts      # PostgreSQL client setup
│   └── schema/        # (created in Session 03)
│       └── index.ts
└── ...
```

### Database Connection

```typescript
// api/db/client.ts
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const queryClient = postgres(connectionString, {
  max: 10,              // Connection pool size
  idle_timeout: 20,     // Close idle connections after 20s
  connect_timeout: 10,  // Connection timeout
});
```

```typescript
// api/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import { queryClient } from './client';
import * as schema from './schema';

export const db = drizzle(queryClient, { schema });
export type Database = typeof db;
```

### Drizzle Config

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './api/db/schema/index.ts',
  out: './api/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

### NPM Scripts

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## Success Criteria

- [ ] `drizzle-orm` and `drizzle-kit` installed
- [ ] `postgres` driver installed and configured
- [ ] Database connection module created at `/api/db/index.ts`
- [ ] `drizzle.config.ts` properly configured
- [ ] TypeScript types working for database operations
- [ ] Connection pooling configured appropriately
- [ ] `npm run db:studio` launches Drizzle Studio
- [ ] Database connection can be imported in Hono routes
- [ ] ESLint and TypeScript pass on new code
