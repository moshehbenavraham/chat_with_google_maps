# Session 03: Schema & Migrations

**Session ID**: `phase02-session03-schema-migrations`
**Status**: Not Started
**Estimated Tasks**: ~18
**Estimated Duration**: 2-3 hours

---

## Objective

Design and implement the initial database schema prepared for Better Auth integration, establish the migrations workflow, and apply the first migration.

---

## Scope

### In Scope (MVP)
- Create `/api/db/schema/users.ts` - User table (auth-ready)
- Create `/api/db/schema/sessions.ts` - Session table (auth-ready)
- Create `/api/db/schema/index.ts` - Schema exports
- Generate initial migration with `drizzle-kit generate`
- Apply migration with `drizzle-kit migrate`
- Document schema conventions and naming
- Add schema validation tests
- Create migration rollback documentation

### Out of Scope
- Better Auth schema generation (Phase 03 will extend)
- Application-specific tables (saved itineraries, etc.)
- Database seeding
- Complex indexes and constraints

---

## Prerequisites

- [ ] Session 02 complete (Drizzle configured)
- [ ] Database connection working
- [ ] Understanding of Drizzle schema syntax

---

## Deliverables

1. `/api/db/schema/users.ts` - Users table schema
2. `/api/db/schema/sessions.ts` - Sessions table schema
3. `/api/db/schema/index.ts` - Consolidated schema exports
4. `/api/db/migrations/` - Generated migration files
5. `docs/SCHEMA.md` - Schema documentation and conventions

---

## Technical Details

### Schema Design (Auth-Ready)

```typescript
// api/db/schema/users.ts
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  name: text('name'),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

```typescript
// api/db/schema/sessions.ts
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
```

```typescript
// api/db/schema/index.ts
export * from './users';
export * from './sessions';
```

### Migration Workflow

```bash
# Generate migration from schema changes
npm run db:generate

# Review generated migration in /api/db/migrations/

# Apply migration to database
npm run db:migrate

# Or push directly for development (no migration file)
npm run db:push
```

### Schema Conventions

| Convention | Example | Notes |
|------------|---------|-------|
| Table names | `users`, `sessions` | Plural, snake_case |
| Column names | `user_id`, `created_at` | snake_case |
| Primary keys | `id` (text) | UUID strings |
| Timestamps | `created_at`, `updated_at` | Always present |
| Foreign keys | `{table}_id` | With cascade rules |

---

## Success Criteria

- [ ] Users table schema created with proper types
- [ ] Sessions table schema created with foreign key
- [ ] Schema exports consolidated in index.ts
- [ ] Initial migration generated successfully
- [ ] Migration applied to local database
- [ ] Tables exist in PostgreSQL (verify with `db:shell`)
- [ ] TypeScript types exported for User and Session
- [ ] Schema documentation created
- [ ] All quality gates passing
