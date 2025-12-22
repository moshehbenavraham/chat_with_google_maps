# Task Checklist

**Session ID**: `phase05-session01-langfuse-setup`
**Total Tasks**: 22
**Estimated Duration**: 7-9 hours
**Created**: 2025-12-22

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0501]` = Session reference (Phase 05, Session 01)
- `TNNN` = Task ID

---

## Progress Summary

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Setup | 3 | 3 | 0 |
| Foundation | 6 | 6 | 0 |
| Implementation | 8 | 8 | 0 |
| Testing | 5 | 5 | 0 |
| **Total** | **22** | **22** | **0** |

---

## Setup (3 tasks)

Initial configuration and environment preparation.

- [x] T001 [S0501] Verify Docker is running and ports 3016/5440 are available
- [x] T002 [S0501] Install langfuse npm package (`package.json`)
- [x] T003 [S0501] Add Langfuse environment variables to `.env.example`

---

## Foundation (6 tasks)

Docker Compose and base infrastructure.

- [x] T004 [S0501] Add langfuse-db PostgreSQL service to `docker-compose.yml`
- [x] T005 [S0501] Add langfuse-server service to `docker-compose.yml`
- [x] T006 [S0501] Add langfuse volume for persistent data (`docker-compose.yml`)
- [x] T007 [S0501] [P] Add npm script: langfuse:start (`package.json`)
- [x] T008 [S0501] [P] Add npm script: langfuse:stop (`package.json`)
- [x] T009 [S0501] [P] Add npm scripts: langfuse:logs, langfuse:reset (`package.json`)

---

## Implementation (8 tasks)

Core Langfuse client wrapper and test endpoint.

- [x] T010 [S0501] Create Langfuse client singleton (`api/_lib/langfuse.ts`)
- [x] T011 [S0501] Add environment-aware flush configuration (`api/_lib/langfuse.ts`)
- [x] T012 [S0501] Implement graceful shutdown with SIGTERM/SIGINT handlers (`api/_lib/langfuse.ts`)
- [x] T013 [S0501] Export tracing utilities: getLangfuse, flushTraces (`api/_lib/langfuse.ts`)
- [x] T014 [S0501] Create trace-test route handler (`api/_routes/trace-test.ts`)
- [x] T015 [S0501] Implement test trace creation in trace-test endpoint (`api/_routes/trace-test.ts`)
- [x] T016 [S0501] Register trace-test route in app (`api/_app.ts`)
- [x] T017 [S0501] Import langfuse module for shutdown registration (`api/_server.ts`)

---

## Testing (5 tasks)

Verification and quality assurance.

- [x] T018 [S0501] [P] Write unit tests for langfuse client initialization (`api/_lib/__tests__/langfuse.test.ts`)
- [x] T019 [S0501] [P] Write unit tests for shutdown handler registration (`api/_lib/__tests__/langfuse.test.ts`)
- [x] T020 [S0501] Run quality gates: typecheck, lint, format, test (`npm run quality`)
- [x] T021 [S0501] Validate ASCII encoding on all created/modified files
- [x] T022 [S0501] Manual testing: start Langfuse, create trace, verify in dashboard

---

## Completion Checklist

Before marking session complete:

- [x] All tasks marked `[x]`
- [x] All tests passing
- [x] All files ASCII-encoded
- [x] implementation-notes.md updated
- [x] Ready for `/validate`

---

## Notes

### Parallelization
Tasks T007-T009 (npm scripts) can be done together.
Tasks T018-T019 (unit tests) can be written in parallel.

### Task Timing
Target ~20-25 minutes per task.

### Dependencies
- T004 must complete before T005 (langfuse-server depends on langfuse-db)
- T010-T013 are sequential (building the langfuse module)
- T014-T015 depend on T010-T013 (need langfuse client)
- T016 depends on T014-T015 (route must exist before mounting)
- T017 depends on T010-T013 (module must exist before importing)

### Docker Service Architecture
```
langfuse-db (port 5440) <- langfuse-server (port 3016) <- Hono API (port 3011)
```

### Manual Testing Sequence
1. `npm run langfuse:start` - Start Langfuse services
2. Wait ~30 seconds for database initialization
3. Access http://localhost:3016 - Create account and project
4. Copy API keys from Langfuse dashboard
5. Add keys to `.env.local`
6. `npm run api:dev` - Start API server
7. `curl http://localhost:3011/api/trace-test` - Create test trace
8. Verify trace appears in Langfuse dashboard
9. Ctrl+C to stop API server, verify flush message in logs

---

## Next Steps

Run `/validate` to verify session completeness.
