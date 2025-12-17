# Task Checklist

**Session ID**: `phase01-session02-api-key-protection`
**Total Tasks**: 22
**Estimated Duration**: 7-9 hours
**Created**: 2025-12-17

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0102]` = Session reference (Phase 01, Session 02)
- `TNNN` = Task ID

---

## Progress Summary

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Setup | 3 | 3 | 0 |
| Foundation | 6 | 6 | 0 |
| Implementation | 7 | 7 | 0 |
| Testing | 6 | 6 | 0 |
| **Total** | **22** | **22** | **0** |

---

## Setup (3 tasks)

Initial configuration and environment preparation.

- [x] T001 [S0102] Verify prerequisites met (Hono setup, existing routes, dev server proxy)
- [x] T002 [S0102] Create directory structure (`api/middleware/`, `api/lib/`)
- [x] T003 [S0102] Update `.env.example` with server-side variable documentation (`.env.example`)

---

## Foundation (6 tasks)

Core structures, types, and base implementations.

- [x] T004 [S0102] [P] Create custom error classes and types (`api/lib/errors.ts`)
- [x] T005 [S0102] [P] Create environment variable loading and validation module (`api/lib/env.ts`)
- [x] T006 [S0102] Create error handling middleware with consistent JSON format (`api/middleware/error-handler.ts`)
- [x] T007 [S0102] Create request validation middleware for proxy routes (`api/middleware/validate-request.ts`)
- [x] T008 [S0102] Define TypeScript interfaces for Gemini grounding request/response (`api/lib/types.ts`)
- [x] T009 [S0102] Wire up middleware in main API entry point (`api/index.ts`)

---

## Implementation (7 tasks)

Main feature implementation - proxy routes and client updates.

- [x] T010 [S0102] Implement Gemini grounding proxy route handler (`api/routes/gemini.ts`)
- [x] T011 [S0102] Add request body validation for Gemini proxy (`api/routes/gemini.ts`)
- [x] T012 [S0102] Add timeout handling (30s) for external API calls (`api/routes/gemini.ts`)
- [x] T013 [S0102] Implement Maps proxy routes as alias to Gemini grounding (`api/routes/maps.ts`)
- [x] T014 [S0102] Mount Gemini and Maps routes in main API (`api/index.ts`)
- [x] T015 [S0102] Update client maps-grounding to use proxy endpoint (`src/lib/api/maps-grounding.ts`)
- [x] T016 [S0102] Remove direct API key usage from client maps-grounding (`src/lib/api/maps-grounding.ts`)

---

## Testing (6 tasks)

Verification and quality assurance.

- [x] T017 [S0102] [P] Write unit tests for Gemini proxy routes - success cases (`api/__tests__/gemini.test.ts`)
- [x] T018 [S0102] [P] Write unit tests for Gemini proxy routes - error cases (`api/__tests__/gemini.test.ts`)
- [x] T019 [S0102] [P] Write unit tests for Maps proxy routes (`api/__tests__/maps.test.ts`)
- [x] T020 [S0102] Run full test suite and verify all passing (`npm run test`)
- [x] T021 [S0102] Run lint and type-check, fix any issues (`npm run lint && npm run typecheck`)
- [x] T022 [S0102] Manual testing - verify no API keys in browser network tab

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
Tasks marked `[P]` can be worked on simultaneously:
- T004 and T005 (error classes and env module)
- T017, T018, and T019 (test files are independent)

### Task Timing
Target ~20-25 minutes per task.

### Dependencies
Key dependency chains:
1. T002 -> T004/T005 -> T006/T007 (directories before files, lib before middleware)
2. T004/T005 -> T006 (errors.ts needed by error-handler.ts)
3. T006/T007 -> T009 (middleware before wiring)
4. T008 -> T010/T013 (types before routes)
5. T009 -> T014 (middleware wiring before route mounting)
6. T010 -> T015/T016 (proxy routes before client update)
7. T014 -> T17-T22 (routes mounted before testing)

### Key Implementation Details
- Use native `fetch` for external API calls (Node 18+ built-in)
- Proxy should pass request body unchanged to external API
- Return external API response unchanged (except error wrapping)
- 30-second timeout for external API calls
- Gemini REST API endpoint: `generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`

### Security Considerations
- `GEMINI_API_KEY` must NOT have `VITE_` prefix (keeps it server-side only)
- Client-side keys (`VITE_*`) remain for Maps JS API and Gemini Live WebSocket
- These client keys should have HTTP referrer restrictions in Google Cloud Console

---

## Session Complete

All 22 tasks completed successfully. Run `/validate` to verify session completeness.
