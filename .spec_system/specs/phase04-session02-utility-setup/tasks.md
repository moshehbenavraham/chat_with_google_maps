# Task Checklist

**Session ID**: `phase04-session02-utility-setup`
**Total Tasks**: 20
**Estimated Duration**: 1-2 hours
**Created**: 2025-12-21

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0402]` = Session reference (Phase 04, Session 02)
- `TNNN` = Task ID

---

## Progress Summary

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Setup | 3 | 3 | 0 |
| Foundation | 5 | 5 | 0 |
| Implementation | 7 | 7 | 0 |
| Testing | 5 | 5 | 0 |
| **Total** | **20** | **20** | **0** |

---

## Setup (3 tasks)

Initial configuration and environment preparation.

- [x] T001 [S0402] Verify prerequisites met (Tailwind working, dev server starts)
- [x] T002 [S0402] Install `clsx` package (`npm install clsx`)
- [x] T003 [S0402] Install `tailwind-merge` package (`npm install tailwind-merge`)

---

## Foundation (5 tasks)

Core cn() utility implementation.

- [x] T004 [S0402] Add clsx and tailwind-merge imports to `src/lib/utils.ts`
- [x] T005 [S0402] Implement cn() function with ClassValue type (`src/lib/utils.ts`)
- [x] T006 [S0402] Export cn() function from utils module (`src/lib/utils.ts`)
- [x] T007 [S0402] Verify TypeScript compilation passes (`npm run typecheck`)
- [x] T008 [S0402] Add cn import to utils.test.ts (`src/lib/utils.test.ts`)

---

## Implementation (7 tasks)

Component migration from classnames to cn().

- [x] T009 [S0402] Update ControlTray.tsx import from classnames to cn (`src/components/ControlTray.tsx`)
- [x] T010 [S0402] Verify all cn() usages in ControlTray work correctly (7 usages)
- [x] T011 [S0402] Update Sidebar.tsx import from classnames to cn (`src/components/Sidebar.tsx`)
- [x] T012 [S0402] Replace `c(` with `cn(` in Sidebar.tsx (`src/components/Sidebar.tsx`)
- [x] T013 [S0402] Remove classnames package from dependencies (`package.json`)
- [x] T014 [S0402] Run npm install to update package-lock.json
- [x] T015 [S0402] Verify no classnames imports remain in codebase (grep search)

---

## Testing (5 tasks)

Verification and quality assurance.

- [x] T016 [S0402] [P] Write unit tests for cn() basic merging (`src/lib/utils.test.ts`)
- [x] T017 [S0402] [P] Write unit tests for cn() conditional handling (`src/lib/utils.test.ts`)
- [x] T018 [S0402] [P] Write unit tests for cn() Tailwind conflict resolution (`src/lib/utils.test.ts`)
- [x] T019 [S0402] Run all quality gates (typecheck, lint, format, test, build)
- [x] T020 [S0402] Manual testing - verify ControlTray and Sidebar render correctly

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
Tasks T016-T018 (unit tests) can be worked on simultaneously since they add independent test cases to the same describe block.

### Task Timing
Target ~5-10 minutes per task. This is a focused session.

### Dependencies
- T002-T003 must complete before T004-T006
- T004-T006 must complete before T009-T012
- T009-T012 must complete before T013-T015
- T016-T018 can run in parallel after T005 completes

### Migrated classnames Usage

**ControlTray.tsx**: Changed from `import cn from 'classnames'` to `import { cn } from '@/lib/utils'`

**Sidebar.tsx**: Changed from `import c from 'classnames'` to `import { cn } from '@/lib/utils'` and replaced `c(` with `cn(`

---

## Session Complete

All tasks completed successfully. Run `/validate` to verify session completeness.
