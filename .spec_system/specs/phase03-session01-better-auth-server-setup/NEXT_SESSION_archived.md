# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-19
**Project State**: Phase 03 - Authentication (Better Auth)
**Completed Sessions**: 13

---

## Recommended Next Session

**Session ID**: `phase03-session01-better-auth-server-setup`
**Session Name**: Better Auth Server Setup
**Estimated Duration**: 2-3 hours
**Estimated Tasks**: ~25

---

## Why This Session Next?

### Prerequisites Met
- [x] Phase 00 complete (Developer Tooling & Quality Foundation)
- [x] Phase 01 complete (Backend API Layer - Hono)
- [x] Phase 02 complete (PostgreSQL + Drizzle working)
- [x] Database running with auth-ready schema (users, sessions tables)

### Dependencies
- **Builds on**: Phase 02 Session 04 (Integration Verification) - database layer fully integrated with API
- **Enables**: Session 02 (React Client Integration) - client needs server auth endpoints first

### Project Progression
This is the natural first step for Phase 03. The server-side authentication infrastructure must be established before any client integration can occur. All three prerequisite phases are complete, providing:

1. **Hono backend** (Phase 01) - ready to mount auth routes
2. **PostgreSQL + Drizzle** (Phase 02) - database with auth-ready schema
3. **Quality gates** (Phase 00) - TypeScript, ESLint, tests ready

Session 01 establishes the auth foundation that all subsequent sessions depend on.

---

## Session Overview

### Objective
Install and configure Better Auth on the Hono backend with Drizzle adapter, generate auth database schema, and verify auth endpoints are responding correctly.

### Key Deliverables
1. `api/lib/auth.ts` - Better Auth server configuration with Drizzle adapter
2. Updated `api/db/schema.ts` - Auth tables (accounts, verifications)
3. New migration files for auth schema additions
4. Updated `api/index.ts` - Auth routes mounted at `/api/auth/*`
5. Updated `.env.example` - Auth environment variables
6. `docs/AUTH.md` - Authentication setup documentation

### Scope Summary
- **In Scope (MVP)**: Better Auth installation, Drizzle adapter config, auth schema generation, Hono route mounting, environment variables, CORS config, documentation
- **Out of Scope**: React client (Session 02), UI components (Session 02), protected routes (Session 03), OAuth providers (Session 04)

---

## Technical Considerations

### Technologies/Patterns
- Better Auth (open-source auth framework)
- Drizzle adapter for database integration
- Hono route handler mounting
- httpOnly cookie-based sessions
- CORS configuration for cross-origin auth

### Potential Challenges
- **Schema Generation**: Better Auth CLI generates schema that must integrate with existing tables
  - Mitigation: Review generated schema before applying, ensure compatibility with existing users/sessions tables
- **Cookie Configuration**: Secure cookies require proper domain/path settings
  - Mitigation: Use Better Auth defaults, configure trustedOrigins correctly
- **Environment Variables**: Auth secrets must be properly configured
  - Mitigation: Generate secure BETTER_AUTH_SECRET, update .env.example

---

## Alternative Sessions

If this session is blocked:
1. **None available** - Session 01 is the foundation for all Phase 03 work
2. **Phase 04 planning** - If Phase 03 is entirely blocked, could plan future phases

Note: Phase 03 Session 01 has no blockers. All prerequisites are met.

---

## Next Steps

Run `/sessionspec` to generate the formal specification with detailed task checklist.
