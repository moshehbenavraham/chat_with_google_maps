# PRD Phase 02: Database Layer (PostgreSQL + Drizzle)

**Status**: In Progress
**Sessions**: 4
**Estimated Duration**: 2-3 days

**Progress**: 1/4 sessions (25%)

---

## Overview

Add a PostgreSQL database with Drizzle ORM. This provides persistent storage for user data, sessions, and future features (saved itineraries, preferences) while remaining **fully vendor-neutral and self-hostable**.

**Database Philosophy**: This phase uses 100% open-source components. PostgreSQL is self-hosted via Docker for both development and production. No managed database services are required--full data sovereignty is maintained.

---

## Progress Tracker

| Session | Name | Status | Est. Tasks | Validated |
|---------|------|--------|------------|-----------|
| 01 | PostgreSQL Setup | Complete | 23 | 2025-12-18 |
| 02 | Drizzle Configuration | Not Started | ~20 | - |
| 03 | Schema & Migrations | Not Started | ~18 | - |
| 04 | Integration & Verification | Not Started | ~18 | - |

---

## Completed Sessions

### Session 01: PostgreSQL Setup
**Completed**: 2025-12-18

Established PostgreSQL database infrastructure for local development using Docker Compose. Created db service with health checks, named volumes for persistence, and npm lifecycle scripts (db:start, db:stop, db:reset, db:logs, db:shell). Full documentation in docs/DATABASE.md.

---

## Upcoming Sessions

- Session 02: Drizzle Configuration

---

## Objectives

1. **Local Database**: Set up PostgreSQL via Docker Compose for local development
2. **ORM Integration**: Configure Drizzle ORM with type-safe schema and queries
3. **Migration Workflow**: Establish database migrations for schema evolution
4. **Production Ready**: Verify database works in both development and production environments
5. **Auth Preparation**: Create initial schema structure prepared for Better Auth integration

---

## Prerequisites

- Phase 00 completed (Developer Tooling & Quality Foundation)
- Phase 01 completed (Backend API Layer - Hono)
- Docker installed on development machine
- Understanding of PostgreSQL basics

---

## Technical Considerations

### Architecture

```
+-----------------------------------------------------------------+
|                    Application Stack                             |
+-------------------------+---------------------------------------+
|   React Client          |   Hono Backend                        |
|   (from Phase 01)       |   (from Phase 01)                     |
|                         |                                       |
|                         |   /api/* -> Hono                      |
|                         |     +-- Drizzle ORM --+               |
+-------------------------+-----------------------+---------------+
|                      PostgreSQL                 |               |
|   +---------------------------------------------+               |
|   |  Docker Container (local)                                   |
|   |  +-- users          (prepared for auth)                     |
|   |  +-- sessions       (prepared for auth)                     |
|   |  +-- [future tables]                                        |
|   +-------------------------------------------------------------+
+-----------------------------------------------------------------+
```

### Why PostgreSQL + Drizzle

| Component | Choice | Reason |
|-----------|--------|--------|
| **PostgreSQL** | Database | OSI-licensed, full-featured, self-hostable |
| **Drizzle ORM** | ORM | Lightweight (~50KB), type-safe, SQL-like syntax |
| **postgres.js** | Driver | Modern, fast, edge-compatible |

### Database Portability

```
+-----------------------------------------------------------------+
|                 Same Schema & Queries                            |
+-----------------+-----------------+-----------------------------+
|  Local Docker   |   VPS/Server    |   Managed (optional)        |
|  (development)  |   (production)  |   (if needed)               |
+-----------------+-----------------+-----------------------------+
| docker-compose  | Docker or bare  |  Neon/Supabase/AWS RDS      |
|                 | metal PostgreSQL|  (same connection)          |
+-----------------+-----------------+-----------------------------+
```

### Technologies

- PostgreSQL 16 (database)
- Drizzle ORM (type-safe queries)
- drizzle-kit (migrations CLI)
- postgres.js (PostgreSQL driver)
- Docker Compose (local development)

### Risks

- **Connection Management**: Database connections need proper pooling in serverless
  - Mitigation: Configure connection pooling from the start
- **Migration Conflicts**: Team members may create conflicting migrations
  - Mitigation: Clear migration workflow and naming conventions
- **Docker Complexity**: Users may be unfamiliar with Docker
  - Mitigation: Provide clear documentation and simple commands

---

## Success Criteria

Phase complete when:
- [ ] All 4 sessions completed
- [x] PostgreSQL running via Docker (local dev)
- [x] docker-compose.yml configured for local development
- [ ] Drizzle ORM configured with type-safe schema
- [ ] Database connection working in development
- [ ] Migrations workflow established (`drizzle-kit generate/migrate`)
- [ ] Test endpoint verifying database connectivity
- [ ] Schema prepared for Better Auth (Phase 03)
- [ ] Documentation for production PostgreSQL deployment
- [ ] All quality gates still passing (TypeScript, ESLint, Prettier, tests)

---

## Dependencies

### Depends On
- Phase 00: Developer Tooling & Quality Foundation
- Phase 01: Backend API Layer (Hono)

### Enables
- Phase 03: Authentication (Better Auth)
- Future: User preferences, saved itineraries, conversation history
