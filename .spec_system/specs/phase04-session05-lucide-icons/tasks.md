# Task Checklist

**Session ID**: `phase04-session05-lucide-icons`
**Total Tasks**: 22
**Estimated Duration**: 2-3 hours
**Created**: 2025-12-21

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0405]` = Phase 04, Session 05 reference
- `TNNN` = Task ID

---

## Progress Summary

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Setup | 3 | 3 | 0 |
| Foundation | 3 | 3 | 0 |
| Implementation | 10 | 10 | 0 |
| CSS Cleanup | 3 | 3 | 0 |
| Testing | 6 | 6 | 0 |
| **Total** | **25** | **25** | **0** |

---

## Setup (3 tasks)

Initial configuration and environment preparation.

- [x] T001 [S0405] Install lucide-react package (`npm install lucide-react`)
- [x] T002 [S0405] Verify package installed correctly in package.json
- [x] T003 [S0405] Verify TypeScript types available for lucide-react

---

## Foundation (3 tasks)

Preparation and cleanup of font dependencies.

- [x] T004 [S0405] Remove Material Symbols font preload/link from `index.html` (lines 15-29)
- [x] T005 [S0405] Remove .icon font-family Material Symbols styling (`src/index.css:273-277`)
- [x] T006 [S0405] Document icon mapping reference for all icons being migrated

---

## Implementation (10 tasks)

Main component icon migrations.

### ControlTray.tsx Icons (5 tasks)

- [x] T007 [S0405] [P] Import Lucide icons in ControlTray.tsx (Play, Pause, Volume2, VolumeX, Mic, MicOff, Keyboard, KeyboardOff, Send, SlidersHorizontal)
- [x] T008 [S0405] [P] Replace play_arrow/pause icons with Play/Pause Lucide components (`src/components/ControlTray.tsx:180-182`)
- [x] T009 [S0405] [P] Replace volume_up/volume_off icons with Volume2/VolumeX Lucide components (`src/components/ControlTray.tsx:197-199`)
- [x] T010 [S0405] [P] Replace mic/mic_off icons with Mic/MicOff Lucide components (`src/components/ControlTray.tsx:210-214`)
- [x] T011 [S0405] Replace keyboard/send/tune icons with Keyboard/KeyboardOff/Send/SlidersHorizontal Lucide components (`src/components/ControlTray.tsx:224,247,258`)

### Toast.tsx Icons (2 tasks)

- [x] T012 [S0405] Import Lucide icons in Toast.tsx (CheckCircle2, AlertCircle, AlertTriangle, Info, X)
- [x] T013 [S0405] Replace all material-symbols-outlined spans with Lucide components (`src/components/ui/Toast.tsx:117-124,201-206`)

### LoadingSkeleton.tsx Icons (2 tasks)

- [x] T014 [S0405] Import Lucide Map icon in LoadingSkeleton.tsx
- [x] T015 [S0405] Replace both map icon instances with Lucide Map component (`src/components/ui/LoadingSkeleton.tsx:71,108`)

### AuthErrorBoundary.tsx Icons (1 task)

- [x] T016 [S0405] Import Lucide Lock icon and replace material-symbols span (`src/components/AuthErrorBoundary.tsx:149-151`)

---

## CSS Cleanup (3 tasks)

Remove Material Symbols CSS styling.

- [x] T017 [S0405] [P] Remove .material-symbols-outlined rule from `src/components/ui/loading-skeleton.css:164-167`
- [x] T018 [S0405] [P] Remove .toast-dismiss .material-symbols-outlined rule from `src/components/ui/toast.css:104-106`
- [x] T019 [S0405] Update any remaining icon sizing from font-size to Tailwind size-* utilities

---

## Testing (6 tasks)

Verification and quality assurance.

- [x] T020 [S0405] Run `npm run typecheck` - verify no TypeScript errors
- [x] T021 [S0405] Run `npm run lint` - verify no ESLint errors/warnings
- [x] T022 [S0405] Run `npm run build` - verify production build succeeds
- [x] T023 [S0405] Verify no Material Symbols references remain in codebase (grep verification)
- [x] T024 [S0405] Manual testing: verify all icons render correctly (ControlTray, Toast, LoadingSkeleton, AuthErrorBoundary)
- [x] T025 [S0405] Verify Network tab shows no Material Symbols font requests

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

### Icon Mapping Reference

| Current Icon | Lucide Equivalent | Location |
|--------------|-------------------|----------|
| `play_arrow` | `Play` | ControlTray.tsx |
| `pause` | `Pause` | ControlTray.tsx |
| `volume_up` | `Volume2` | ControlTray.tsx |
| `volume_off` | `VolumeX` | ControlTray.tsx |
| `mic` | `Mic` | ControlTray.tsx |
| `mic_off` | `MicOff` | ControlTray.tsx |
| `keyboard` | `Keyboard` | ControlTray.tsx |
| `keyboard_hide` | `KeyboardOff` | ControlTray.tsx |
| `send` | `Send` | ControlTray.tsx |
| `tune` | `SlidersHorizontal` | ControlTray.tsx |
| `check_circle` | `CheckCircle2` | Toast.tsx |
| `error` | `AlertCircle` | Toast.tsx |
| `warning` | `AlertTriangle` | Toast.tsx |
| `info` | `Info` | Toast.tsx |
| `close` | `X` | Toast.tsx |
| `map` | `Map` | LoadingSkeleton.tsx |
| `lock` | `Lock` | AuthErrorBoundary.tsx |

### Parallelization
Tasks marked `[P]` can be worked on simultaneously.

### Icon Sizing Convention
| Tailwind Class | Pixels | Usage |
|----------------|--------|-------|
| `size-4` | 16px | Small buttons, dismiss icons |
| `size-5` | 20px | Default buttons, menu items |
| `size-6` | 24px | Large buttons, primary actions |
| `size-8` | 32px | Hero icons, loading states |

### Dependencies
Complete tasks in order unless marked `[P]`.

---

## Implementation Complete

All tasks completed on 2025-12-21.
