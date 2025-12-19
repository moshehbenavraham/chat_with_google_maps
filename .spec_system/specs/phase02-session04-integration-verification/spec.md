# Session Specification

**Session ID**: `phase02-session04-integration-verification`
**Phase**: 02 - Database Layer (PostgreSQL + Drizzle)
**Status**: Not Started
**Created**: 2025-12-19

---

## 1. Session Overview

This session completes Phase 02 by integrating the database layer with the existing Hono API infrastructure. The PostgreSQL database and Drizzle ORM have been configured in previous sessions, but they are not yet connected to the API endpoints. This session bridges that gap by creating database verification endpoints and enhancing the health check to include database connectivity status.

The integration is critical for enabling Phase 03 (Authentication with Better Auth), which requires a working database layer accessible through the API. By the end of this session, the complete database stack will be verified to work in both local development (via Docker Compose) and production environments.

This session also establishes the documentation foundation for production database deployment, providing clear guidance on self-hosted PostgreSQL options while maintaining the project's vendor-neutral philosophy.

---

## 2. Objectives

1. Create `/api/db/test` endpoint that verifies database connectivity and returns table status
2. Enhance `/api/health` endpoint to include database connectivity in the health check response
3. Write integration tests that verify database operations through the API layer
4. Update production deployment documentation with database configuration guidance

---

## 3. Prerequisites

### Required Sessions
- [x] `phase02-session01-postgresql-setup` - Docker PostgreSQL infrastructure
- [x] `phase02-session02-drizzle-configuration` - Drizzle ORM with connection pooling
- [x] `phase02-session03-schema-migrations` - Auth-ready database schema (users, sessions tables)

### Required Tools/Knowledge
- Hono route patterns (existing in `api/_routes/`)
- Drizzle ORM query API (`getDb()` function)
- Docker Compose service orchestration

### Environment Requirements
- Docker running with PostgreSQL container healthy
- `DATABASE_URL` environment variable configured
- Database migrations applied (`npm run db:migrate`)

---

## 4. Scope

### In Scope (MVP)
- Database test endpoint (`/api/db/test`) with connectivity verification
- Enhanced health check with `services.database` status
- Extended `HealthResponse` type to support service statuses
- Integration tests for database API routes
- Production database deployment documentation (`docs/DEPLOYMENT_DATABASE.md`)
- Fresh database setup verification (docker down -v, up, migrate flow)

### Out of Scope (Deferred)
- Production database provisioning - *Reason: Environment-specific, user responsibility*
- Database backups and recovery procedures - *Reason: Future operations session*
- Performance optimization and query tuning - *Reason: Premature without usage data*
- Connection monitoring and alerting - *Reason: Production infrastructure concern*
- CRUD operations beyond connectivity testing - *Reason: Application logic, Phase 04+*

---

## 5. Technical Approach

### Architecture

```
+-------------------+      +-------------------+      +-------------------+
|   React Client    | ---> |    Hono API       | ---> |   PostgreSQL      |
|                   |      |   /api/health     |      |   (Docker)        |
|                   |      |   /api/db/test    |      |                   |
+-------------------+      +-------------------+      +-------------------+
                                    |
                                    v
                           +-------------------+
                           |   Drizzle ORM     |
                           |   getDb()         |
                           +-------------------+
```

The database test route follows the existing route pattern in `api/_routes/`. It uses the singleton `getDb()` function from `api/_db/index.ts` to execute a simple connectivity query. The health endpoint is enhanced to perform a lightweight database ping (`SELECT 1`) and report the status in the response.

### Design Patterns
- **Singleton Database**: Uses existing `getDb()` pattern for connection reuse
- **Graceful Degradation**: Health endpoint returns `degraded` status when DB is down (not error)
- **Route Composition**: New route mounted via `app.route()` in `_app.ts`

### Technology Stack
- Hono v4 (existing)
- Drizzle ORM with postgres-js driver (existing)
- PostgreSQL 16 Alpine (existing)
- Vitest for integration tests (existing)

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `api/_routes/db-test.ts` | Database connectivity test endpoint | ~45 |
| `api/_tests/db-test.test.ts` | Integration tests for db-test route | ~80 |
| `docs/DEPLOYMENT_DATABASE.md` | Production database deployment guide | ~150 |

### Files to Modify
| File | Changes | Est. Lines |
|------|---------|------------|
| `api/_routes/health.ts` | Add database connectivity check | ~25 |
| `api/_app.ts` | Mount new db-test route | ~3 |
| `api/_lib/types.ts` | Extend HealthResponse with services | ~15 |
| `docs/DATABASE.md` | Update "Next Steps" section | ~10 |
| `README.md` | Add database verification section | ~15 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] `GET /api/db/test` returns `{ status: "connected", timestamp: "...", tables: {...} }` when DB is up
- [ ] `GET /api/db/test` returns `{ status: "error", message: "..." }` with 500 when DB is down
- [ ] `GET /api/health` returns `{ status: "ok", services: { database: "connected" } }` when DB is up
- [ ] `GET /api/health` returns `{ status: "degraded", services: { database: "disconnected" } }` when DB is down
- [ ] Fresh database setup works: `docker compose down -v && docker compose up -d db && npm run db:migrate`
- [ ] Full docker-compose stack starts: `docker compose up` (both db and api services)

### Testing Requirements
- [ ] Unit tests for db-test route (mocked database)
- [ ] Integration tests with real database connection
- [ ] Health endpoint tests covering connected/disconnected states
- [ ] All existing tests continue to pass

### Quality Gates
- [ ] All files ASCII-encoded (0-127 characters only)
- [ ] Unix LF line endings
- [ ] TypeScript strict mode passes (`npm run typecheck`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Prettier formatting applied (`npm run format:check`)
- [ ] All tests pass (`npm run test`)

---

## 8. Implementation Notes

### Key Considerations

1. **Database Connection in Serverless**: The `getDb()` function uses lazy initialization which is suitable for serverless. Each invocation may create a new connection, but postgres-js handles pooling.

2. **Health Check Performance**: The health endpoint database check uses `SELECT 1` (not a table query) to minimize latency. This should complete in <10ms under normal conditions.

3. **Error Handling**: Database errors are caught and converted to appropriate HTTP responses. Connection errors should not crash the API server.

4. **Type Safety**: The `HealthResponse` interface must be extended to include the optional `services` field for backwards compatibility with existing clients.

### Potential Challenges

- **Connection Timeout**: If the database is unreachable, the health check could hang. Mitigation: Add a timeout to the database query (3 seconds max).
- **Type Changes**: Modifying `HealthResponse` could affect existing code. Mitigation: Make `services` optional to maintain backwards compatibility.
- **Test Isolation**: Integration tests need a running database. Mitigation: Use the existing Docker setup and skip tests if DB unavailable.

### ASCII Reminder
All output files must use ASCII-only characters (0-127). No smart quotes, em dashes, or non-ASCII symbols.

---

## 9. Testing Strategy

### Unit Tests
- Test db-test route handler logic with mocked `getDb()`
- Test health route with mocked database connection
- Test error handling when database throws exceptions

### Integration Tests
- Test `/api/db/test` with real PostgreSQL connection
- Test `/api/health` with database service running
- Test response format matches TypeScript types

### Manual Testing
1. Start database: `npm run db:start`
2. Run migrations: `npm run db:migrate`
3. Start API: `npm run dev`
4. Test endpoints:
   - `curl http://localhost:5175/api/health`
   - `curl http://localhost:5175/api/db/test`
5. Stop database: `npm run db:stop`
6. Verify degraded responses:
   - `curl http://localhost:5175/api/health` (should show degraded)
   - `curl http://localhost:5175/api/db/test` (should show error)

### Edge Cases
- Database not started (connection refused)
- Database started but migrations not applied (tables missing)
- Database connection drops mid-request
- Very slow database response (timeout handling)

---

## 10. Dependencies

### External Libraries
- `hono`: ^4.x (existing)
- `drizzle-orm`: ^0.38.x (existing)
- `postgres`: ^3.x (existing)
- `vitest`: ^2.x (existing, for tests)

### Other Sessions
- **Depends on**: phase02-session01, phase02-session02, phase02-session03
- **Depended by**: phase03-session01 (Better Auth setup requires verified database)

---

## 11. API Response Schemas

### GET /api/db/test (Success - 200)
```json
{
  "status": "connected",
  "timestamp": "2025-12-19T10:30:00.000Z",
  "tables": {
    "users": true,
    "sessions": true
  }
}
```

### GET /api/db/test (Error - 500)
```json
{
  "status": "error",
  "message": "Connection refused"
}
```

### GET /api/health (Healthy - 200)
```json
{
  "status": "ok",
  "timestamp": "2025-12-19T10:30:00.000Z",
  "version": "0.0.7",
  "services": {
    "database": "connected"
  }
}
```

### GET /api/health (Degraded - 200)
```json
{
  "status": "degraded",
  "timestamp": "2025-12-19T10:30:00.000Z",
  "version": "0.0.7",
  "services": {
    "database": "disconnected"
  }
}
```

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
