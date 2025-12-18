# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-19
**Project State**: Phase 02 - Database Layer (PostgreSQL + Drizzle)
**Completed Sessions**: 11

---

## Recommended Next Session

**Session ID**: `phase02-session03-schema-migrations`
**Session Name**: Schema & Migrations
**Estimated Duration**: 2-3 hours
**Estimated Tasks**: ~18

---

## Why This Session Next?

### Prerequisites Met
- [x] Session 02 complete (Drizzle configured)
- [x] Database connection working (via postgres.js)
- [x] Docker PostgreSQL infrastructure in place
- [x] drizzle.config.ts configured

### Dependencies
- **Builds on**: phase02-session02-drizzle-configuration (Drizzle ORM setup)
- **Enables**: phase02-session04-integration-verification (requires schema to test)

### Project Progression
This session follows the natural database workflow: setup → configuration → **schema design** → integration. With Drizzle ORM now configured and connected to PostgreSQL, the next logical step is to define the database schema and establish the migrations workflow. The schema is designed to be auth-ready, preparing the foundation for Better Auth in Phase 03.

---

## Session Overview

### Objective
Design and implement the initial database schema prepared for Better Auth integration, establish the migrations workflow, and apply the first migration.

### Key Deliverables
1. `/api/db/schema/users.ts` - User table schema with auth-ready fields
2. `/api/db/schema/sessions.ts` - Session table schema with foreign key
3. `/api/db/schema/index.ts` - Consolidated schema exports
4. `/api/db/migrations/` - Generated migration files
5. `docs/SCHEMA.md` - Schema documentation and conventions

### Scope Summary
- **In Scope (MVP)**: User and session tables, migration workflow, schema documentation, TypeScript types export
- **Out of Scope**: Better Auth schema generation, application-specific tables, database seeding, complex indexes

---

## Technical Considerations

### Technologies/Patterns
- Drizzle ORM pg-core schema definitions
- PostgreSQL tables with proper types and constraints
- Migration generation with `drizzle-kit generate`
- Migration application with `drizzle-kit migrate`
- TypeScript type inference (`$inferSelect`, `$inferInsert`)

### Potential Challenges
- Ensuring schema is forward-compatible with Better Auth requirements
- Foreign key cascade rules for session cleanup
- Timestamp handling consistency (UTC)
- Migration file management and rollback strategy

---

## Alternative Sessions

If this session is blocked:
1. **phase02-session04-integration-verification** - Cannot proceed without schema (blocked by prerequisite)
2. **Phase 03 sessions** - Cannot start authentication without complete database layer

> No viable alternatives - Session 03 must be completed to progress.

---

## Next Steps

Run `/sessionspec` to generate the formal specification.
