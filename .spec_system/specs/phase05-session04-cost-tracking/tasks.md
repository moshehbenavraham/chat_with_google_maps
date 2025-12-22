# Task Checklist

**Session ID**: `phase05-session04-cost-tracking`
**Total Tasks**: 22
**Estimated Duration**: 7-9 hours
**Created**: 2025-12-22

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0504]` = Session reference (Phase 05, Session 04)
- `TNNN` = Task ID

---

## Progress Summary

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Setup | 2 | 2 | 0 |
| Foundation | 6 | 6 | 0 |
| Implementation | 8 | 8 | 0 |
| Testing | 6 | 6 | 0 |
| **Total** | **22** | **22** | **0** |

---

## Setup (2 tasks)

Initial configuration and environment preparation.

- [x] T001 [S0504] Verify prerequisites: Langfuse running, PostgreSQL operational, keys configured
- [x] T002 [S0504] Create directory structure for new test files (`api/_lib/__tests__/`, `api/_routes/__tests__/`)

---

## Foundation (6 tasks)

Core structures, types, and base implementations.

- [x] T003 [S0504] [P] Add audio pricing constant for gemini-2.0-flash-live to cost-calculator.ts (`api/_lib/cost-calculator.ts`)
- [x] T004 [S0504] [P] Create audio cost interface with minutes-based pricing structure (`api/_lib/cost-calculator.ts`)
- [x] T005 [S0504] Implement calculateAudioCost() function for voice session billing (`api/_lib/cost-calculator.ts`)
- [x] T006 [S0504] Create safe-langfuse.ts with LangfuseStatus type definitions (`api/_lib/safe-langfuse.ts`)
- [x] T007 [S0504] Implement safeGetLangfuse() wrapper with error catching (`api/_lib/safe-langfuse.ts`)
- [x] T008 [S0504] Implement checkLangfuseHealth() status checker function (`api/_lib/safe-langfuse.ts`)

---

## Implementation (8 tasks)

Main feature implementation for routes and integration.

- [x] T009 [S0504] Create observability.ts route file with Hono router setup (`api/_routes/observability.ts`)
- [x] T010 [S0504] Implement GET /health endpoint returning healthy/degraded status (`api/_routes/observability.ts`)
- [x] T011 [S0504] Implement GET /costs endpoint with period and model breakdown structure (`api/_routes/observability.ts`)
- [x] T012 [S0504] Add cost tracking fields to TrackedSession type (`api/_lib/types/live-trace.ts`)
- [x] T013 [S0504] Extend createSession() to initialize cost tracking state (`api/_lib/session-trace-manager.ts`)
- [x] T014 [S0504] Extend endSession() to calculate and include total session cost (`api/_lib/session-trace-manager.ts`)
- [x] T015 [S0504] Mount observability routes in main app at /api/observability (`api/_app.ts`)
- [x] T016 [S0504] Add error handling for Langfuse unavailability in session operations (`api/_lib/session-trace-manager.ts`)

---

## Testing (6 tasks)

Verification and quality assurance.

- [x] T017 [S0504] [P] Write unit tests for calculateAudioCost() with edge cases (`api/_lib/__tests__/cost-calculator.test.ts`)
- [x] T018 [S0504] [P] Write unit tests for safe-langfuse wrappers (`api/_lib/__tests__/safe-langfuse.test.ts`)
- [x] T019 [S0504] [P] Write unit tests for observability health endpoint (`api/_routes/__tests__/observability.test.ts`)
- [x] T020 [S0504] [P] Write unit tests for observability costs endpoint (`api/_routes/__tests__/observability.test.ts`)
- [x] T021 [S0504] Run full test suite and verify all tests pass (`npm test`)
- [x] T022 [S0504] Create Langfuse dashboard documentation (`docs/langfuse-dashboard.md`)

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
- T003, T004: Audio pricing constants and interface (independent additions)
- T017-T020: All test files can be written in parallel once implementation complete

### Task Timing
Target ~20-25 minutes per task.

### Dependencies
- T005 depends on T003, T004 (need pricing and interface first)
- T007, T008 depend on T006 (need types first)
- T010, T011 depend on T009 (route setup first)
- T013, T014, T016 depend on T012 (type changes first)
- T015 depends on T009-T011 (routes must exist)
- T21 depends on T17-T20 (tests must be written)

### Key Implementation Details

**Audio Pricing (T003-T005)**:
```typescript
// gemini-2.0-flash-live: $0.40 per minute (bidirectional)
AUDIO_PRICING_PER_MINUTE = 0.40;
```

**Health Endpoint Response (T010)**:
```typescript
// Healthy: { status: 'healthy', timestamp: string }
// Degraded: { status: 'degraded', error: string, timestamp: string }
```

**Cost Aggregation Response (T011)**:
```typescript
{
  period: { start: string, end: string },
  totalCost: number,
  byModel: Record<string, { calls: number, cost: number }>
}
```

---

## Next Steps

Run `/implement` to begin AI-led implementation.
