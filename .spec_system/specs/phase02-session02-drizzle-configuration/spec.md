# Session Specification

**Session ID**: `phase02-session02-drizzle-configuration`
**Phase**: 02 - Database Layer (PostgreSQL + Drizzle)
**Status**: Not Started
**Created**: 2025-12-18

---

## 1. Session Overview

This session establishes the database connection layer by installing and configuring Drizzle ORM with the postgres.js driver. With PostgreSQL already running via Docker (completed in Session 01), this session creates the bridge between the Hono API and the database, setting up the foundational infrastructure that all subsequent database operations will rely on.

Drizzle ORM was chosen for its lightweight footprint (~50KB vs Prisma's ~2MB), SQL-like syntax that doesn't require learning a new DSL, excellent TypeScript inference, and edge compatibility. The postgres.js driver is the fastest PostgreSQL driver for Node.js and works seamlessly with both traditional Node.js servers and serverless/edge environments.

This session focuses purely on configuration and connection setup. Schema definition, migrations, and API integration are deferred to subsequent sessions (03 and 04) to maintain clear session boundaries and manageable scope. Upon completion, the project will have a working database connection that can be imported into any Hono route, with npm scripts for Drizzle Kit CLI commands.

---

## 2. Objectives

1. Install Drizzle ORM (`drizzle-orm`) and Drizzle Kit (`drizzle-kit`) with PostgreSQL driver (`postgres`)
2. Create database connection module following the existing `api/_` prefix convention
3. Configure `drizzle.config.ts` for schema management and migrations
4. Add npm scripts for database operations (`db:generate`, `db:migrate`, `db:push`, `db:studio`)
5. Extend environment variable handling to include `DATABASE_URL` validation
6. Verify database connection works with the Docker PostgreSQL instance

---

## 3. Prerequisites

### Required Sessions
- [x] `phase02-session01-postgresql-setup` - PostgreSQL running locally via Docker at port 5438

### Required Tools/Knowledge
- Docker and Docker Compose installed
- PostgreSQL database running (`npm run db:start`)
- Understanding of TypeScript module patterns
- Familiarity with environment variable configuration

### Environment Requirements
- Node.js 18+ with npm
- Docker Desktop or Docker Engine running
- `.env` file with `DATABASE_URL` configured
- PostgreSQL container healthy and accepting connections

---

## 4. Scope

### In Scope (MVP)
- Install `drizzle-orm`, `drizzle-kit`, and `postgres` packages
- Create `/api/_db/client.ts` - PostgreSQL client with connection pooling
- Create `/api/_db/index.ts` - Drizzle instance export
- Create `/api/_db/schema/index.ts` - Empty schema barrel file (placeholder)
- Create `drizzle.config.ts` at project root
- Add npm scripts for Drizzle CLI commands
- Extend `api/_lib/env.ts` with DATABASE_URL validation
- Create connection verification utility
- Update `.env.example` with DATABASE_URL template
- Write unit tests for database configuration module

### Out of Scope (Deferred)
- Schema definition (tables, columns, relations) - *Session 03*
- Migration generation and execution - *Session 03*
- API route integration (endpoints using db) - *Session 04*
- Production connection configuration - *Session 04*
- Connection monitoring and alerting - *Future phase*
- Query caching strategies - *Future phase*

---

## 5. Technical Approach

### Architecture

The database layer follows the existing API structure with underscore prefixes (`_db/`) to indicate internal modules not directly exposed as routes. The architecture separates concerns:

```
api/
  _db/
    client.ts      # Raw postgres.js client with pooling
    index.ts       # Drizzle instance (db) export
    schema/
      index.ts     # Barrel export for all schema files
```

This separation allows:
- Swapping the underlying driver without changing Drizzle usage
- Independent testing of connection vs ORM logic
- Clear import paths (`from '../_db'` gets the Drizzle instance)

### Design Patterns

- **Singleton Pattern**: Database client created once, reused across requests
- **Lazy Initialization**: Connection established on first use, not at import time
- **Fail-Fast Validation**: DATABASE_URL validated at startup, not on first query
- **Barrel Exports**: Single entry point (`_db/index.ts`) for all database access

### Technology Stack

| Package | Version | Purpose |
|---------|---------|---------|
| `drizzle-orm` | ^0.38.x | Type-safe ORM |
| `drizzle-kit` | ^0.30.x | CLI for migrations/schema |
| `postgres` | ^3.4.x | postgres.js driver |

---

## 6. Deliverables

### Files to Create

| File | Purpose | Est. Lines |
|------|---------|------------|
| `api/_db/client.ts` | PostgreSQL client configuration | ~30 |
| `api/_db/index.ts` | Drizzle instance export | ~15 |
| `api/_db/schema/index.ts` | Schema barrel file (empty placeholder) | ~5 |
| `drizzle.config.ts` | Drizzle Kit configuration | ~20 |
| `api/_db/__tests__/connection.test.ts` | Connection verification tests | ~60 |

### Files to Modify

| File | Changes | Est. Lines Changed |
|------|---------|-------------------|
| `package.json` | Add dependencies and db:* scripts | ~15 |
| `api/_lib/env.ts` | Add DATABASE_URL validation | ~25 |
| `.env.example` | Add DATABASE_URL template | ~3 |
| `tsconfig.json` | Ensure Drizzle compatibility (if needed) | ~2 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] `drizzle-orm` and `drizzle-kit` installed without peer dependency warnings
- [ ] `postgres` driver installed and configured
- [ ] Database connection module created at `/api/_db/index.ts`
- [ ] `drizzle.config.ts` properly configured with correct paths
- [ ] Connection pooling configured (max: 10, idle_timeout: 20s)
- [ ] `npm run db:studio` launches Drizzle Studio successfully
- [ ] Database connection can be imported in Hono routes
- [ ] Connection works with local Docker PostgreSQL

### Testing Requirements
- [ ] Unit tests verify env validation catches missing DATABASE_URL
- [ ] Connection test confirms database is reachable
- [ ] Manual verification: `npm run db:studio` opens in browser

### Quality Gates
- [ ] `npm run typecheck` passes (zero TypeScript errors)
- [ ] `npm run lint` passes (zero ESLint warnings/errors)
- [ ] `npm run format:check` passes (Prettier compliant)
- [ ] `npm run test` passes (all tests green)
- [ ] All files ASCII-encoded (no unicode issues)
- [ ] Unix LF line endings

---

## 8. Implementation Notes

### Key Considerations

1. **Connection String Format**: The DATABASE_URL must match Docker config:
   ```
   postgresql://chatmaps:chatmaps_dev_password@localhost:5438/chatmaps
   ```
   Note: Port 5438 (host) maps to 5432 (container)

2. **Underscore Prefix Convention**: All new files in `/api` use underscore prefix (`_db/`) following existing patterns (`_routes/`, `_lib/`, `_middleware/`)

3. **Schema Directory**: Create empty `schema/index.ts` now so drizzle.config.ts paths work. Session 03 will populate it.

4. **Environment Loading**: Extend existing `env.ts` pattern rather than creating parallel config

5. **No Eager Connection**: Don't establish connection at import time. Use lazy initialization to support testing and serverless cold starts.

### Potential Challenges

| Challenge | Mitigation |
|-----------|------------|
| Type conflicts between drizzle-orm versions | Pin to specific versions, check peer deps |
| postgres.js ESM/CJS interop | Use proper ESM imports, check tsconfig |
| Connection refused in CI | Tests should mock db, not require Docker |
| Drizzle Studio port conflicts | Use default 4983, document in README |

### ASCII Reminder

All output files must use ASCII-only characters (0-127). No smart quotes, em-dashes, or unicode symbols in code or comments.

---

## 9. Testing Strategy

### Unit Tests

**`api/_db/__tests__/connection.test.ts`**:
- Test that missing DATABASE_URL throws descriptive error
- Test that malformed DATABASE_URL is handled
- Test connection config has expected pooling values
- Mock postgres client to avoid Docker dependency in CI

### Integration Tests

- Deferred to Session 04 (requires schema + routes)

### Manual Testing

1. Start database: `npm run db:start`
2. Verify connection: Create temporary test file importing db
3. Launch Drizzle Studio: `npm run db:studio`
4. Confirm Studio UI loads at `http://localhost:4983`

### Edge Cases

- DATABASE_URL missing entirely
- DATABASE_URL with wrong credentials
- DATABASE_URL pointing to non-existent host
- PostgreSQL container not running
- Connection pool exhaustion (theoretical, test with config)

---

## 10. Dependencies

### External Libraries

| Library | Version | Notes |
|---------|---------|-------|
| `drizzle-orm` | ^0.38.0 | Core ORM |
| `drizzle-kit` | ^0.30.0 | Dev dependency for CLI |
| `postgres` | ^3.4.0 | PostgreSQL driver |

### Other Sessions

- **Depends on**: `phase02-session01-postgresql-setup` (Docker PostgreSQL)
- **Depended by**: `phase02-session03-schema-migrations`, `phase02-session04-integration-verification`

---

## 11. File Structure Preview

After this session, the API directory will look like:

```
api/
  _app.ts
  _server.ts
  _db/                          # NEW
    client.ts                   # NEW - postgres.js client
    index.ts                    # NEW - Drizzle instance
    schema/                     # NEW
      index.ts                  # NEW - empty barrel file
    __tests__/                  # NEW
      connection.test.ts        # NEW - unit tests
  _lib/
    env.ts                      # MODIFIED - add DATABASE_URL
    errors.ts
    types.ts
  _routes/
    ...
  _middleware/
    ...
drizzle.config.ts               # NEW - at project root
```

---

## 12. NPM Scripts to Add

```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:push": "drizzle-kit push",
  "db:studio": "drizzle-kit studio"
}
```

These complement the existing scripts:
- `db:start` - Start PostgreSQL container
- `db:stop` - Stop PostgreSQL container
- `db:reset` - Reset database (delete volume, restart)
- `db:shell` - Open psql shell
- `db:logs` - View PostgreSQL logs

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
