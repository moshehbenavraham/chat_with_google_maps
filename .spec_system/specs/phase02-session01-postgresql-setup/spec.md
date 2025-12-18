# Session Specification

**Session ID**: `phase02-session01-postgresql-setup`
**Phase**: 02 - Database Layer (PostgreSQL + Drizzle)
**Status**: Not Started
**Created**: 2025-12-18

---

## 1. Session Overview

This session establishes the PostgreSQL database infrastructure for local development using Docker Compose. PostgreSQL is the foundational component for the Database Layer phase, providing persistent storage that will be used by Drizzle ORM, Better Auth, and future application features like saved itineraries and user preferences.

The session focuses exclusively on Docker-based PostgreSQL setup with proper configuration, volume persistence, health checks, and developer-friendly npm scripts. This creates a consistent, reproducible development environment that mirrors production without requiring cloud database services during development.

By completing this session, developers will have a fully functional local database with simple commands (`npm run db:start`, `npm run db:stop`, etc.) for lifecycle management, preparing the foundation for Session 02 (Drizzle Configuration) and subsequent database work.

---

## 2. Objectives

1. Create Docker Compose configuration with PostgreSQL 16 service including volume persistence and health checks
2. Configure environment variables for database credentials with secure defaults and flexibility
3. Implement npm scripts for database lifecycle management (start, stop, reset, logs, shell)
4. Document the local development database workflow for team onboarding

---

## 3. Prerequisites

### Required Sessions
- [x] `phase01-session01-hono-setup` - Provides Hono backend infrastructure
- [x] `phase01-session02-api-key-protection` - Server-side API pattern established
- [x] `phase01-session03-deployment-verification` - Docker configuration patterns established

### Required Tools/Knowledge
- Docker Desktop or Docker Engine installed and running
- Docker Compose V2 (comes with Docker Desktop)
- Basic understanding of Docker and containerization
- Familiarity with PostgreSQL basics

### Environment Requirements
- Docker daemon running
- Port 5432 available (or configurable via environment variable)
- Sufficient disk space for PostgreSQL data volume

---

## 4. Scope

### In Scope (MVP)
- Create `docker-compose.yml` with PostgreSQL 16 Alpine service
- Configure named volume for database persistence (`pgdata`)
- Set up environment variable substitution for credentials
- Add health check configuration for container readiness
- Create npm scripts: `db:start`, `db:stop`, `db:reset`, `db:logs`, `db:shell`
- Update `.env.example` with database environment variables
- Create `docker-compose.override.yml.example` for local customization
- Document setup in `docs/DATABASE.md`
- Update `.gitignore` for database-related exclusions

### Out of Scope (Deferred)
- Drizzle ORM installation and configuration - *Reason: Session 02 scope*
- Database schema creation - *Reason: Session 03 scope*
- Production database configuration - *Reason: Session 04 scope*
- Database backups and recovery - *Reason: Future enhancement*
- Database replication or clustering - *Reason: Out of project scope*
- pgAdmin or other GUI tools - *Reason: Shell access sufficient for MVP*

---

## 5. Technical Approach

### Architecture

```
Local Development Environment
+---------------------------+
|  Host Machine             |
|  +-----------------------+|
|  | Docker               ||
|  | +-------------------+||
|  | | PostgreSQL 16     |||
|  | | (Alpine)          |||
|  | | Port: 5432        |||
|  | +-------------------+||
|  |         |            ||
|  | +-------------------+||
|  | | pgdata volume     |||
|  | | (persistent)      |||
|  | +-------------------+||
|  +-----------------------+|
+---------------------------+
```

### Design Patterns
- **Infrastructure as Code**: Docker Compose declaratively defines the database service
- **Environment Variable Substitution**: Flexible configuration without hardcoding secrets
- **Health Checks**: Ensures database is ready before dependent services connect
- **Named Volumes**: Persistent data survives container recreation

### Technology Stack
- PostgreSQL 16 Alpine (lightweight, production-grade)
- Docker Compose V2 (service orchestration)
- Environment variable interpolation (Docker Compose native feature)

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `docker-compose.yml` | PostgreSQL service definition with health check | ~25 |
| `docker-compose.override.yml.example` | Local customization template | ~15 |
| `docs/DATABASE.md` | Local development database guide | ~80 |

### Files to Modify
| File | Changes | Est. Lines |
|------|---------|------------|
| `.env.example` | Add database environment variables section | ~15 |
| `package.json` | Add db:* npm scripts | ~8 |
| `.gitignore` | Add docker-compose.override.yml exclusion | ~3 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] `docker-compose.yml` created with PostgreSQL 16-alpine service
- [ ] Database container starts successfully with `npm run db:start`
- [ ] Data persists between container restarts (test with insert/restart/query)
- [ ] Environment variables properly configure user, password, and database
- [ ] `DATABASE_URL` connection string format is correct and documented
- [ ] Can connect to database via `npm run db:shell`
- [ ] Health check passes (`docker compose ps` shows healthy status)
- [ ] `npm run db:stop` gracefully stops the container
- [ ] `npm run db:reset` destroys and recreates database from scratch
- [ ] `npm run db:logs` shows container logs

### Testing Requirements
- [ ] Manual testing: Start, connect, insert data, restart, verify data persists
- [ ] Manual testing: Reset clears all data
- [ ] Manual testing: Shell command provides psql access

### Quality Gates
- [ ] All files ASCII-encoded (no Unicode characters)
- [ ] Unix LF line endings
- [ ] YAML files pass `docker compose config` validation
- [ ] No secrets committed to version control
- [ ] Documentation is clear and actionable

---

## 8. Implementation Notes

### Key Considerations
- Use `postgres:16-alpine` for smaller image size (~230MB vs ~400MB for full image)
- Container name `chat_maps_db` for easy identification
- Default port 5432 but configurable via `POSTGRES_PORT` environment variable
- Use command substitution defaults (`${VAR:-default}`) for flexibility
- Health check uses `pg_isready` for reliable readiness detection

### Potential Challenges
- **Port conflict**: If 5432 is in use, document how to use `POSTGRES_PORT` override
- **Docker not running**: npm scripts should fail gracefully with helpful message
- **Volume permissions**: May need documentation for Linux users with Docker permissions

### ASCII Reminder
All output files must use ASCII-only characters (0-127). No smart quotes, em-dashes, or special characters.

---

## 9. Testing Strategy

### Unit Tests
- N/A for this session (infrastructure only)

### Integration Tests
- N/A for this session (Drizzle connection tests in Session 02)

### Manual Testing
1. **Fresh start**: `npm run db:start` from clean state
2. **Health verification**: `docker compose ps` shows healthy status
3. **Connection test**: `npm run db:shell` opens psql prompt
4. **Data persistence**: Insert row, stop container, start container, verify row exists
5. **Reset test**: `npm run db:reset` clears all data
6. **Logs access**: `npm run db:logs` shows PostgreSQL logs

### Edge Cases
- Starting when Docker is not running (graceful error)
- Port 5432 already in use (document override)
- Running on Linux with Docker permissions issues (document solution)

---

## 10. Dependencies

### External Libraries
- None (Docker only)

### Docker Images
- `postgres:16-alpine` - Official PostgreSQL 16 on Alpine Linux

### Other Sessions
- **Depends on**: `phase01-session03-deployment-verification` (Docker patterns established)
- **Depended by**: `phase02-session02-drizzle-configuration`, `phase02-session03-schema-migrations`, `phase02-session04-integration-verification`

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
