# Task Checklist

**Session ID**: `phase04-session03-framer-motion`
**Total Tasks**: 22
**Estimated Duration**: 6-8 hours
**Created**: 2025-12-21

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0403]` = Session reference (Phase 04, Session 03)
- `TNNN` = Task ID

---

## Progress Summary

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Setup | 3 | 3 | 0 |
| Foundation | 4 | 4 | 0 |
| Implementation | 11 | 11 | 0 |
| Testing | 4 | 4 | 0 |
| **Total** | **22** | **22** | **0** |

---

## Setup (3 tasks)

Initial configuration and environment preparation.

- [x] T001 [S0403] Verify prerequisites met (React 19.2.0, Tailwind CSS 4, cn() utility)
- [x] T002 [S0403] Install framer-motion@12.x package (`npm install framer-motion`)
- [x] T003 [S0403] Verify installation - no peer dependency warnings, check package.json

---

## Foundation (4 tasks)

Core animation variants library.

- [x] T004 [S0403] Create `src/lib/animations.ts` with fadeIn variant
- [x] T005 [S0403] [P] Add slideInRight variant for Sidebar animations
- [x] T006 [S0403] [P] Add scaleIn variant for modal animations
- [x] T007 [S0403] Add staggerContainer, staggerItem, and buttonTap variants

---

## Implementation (11 tasks)

Main feature implementation across components.

### PopUp Component
- [x] T008 [S0403] Add motion wrapper with scaleIn animation to PopUp (`src/components/popup/PopUp.tsx`)
- [x] T009 [S0403] Add AnimatePresence wrapper for PopUp exit animations

### Sidebar Component
- [x] T010 [S0403] Add motion wrapper with slideInRight animation to Sidebar (`src/components/Sidebar.tsx`)

### ErrorScreen Component
- [x] T011 [S0403] Add motion wrapper with fadeIn + subtle shake to ErrorScreen (`src/components/ErrorScreen.tsx`)

### AuthModal Component
- [x] T012 [S0403] Add AnimatePresence and motion wrappers to AuthModal (`src/components/auth/AuthModal.tsx`)
- [x] T013 [S0403] Add backdrop fade and content scaleIn animations to AuthModal

### ControlTray Component
- [x] T014 [S0403] Add button hover/press micro-interactions to ControlTray (`src/components/ControlTray.tsx`)

### StreamingConsole Component
- [x] T015 [S0403] Add staggered message animations to StreamingConsole (`src/components/streaming-console/StreamingConsole.tsx`)

### New Components
- [x] T016 [S0403] Create AnimatedSpinner component (`src/components/ui/AnimatedSpinner.tsx`)
- [x] T017 [S0403] Integrate AnimatedSpinner into LoadingSkeleton (`src/components/ui/LoadingSkeleton.tsx`)
- [x] T018 [S0403] Replace static spinner in StreamingConsole with AnimatedSpinner

---

## Testing (4 tasks)

Verification and quality assurance.

- [x] T019 [S0403] [P] Write unit tests for animations.ts exports (`src/lib/__tests__/animations.test.ts`)
- [x] T020 [S0403] [P] Write unit tests for AnimatedSpinner component (`src/components/ui/__tests__/AnimatedSpinner.test.tsx`)
- [x] T021 [S0403] Run quality gates: typecheck, lint, format:check, test, build
- [x] T022 [S0403] Manual testing of all animated components per testing strategy

---

## Completion Checklist

Before marking session complete:

- [x] All tasks marked `[x]`
- [x] All tests passing
- [x] All files ASCII-encoded (0-127)
- [x] Unix LF line endings
- [x] implementation-notes.md updated
- [x] Ready for `/validate`

---

## Notes

### Parallelization
Tasks marked `[P]` can be worked on simultaneously:
- T005, T006: Animation variants are independent
- T019, T020: Unit tests can be written in parallel

### Task Timing
Target ~20-25 minutes per task.

### Dependencies
- T004 must complete before T005-T007 (establishes file structure)
- T004-T007 must complete before T008-T018 (variants used by components)
- T016 must complete before T017-T018 (AnimatedSpinner creation)
- T019-T020 should run after their respective implementations

### Animation Timing Reference
| Animation Type | Duration | Easing |
|---------------|----------|--------|
| Micro-interactions (hover) | 150ms | ease-out |
| Button press | 100ms | ease-in-out |
| Modal entrance | 200ms | ease-out |
| Modal exit | 150ms | ease-in |
| Sidebar slide | 250ms | ease-out |
| Stagger delay | 50ms | - |

### Key Technical Notes
- AnimatePresence must wrap conditionally rendered components BEFORE portal for AuthModal
- Use only `transform` and `opacity` for GPU-accelerated 60fps animations
- Components wrapped in AnimatePresence need unique keys
- Framer Motion 12+ required for React 19 compatibility

---

## Next Steps

Run `/implement` to begin AI-led implementation.
