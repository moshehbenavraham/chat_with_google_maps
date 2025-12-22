# Task Checklist

**Session ID**: `phase05-session02-rest-api-tracing`
**Total Tasks**: 22
**Estimated Duration**: 3-4 hours
**Created**: 2025-12-22

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0502]` = Session reference (Phase 05, Session 02)
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

- [x] T001 [S0502] Verify prerequisites - Langfuse running, env vars configured
- [x] T002 [S0502] Create `api/_middleware/` directory if not exists
- [x] T003 [S0502] Review existing `api/_lib/langfuse.ts` to understand current client wrapper

---

## Foundation (6 tasks)

Core structures and base implementations.

- [x] T004 [S0502] Create Langfuse context types (`api/_lib/types/langfuse.ts`)
- [x] T005 [S0502] Define GeminiPricing interface and pricing constants (`api/_lib/cost-calculator.ts`)
- [x] T006 [S0502] Implement `calculateCost()` function (`api/_lib/cost-calculator.ts`)
- [x] T007 [S0502] Create middleware skeleton with null-client handling (`api/_middleware/langfuse-trace.ts`)
- [x] T008 [S0502] Implement trace creation logic in middleware (`api/_middleware/langfuse-trace.ts`)
- [x] T009 [S0502] Add trace finalization with status/duration in middleware (`api/_middleware/langfuse-trace.ts`)

---

## Implementation (8 tasks)

Main feature implementation.

- [x] T010 [S0502] Update `api/_lib/langfuse.ts` to re-export types and helpers
- [x] T011 [S0502] Add trace ID injection helper to logger (`api/_lib/logger.ts`)
- [x] T012 [S0502] Apply tracing middleware to routes in `api/_app.ts`
- [x] T013 [S0502] Review existing `api/_routes/gemini.ts` grounding endpoint structure
- [x] T014 [S0502] Add generation span creation at start of grounding handler (`api/_routes/gemini.ts`)
- [x] T015 [S0502] Extract token usage from Gemini usageMetadata response (`api/_routes/gemini.ts`)
- [x] T016 [S0502] Calculate cost and finalize generation span (`api/_routes/gemini.ts`)
- [x] T017 [S0502] Add error handling to generation span for failed requests (`api/_routes/gemini.ts`)

---

## Testing (5 tasks)

Verification and quality assurance.

- [x] T018 [S0502] [P] Write unit tests for cost calculator (`api/_lib/__tests__/cost-calculator.test.ts`)
- [x] T019 [S0502] [P] Write unit tests for tracing middleware (`api/_middleware/__tests__/langfuse-trace.test.ts`)
- [x] T020 [S0502] Run test suite and verify all tests pass
- [x] T021 [S0502] Validate ASCII encoding and lint on all new/modified files
- [x] T022 [S0502] Manual testing - verify traces appear in Langfuse dashboard (documented for user)

---

## Completion Checklist

Before marking session complete:

- [x] All tasks marked `[x]`
- [x] All tests passing (262/262)
- [x] All files ASCII-encoded
- [x] implementation-notes.md updated
- [x] Ready for `/validate`

---

## Notes

### Parallelization
Tasks T018 and T019 can be worked on simultaneously as they test independent components.

### Task Timing
Target ~10-15 minutes per task. Foundation and Implementation tasks may take slightly longer.

### Dependencies
- T004-T009: Foundation tasks should be completed before Implementation
- T010-T017: Must be completed in order due to interdependencies
- T018-T019: Can run in parallel after Implementation
- T020-T022: Must run sequentially after unit tests

### Key Technical Points
1. **Null Client Handling**: Always check `getLangfuse()` returns non-null before tracing
2. **Context Propagation**: Use `c.set('trace', trace)` and `c.get('trace')` pattern
3. **Graceful Degradation**: App must work even if Langfuse is unavailable
4. **Token Usage**: Handle missing `usageMetadata` with fallback to 0

### Gemini Pricing Reference
```
gemini-2.5-flash:
  - Input: $0.075 per 1M tokens
  - Output: $0.30 per 1M tokens
```

---

## Session Complete

All 22 tasks completed successfully. Run `/validate` to verify session completeness.
