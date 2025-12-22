# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-22
**Project State**: Phase 05 - AI Observability (Langfuse)
**Completed Sessions**: 22

---

## Recommended Next Session

**Session ID**: `phase05-session01-langfuse-setup`
**Session Name**: Langfuse Setup & Docker Deployment
**Estimated Duration**: 2-4 hours
**Estimated Tasks**: 20-25

---

## Why This Session Next?

### Prerequisites Met
- [x] Phase 04 completed (Frontend Overhaul) - All 6 sessions done
- [x] Docker Compose environment operational (from Phase 02)
- [x] Hono backend running at `/api/*` endpoints
- [x] PostgreSQL database running via Docker

### Dependencies
- **Builds on**: Docker infrastructure from Phase 02, Hono backend from Phase 01
- **Enables**: REST API tracing (Session 02), WebSocket tracing (Session 03), Cost tracking (Session 04)

### Project Progression
This is the first session of Phase 05 (AI Observability). With the frontend modernization complete, the project is ready to add comprehensive AI observability. Session 01 establishes the Langfuse infrastructure that all subsequent tracing sessions will build upon. This is a foundational session that must be completed before any tracing can be implemented.

---

## Session Overview

### Objective
Deploy Langfuse locally via Docker Compose and create the client wrapper for the Hono backend, establishing the foundation for AI observability.

### Key Deliverables
1. Updated `docker-compose.yml` with Langfuse services (server + dedicated PostgreSQL)
2. Langfuse SDK (`langfuse` npm package) installed
3. `/api/_lib/langfuse.ts` client wrapper with proper configuration
4. Environment variables configured (`.env.local`)
5. Test trace endpoint working and visible in Langfuse dashboard
6. Graceful shutdown implemented (traces flushed on exit)

### Scope Summary
- **In Scope (MVP)**: Docker Compose Langfuse services, SDK installation, client wrapper, environment variables, test trace, graceful shutdown
- **Out of Scope**: REST API tracing, WebSocket tracing, cost tracking, dashboard customization

---

## Technical Considerations

### Technologies/Patterns
- Langfuse (self-hosted via Docker)
- Docker Compose multi-service orchestration
- Langfuse JS SDK for Node.js
- Environment-aware configuration (dev vs prod flush settings)
- Graceful shutdown with process signal handlers

### Potential Challenges
- Port conflicts with existing services (Langfuse uses 3001 by default)
- Langfuse database initialization time on first startup
- Obtaining Langfuse API keys from the self-hosted dashboard
- Ensuring proper async flush on application shutdown

---

## Alternative Sessions

If this session is blocked:

No alternatives - Session 01 is the foundational session for Phase 05. All subsequent sessions (REST tracing, WebSocket tracing, cost tracking) depend on Langfuse being set up first.

If Docker/infrastructure issues block progress:
1. **Documentation tasks** - Document the planned observability architecture
2. **Schema planning** - Design the trace/span structure for voice sessions

---

## Next Steps

Run `/sessionspec` to generate the formal specification with detailed task checklist.
