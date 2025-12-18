# Session Specification

**Session ID**: `phase02-session03-schema-migrations`
**Phase**: 02 - Database Layer (PostgreSQL + Drizzle)
**Status**: Not Started
**Created**: 2025-12-19

---

## 1. Session Overview

This session establishes the foundational database schema for the Chat with Google Maps application. Building on the Drizzle ORM configuration completed in Session 02, we will design and implement auth-ready user and session tables that prepare the groundwork for Better Auth integration in Phase 03.

The schema follows Better Auth's expected table structure while remaining minimal and focused. By designing these tables now, the authentication phase can extend them seamlessly rather than recreating them. The session also establishes the migrations workflow, ensuring database changes are versioned, reviewable, and safely applied.

This is a critical infrastructure session. The schema conventions established here (naming patterns, type choices, timestamp handling) will be followed throughout the project. Getting this foundation right ensures consistency and reduces future refactoring.

---

## 2. Objectives

1. Create auth-ready `users` table schema with proper types and constraints
2. Create auth-ready `sessions` table schema with foreign key relationship
3. Establish the migrations workflow (generate, review, apply)
4. Document schema conventions for project-wide consistency

---

## 3. Prerequisites

### Required Sessions
- [x] `phase02-session01-postgresql-setup` - Docker PostgreSQL running locally
- [x] `phase02-session02-drizzle-configuration` - Drizzle ORM configured with postgres.js

### Required Tools/Knowledge
- Drizzle ORM pg-core schema syntax
- PostgreSQL data types and constraints
- Better Auth expected schema structure

### Environment Requirements
- Docker PostgreSQL running (`npm run db:start`)
- DATABASE_URL configured in .env
- Drizzle Kit CLI available (`npm run db:generate`)

---

## 4. Scope

### In Scope (MVP)
- Create `users` table schema with auth-ready fields (id, email, emailVerified, name, image, timestamps)
- Create `sessions` table schema with foreign key to users (id, userId, expiresAt, createdAt)
- Create consolidated schema exports in `api/_db/schema/index.ts`
- Generate initial migration with `drizzle-kit generate`
- Apply migration with `drizzle-kit migrate`
- Export TypeScript types for User, NewUser, Session, NewSession
- Document schema conventions and naming patterns
- Add schema unit tests for type validation

### Out of Scope (Deferred)
- Better Auth schema generation via CLI - *Reason: Phase 03 will extend with auth-specific tables (accounts, verifications)*
- Application-specific tables (conversations, itineraries) - *Reason: Future phases will add domain tables*
- Database seeding with test data - *Reason: Not required for MVP*
- Complex indexes beyond primary keys and unique constraints - *Reason: Premature optimization*
- Rollback procedures - *Reason: Development phase, can recreate*

---

## 5. Technical Approach

### Architecture

```
api/_db/
  client.ts       (existing - postgres.js connection)
  index.ts        (existing - Drizzle instance, re-exports schema)
  schema/
    index.ts      (UPDATE - barrel export for all schemas)
    users.ts      (NEW - users table definition)
    sessions.ts   (NEW - sessions table definition)
  __tests__/
    connection.test.ts  (existing)
    schema.test.ts      (NEW - schema validation tests)

drizzle/
  0000_initial_schema.sql  (NEW - generated migration)
  meta/                    (NEW - Drizzle migration metadata)
```

### Design Patterns
- **Barrel Exports**: `schema/index.ts` re-exports all schemas for clean imports
- **Type Inference**: `$inferSelect` and `$inferInsert` for type-safe CRUD
- **Lazy Initialization**: Existing pattern in client.ts preserved
- **Foreign Key Cascade**: Session deletion cascades when user deleted

### Technology Stack
- Drizzle ORM 0.45.x (pg-core module)
- PostgreSQL 16 (via Docker)
- drizzle-kit 0.31.x (migrations)
- TypeScript 5.8.x (strict mode)

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `api/_db/schema/users.ts` | Users table with auth-ready fields | ~25 |
| `api/_db/schema/sessions.ts` | Sessions table with FK to users | ~25 |
| `api/_db/__tests__/schema.test.ts` | Schema validation tests | ~60 |
| `docs/SCHEMA.md` | Schema conventions documentation | ~80 |
| `drizzle/0000_*.sql` | Generated initial migration | ~30 |

### Files to Modify
| File | Changes | Est. Lines |
|------|---------|------------|
| `api/_db/schema/index.ts` | Add schema re-exports | ~5 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] Users table schema created with fields: id (text PK), email (unique), emailVerified (boolean), name, image, createdAt, updatedAt
- [ ] Sessions table schema created with fields: id (text PK), userId (FK to users), expiresAt, createdAt
- [ ] Foreign key constraint: sessions.userId references users.id with ON DELETE CASCADE
- [ ] Schema exports consolidated in api/_db/schema/index.ts
- [ ] TypeScript types exported: User, NewUser, Session, NewSession
- [ ] Initial migration generated in drizzle/ directory
- [ ] Migration applied successfully to local PostgreSQL
- [ ] Tables verified to exist: `SELECT * FROM users LIMIT 1` and `SELECT * FROM sessions LIMIT 1`

### Testing Requirements
- [ ] Schema tests validate table structure
- [ ] Type inference tests confirm TypeScript types
- [ ] Existing connection tests still pass
- [ ] Migration can be run on fresh database

### Quality Gates
- [ ] All files ASCII-encoded (0-127 characters only)
- [ ] Unix LF line endings throughout
- [ ] TypeScript strict mode passes
- [ ] ESLint passes with no warnings
- [ ] Prettier formatting applied
- [ ] All tests pass (`npm run quality`)

---

## 8. Implementation Notes

### Key Considerations
- Use `text` type for IDs (not UUID) to match Better Auth expected format
- All timestamps use PostgreSQL `timestamp` type with `defaultNow()`
- Column names use snake_case (PostgreSQL convention), TypeScript properties use camelCase
- The `emailVerified` column uses `email_verified` in database but camelCase in schema definition
- Foreign key cascade ensures orphan sessions are cleaned up

### Potential Challenges
- **Schema Mismatch with Better Auth**: Mitigation - Reference Better Auth docs for exact field requirements
- **Migration Conflicts**: Mitigation - Start fresh with db:reset if needed during development
- **Type Export Visibility**: Mitigation - Ensure types re-exported through barrel file

### Project Conventions (Established)
- API files use `_` prefix: `api/_db/`, `api/_routes/`, etc.
- JS file extensions in imports: `./client.js` (required for ESM)
- JSDoc comments for public functions

### ASCII Reminder
All output files must use ASCII-only characters (0-127). Avoid smart quotes, em-dashes, or special unicode.

---

## 9. Testing Strategy

### Unit Tests
- Schema table definitions exist and have correct columns
- Type inference produces expected TypeScript types
- Column constraints (notNull, unique) correctly defined
- Foreign key relationship correctly defined

### Integration Tests
- Migration generates valid SQL
- Migration applies without errors
- Tables created with correct structure
- Verify with raw SQL queries after migration

### Manual Testing
1. Run `npm run db:start` to ensure PostgreSQL running
2. Run `npm run db:generate` to generate migration
3. Review generated SQL in `drizzle/` directory
4. Run `npm run db:migrate` to apply migration
5. Run `npm run db:shell` and execute: `\dt` to list tables
6. Verify columns: `\d users` and `\d sessions`

### Edge Cases
- Empty database (fresh start) - migration should work
- Re-running migration - should be idempotent or skip
- Invalid DATABASE_URL - should fail with clear error

---

## 10. Dependencies

### External Libraries
- `drizzle-orm`: ^0.45.1 (already installed)
- `drizzle-kit`: ^0.31.8 (already installed)
- `postgres`: ^3.4.7 (already installed)

### Other Sessions
- **Depends on**: phase02-session02-drizzle-configuration
- **Depended by**: phase02-session04-integration-verification, phase03-session01-better-auth-setup

---

## 11. Schema Reference

### Users Table

```typescript
// api/_db/schema/users.ts
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

### Sessions Table

```typescript
// api/_db/schema/sessions.ts
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.js';

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

### Schema Conventions

| Convention | Example | Notes |
|------------|---------|-------|
| Table names | `users`, `sessions` | Plural, snake_case |
| Column names | `user_id`, `created_at` | snake_case in DB |
| Primary keys | `id` (text) | UUID strings generated by app |
| Timestamps | `created_at`, `updated_at` | Always present |
| Foreign keys | `{singular_table}_id` | With cascade rules |
| Booleans | `email_verified` | Default to false |

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
