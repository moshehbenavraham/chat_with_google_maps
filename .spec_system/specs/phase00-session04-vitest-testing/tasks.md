# Task Checklist

**Session ID**: `phase00-session04-vitest-testing`
**Total Tasks**: 22
**Estimated Duration**: 7-9 hours
**Created**: 2025-12-17

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0004]` = Session reference (Phase 00, Session 04)
- `TNNN` = Task ID

---

## Progress Summary

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Setup | 3 | 3 | 0 |
| Foundation | 5 | 5 | 0 |
| Implementation | 10 | 10 | 0 |
| Testing | 4 | 4 | 0 |
| **Total** | **22** | **22** | **0** |

---

## Setup (3 tasks)

Initial configuration and environment preparation.

- [x] T001 [S0004] Verify prerequisites met (Node.js v18+, completed sessions 01-03)
- [x] T002 [S0004] Install Vitest and coverage dependencies (`vitest`, `@vitest/coverage-v8`)
- [x] T003 [S0004] Install React Testing Library dependencies (`@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`)

---

## Foundation (5 tasks)

Core structures and base implementations.

- [x] T004 [S0004] Create `vitest.config.ts` with jsdom environment and path aliases (`vitest.config.ts`)
- [x] T005 [S0004] Configure V8 coverage settings in vitest config (`vitest.config.ts`)
- [x] T006 [S0004] Update `tsconfig.json` to include vitest and jest-dom types (`tsconfig.json`)
- [x] T007 [S0004] Create test directory structure (`src/test/`)
- [x] T008 [S0004] Create test setup file with jest-dom matchers (`src/test/setup.ts`)

---

## Implementation (10 tasks)

Main feature implementation.

- [x] T009 [S0004] Create test utilities with render helper (`src/test/test-utils.tsx`)
- [x] T010 [S0004] Create mock LiveAPIContext provider for component testing (`src/test/test-utils.tsx`)
- [x] T011 [S0004] Add npm test scripts to package.json (`package.json`)
- [x] T012 [S0004] [P] Write unit tests for `isObject()` function (`src/types/guards.test.ts`)
- [x] T013 [S0004] [P] Write unit tests for `hasProperty()` function (`src/types/guards.test.ts`)
- [x] T014 [S0004] [P] Write unit tests for `isLatLngLiteral()` and `isLatLngAltitudeLiteral()` functions (`src/types/guards.test.ts`)
- [x] T015 [S0004] [P] Write unit tests for `isMapMarkerPosition()` function (`src/types/guards.test.ts`)
- [x] T016 [S0004] [P] Write unit tests for `isNonEmptyString()` and `isNonEmptyArray()` functions (`src/types/guards.test.ts`)
- [x] T017 [S0004] [P] Write unit tests for `assertDefined()` and `getOrDefault()` functions (`src/types/guards.test.ts`)
- [x] T018 [S0004] [P] Write unit test for `base64ToArrayBuffer()` function (`src/lib/utils.test.ts`)

---

## Testing (4 tasks)

Verification and quality assurance.

- [x] T019 [S0004] Write component test for ErrorScreen demonstrating RTL patterns (`src/components/ErrorScreen.test.tsx`)
- [x] T020 [S0004] Run test suite and verify all tests pass (`npm run test`)
- [x] T021 [S0004] Run coverage report and verify output (`npm run test:coverage`)
- [x] T022 [S0004] Validate ASCII encoding, ESLint, and Prettier on all test files

---

## Completion Checklist

Before marking session complete:

- [x] All tasks marked `[x]`
- [x] All tests passing
- [x] All files ASCII-encoded (0-127 characters only)
- [x] implementation-notes.md updated
- [x] Ready for `/validate`

---

## Notes

### Parallelization
Tasks T012-T018 are marked `[P]` and can be worked on simultaneously as they create independent test cases within their respective test files.

### Task Timing
Target ~20-25 minutes per task.

### Dependencies
- T002 and T003 must complete before T004-T008
- T007 and T008 must complete before T009-T010
- T004-T011 must complete before T012-T019
- T012-T019 must complete before T020-T022

### Key Files Summary

| File | Description |
|------|-------------|
| `vitest.config.ts` | Vitest config with jsdom, coverage, path aliases |
| `src/test/setup.ts` | Global test setup with jest-dom matchers |
| `src/test/test-utils.tsx` | Custom render with mock providers |
| `src/types/guards.test.ts` | Unit tests for 9 type guard functions |
| `src/lib/utils.test.ts` | Unit test for base64ToArrayBuffer |
| `src/components/ErrorScreen.test.tsx` | Component test demonstrating RTL |

### NPM Scripts to Add

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

---

## Next Steps

Run `/implement` to begin AI-led implementation.
