# Session Specification

**Session ID**: `phase05-session01-langfuse-setup`
**Phase**: 05 - AI Observability (Langfuse)
**Status**: Not Started
**Created**: 2025-12-22

---

## 1. Session Overview

This session establishes the foundational AI observability infrastructure by deploying Langfuse locally via Docker Compose and creating the client wrapper for the Hono backend. Langfuse is an open-source LLM observability platform that provides tracing, monitoring, and cost tracking capabilities essential for debugging and optimizing AI-powered applications.

With the frontend modernization complete in Phase 04, the project is ready to add comprehensive observability for the voice agent. This session creates the infrastructure layer that all subsequent tracing sessions will build upon - REST API tracing (Session 02), WebSocket tracing (Session 03), and cost tracking (Session 04) all depend on the Langfuse client being properly configured and operational.

The implementation follows the project's self-hosted philosophy, running Langfuse entirely within Docker Compose alongside the existing PostgreSQL and API services. This ensures complete data sovereignty and eliminates external dependencies for observability data.

---

## 2. Objectives

1. Deploy Langfuse services (server + dedicated PostgreSQL) via Docker Compose with health checks and proper networking
2. Install and configure the Langfuse SDK with environment-aware flush settings for development and production
3. Create a reusable client wrapper that exports tracing utilities for the Hono backend
4. Verify end-to-end functionality by creating a test trace visible in the Langfuse dashboard

---

## 3. Prerequisites

### Required Sessions
- [x] `phase02-session01-postgresql-setup` - Docker Compose infrastructure
- [x] `phase02-session04-integration-verification` - Database integration working
- [x] `phase01-session01-hono-setup` - Hono backend at `/api/*` endpoints
- [x] `phase04-session06-theme-system` - Phase 04 completed

### Required Tools/Knowledge
- Docker and Docker Compose
- Langfuse JS SDK documentation
- Node.js signal handling for graceful shutdown

### Environment Requirements
- Docker Desktop or Docker Engine running
- Port 3016 available for Langfuse UI (assigned to this project in PORT-MAP)
- Port 5440 available for Langfuse PostgreSQL (assigned to this project in PORT-MAP)

---

## 4. Scope

### In Scope (MVP)
- Add `langfuse-server` and `langfuse-db` services to `docker-compose.yml`
- Configure Langfuse environment variables with secure defaults
- Install `langfuse` npm package
- Create `api/_lib/langfuse.ts` client wrapper with proper initialization
- Add npm scripts for Langfuse lifecycle management
- Implement graceful shutdown with `SIGTERM`/`SIGINT` handlers
- Create test trace endpoint (`/api/trace-test`) for verification
- Document setup process and API key retrieval

### Out of Scope (Deferred)
- REST API endpoint tracing - *Reason: Session 02 scope*
- WebSocket session tracing - *Reason: Session 03 scope*
- Cost tracking and token usage - *Reason: Session 04 scope*
- Langfuse dashboard customization - *Reason: Not needed for foundation*
- Production deployment configuration - *Reason: Local development focus*

---

## 5. Technical Approach

### Architecture
The Langfuse deployment follows a sidecar pattern within Docker Compose:

```
+------------------+     +------------------+     +------------------+
|   Hono API       |---->|  Langfuse        |---->|  Langfuse DB     |
|   (port 3011)    |     |  Server          |     |  (PostgreSQL)    |
|                  |     |  (port 3016)     |     |  (port 5440)     |
+------------------+     +------------------+     +------------------+
        |                        ^
        |                        |
        v                        |
+------------------+             |
|   Main DB        |             |
|   (port 5438)    |             |
+------------------+             |
                                 |
        +------------------------+
        |  Trace data via SDK
```

### Design Patterns
- **Singleton Pattern**: Single Langfuse client instance for the entire application
- **Environment-Aware Configuration**: Different flush settings for dev vs prod
- **Graceful Shutdown**: Process signal handlers ensure trace data is not lost

### Technology Stack
- Langfuse Server: `langfuse/langfuse:latest` Docker image
- Langfuse PostgreSQL: `postgres:16-alpine` (separate from main DB)
- Langfuse SDK: `langfuse` npm package (latest version)
- Node.js: Signal handlers for `SIGTERM`, `SIGINT`

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `api/_lib/langfuse.ts` | Langfuse client wrapper with shutdown handling | ~40 |
| `api/_routes/trace-test.ts` | Test endpoint to verify tracing works | ~30 |
| `api/_lib/__tests__/langfuse.test.ts` | Unit tests for langfuse module | ~60 |

### Files to Modify
| File | Changes | Est. Lines |
|------|---------|------------|
| `docker-compose.yml` | Add langfuse-server and langfuse-db services | ~40 |
| `package.json` | Add langfuse dependency and npm scripts | ~10 |
| `.env.example` | Add Langfuse environment variables | ~5 |
| `api/_app.ts` | Register trace-test route | ~3 |
| `api/_server.ts` | Import langfuse for shutdown registration | ~2 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] `docker compose up langfuse-server langfuse-db` starts without errors
- [ ] Langfuse UI accessible at `http://localhost:3016` after ~30 seconds startup
- [ ] Can create project and obtain API keys from Langfuse dashboard
- [ ] `GET /api/trace-test` creates a trace visible in Langfuse dashboard
- [ ] Graceful shutdown flushes pending traces (verified via logs)

### Testing Requirements
- [ ] Unit tests for langfuse client initialization
- [ ] Unit tests for graceful shutdown behavior
- [ ] Manual testing: trace-test endpoint creates visible trace

### Quality Gates
- [ ] All files ASCII-encoded
- [ ] Unix LF line endings
- [ ] TypeScript strict mode passing (`npm run typecheck`)
- [ ] ESLint passing with no warnings (`npm run lint`)
- [ ] Prettier formatting applied (`npm run format:check`)
- [ ] All existing tests pass (`npm run test`)

---

## 8. Implementation Notes

### Key Considerations
- Langfuse requires ~30 seconds on first startup for database initialization
- API keys must be manually retrieved from Langfuse UI after first login
- The `flushAt` and `flushInterval` settings differ between dev and prod for responsiveness vs efficiency
- Langfuse server uses port 3000 internally, mapped to 3016 externally per PORT-MAP

### Potential Challenges
- **Port Conflicts**: Port 3016 (UI) and 5440 (DB) assigned to this project in PORT-MAP
- **Database Initialization**: First startup takes longer - mitigated by health check with adequate retries
- **API Key Retrieval**: Manual step required - documented in setup instructions
- **Signal Handler Registration**: Must import langfuse module early - handled in server entry point

### ASCII Reminder
All output files must use ASCII-only characters (0-127). Avoid curly quotes, em dashes, and other non-ASCII characters.

---

## 9. Testing Strategy

### Unit Tests
- Langfuse client exports correct interface
- Environment variable validation
- Shutdown handler registration

### Integration Tests
- N/A for this session (tracing integration tested manually)

### Manual Testing
1. Start Langfuse services: `npm run langfuse:start`
2. Access UI at `http://localhost:3016`
3. Create project and copy API keys
4. Configure `.env.local` with keys
5. Start API server: `npm run api:dev`
6. Hit test endpoint: `curl http://localhost:3011/api/trace-test`
7. Verify trace appears in Langfuse dashboard
8. Stop API server (Ctrl+C) and verify flush message in logs

### Edge Cases
- Server startup before Langfuse is ready (should not crash, may log warnings)
- Missing environment variables (should provide clear error message)
- Network failure to Langfuse (should not crash API server)

---

## 10. Dependencies

### External Libraries
- `langfuse`: latest (Langfuse JS SDK)

### Other Sessions
- **Depends on**: `phase02-session01-postgresql-setup` (Docker Compose infrastructure)
- **Depended by**: `phase05-session02-rest-api-tracing`, `phase05-session03-websocket-tracing`, `phase05-session04-cost-tracking`

---

## 11. NPM Scripts

The following npm scripts will be added:

```json
{
  "langfuse:start": "docker compose up -d langfuse-server langfuse-db",
  "langfuse:stop": "docker compose stop langfuse-server langfuse-db",
  "langfuse:logs": "docker compose logs -f langfuse-server",
  "langfuse:reset": "docker compose down langfuse-server langfuse-db -v && docker compose up -d langfuse-server langfuse-db"
}
```

---

## 12. Environment Variables

```env
# Langfuse Configuration
LANGFUSE_SECRET_KEY=sk-lf-...      # From Langfuse dashboard
LANGFUSE_PUBLIC_KEY=pk-lf-...      # From Langfuse dashboard
LANGFUSE_BASE_URL=http://localhost:3016

# Langfuse Docker (internal)
LANGFUSE_NEXTAUTH_SECRET=your-secret-key-change-in-production
LANGFUSE_SALT=your-salt-change-in-production
```

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
