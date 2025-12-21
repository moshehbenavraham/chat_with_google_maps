# Task Checklist

**Session ID**: `phase04-session06-theme-system`
**Total Tasks**: 22
**Estimated Duration**: 7-9 hours
**Created**: 2025-12-22

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0406]` = Session reference (Phase 04, Session 06)
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

- [x] T001 [S0406] Verify prerequisites: Tailwind darkMode, cn(), shadcn DropdownMenu, Lucide icons
- [x] T002 [S0406] Install next-themes package (`npm install next-themes`)
- [x] T003 [S0406] Create providers directory structure (`src/providers/`)

---

## Foundation (5 tasks)

Core structures and base implementations.

- [x] T004 [S0406] Create ThemeProvider wrapper component (`src/providers/theme-provider.tsx`)
- [x] T005 [S0406] Configure ThemeProvider with attribute, storageKey, and disableTransitionOnChange
- [x] T006 [S0406] Create providers barrel export file (`src/providers/index.ts`)
- [x] T007 [S0406] [P] Create ThemeToggle component skeleton (`src/components/theme-toggle.tsx`)
- [x] T008 [S0406] [P] Add useTheme hook import and theme state handling to ThemeToggle

---

## Implementation (10 tasks)

Main feature implementation.

- [x] T009 [S0406] Implement ThemeToggle dropdown UI with Sun, Moon, Monitor icons (`src/components/theme-toggle.tsx`)
- [x] T010 [S0406] Add active state indicator for current theme selection
- [x] T011 [S0406] Integrate ThemeProvider into main.tsx wrapping AuthProvider (`src/main.tsx`)
- [x] T012 [S0406] Add ThemeToggle to UserMenu dropdown (`src/components/auth/UserMenu.tsx`)
- [x] T013 [S0406] Add separator before theme toggle in UserMenu
- [x] T014 [S0406] Define light mode CSS custom properties for Neutral palette (`src/index.css`)
- [x] T015 [S0406] Define light mode CSS custom properties for color palette (Blue, Red, Green) (`src/index.css`)
- [x] T016 [S0406] Define light mode CSS custom properties for shadcn tokens (`src/index.css`)
- [x] T017 [S0406] [P] Define light mode overrides for gray scale and background (`src/index.css`)
- [x] T018 [S0406] [P] Define light mode overrides for text, borders, and scrollbars (`src/index.css`)

---

## Testing (4 tasks)

Verification and quality assurance.

- [x] T019 [S0406] Run TypeScript type-check and fix any type errors
- [x] T020 [S0406] Run ESLint and Prettier, fix any issues
- [x] T021 [S0406] Manual testing: Toggle themes, verify persistence, test system preference
- [x] T022 [S0406] Validate ASCII encoding on all created/modified files

---

## Completion Checklist

Before marking session complete:

- [x] All tasks marked `[x]`
- [x] All linting passing
- [x] All files ASCII-encoded
- [x] implementation-notes.md updated
- [x] Ready for `/validate`

---

## Notes

### Parallelization
Tasks T007/T008 can run in parallel (component skeleton vs hook logic).
Tasks T017/T018 can run in parallel (independent CSS variable groups).

### Task Timing
Target ~20-25 minutes per task.

### Dependencies
- T004-T006 must complete before T011 (ThemeProvider before integration)
- T007-T010 must complete before T012 (ThemeToggle before UserMenu integration)
- T014-T018 are CSS-only and can be done after T011 (once provider is in place)

### Key Files
| File | Action | Purpose |
|------|--------|---------|
| `src/providers/theme-provider.tsx` | Create | NextThemesProvider wrapper |
| `src/providers/index.ts` | Create | Barrel export |
| `src/components/theme-toggle.tsx` | Create | Theme toggle dropdown |
| `src/main.tsx` | Modify | Add ThemeProvider |
| `src/components/auth/UserMenu.tsx` | Modify | Add ThemeToggle |
| `src/index.css` | Modify | Add .light class variables |

### Light Mode Color Strategy
The app currently uses dark mode defaults. Light mode will:
1. Invert the Neutral palette (00 becomes white, 90 becomes dark)
2. Adjust shadcn tokens to use light-appropriate values
3. Keep accent colors (Blue, Red, Green) similar but adjust for light backgrounds

---

## Next Steps

Run `/validate` to verify session completeness.
