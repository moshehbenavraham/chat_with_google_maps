# Task Checklist

**Session ID**: `phase04-session04-shadcn-components`
**Total Tasks**: 26
**Estimated Duration**: 8-10 hours
**Created**: 2025-12-21

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0404]` = Session reference (Phase 04, Session 04)
- `TNNN` = Task ID

---

## Progress Summary

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Setup | 4 | 4 | 0 |
| Foundation | 9 | 9 | 0 |
| Implementation | 8 | 8 | 0 |
| Testing | 5 | 5 | 0 |
| **Total** | **26** | **26** | **0** |

---

## Setup (4 tasks)

Initial configuration and environment preparation.

- [x] T001 [S0404] Verify prerequisites met (Tailwind 4, cn() utility, Framer Motion installed)
- [x] T002 [S0404] Create components.json for shadcn/ui Vite configuration (`components.json`)
- [x] T003 [S0404] Install class-variance-authority dependency (`package.json`)
- [x] T004 [S0404] Add shadcn/ui CSS variables and base styles to index.css (`src/index.css`)

---

## Foundation (9 tasks)

Adding shadcn/ui base components to src/components/ui/.

- [x] T005 [S0404] [P] Add Button component with variants (`src/components/ui/button.tsx`)
- [x] T006 [S0404] [P] Add Dialog component for modal overlays (`src/components/ui/dialog.tsx`)
- [x] T007 [S0404] [P] Add Popover component for positioned content (`src/components/ui/popover.tsx`)
- [x] T008 [S0404] [P] Add ScrollArea component for custom scrollbars (`src/components/ui/scroll-area.tsx`)
- [x] T009 [S0404] [P] Add Sheet component for slide-over panels (`src/components/ui/sheet.tsx`)
- [x] T010 [S0404] [P] Add Tooltip component for hover hints (`src/components/ui/tooltip.tsx`)
- [x] T011 [S0404] [P] Add Avatar component with fallback initials (`src/components/ui/avatar.tsx`)
- [x] T012 [S0404] [P] Add DropdownMenu component for menus (`src/components/ui/dropdown-menu.tsx`)
- [x] T013 [S0404] Map existing CSS variables to shadcn/ui theme tokens (`src/index.css`)

---

## Implementation (8 tasks)

Migrating existing components to shadcn/ui equivalents.

- [x] T014 [S0404] Migrate PopUp component to use Dialog (`src/components/popup/PopUp.tsx`)
- [x] T015 [S0404] Migrate Sidebar component to use Sheet (`src/components/Sidebar.tsx`)
- [x] T016 [S0404] Migrate SourcesPopover to use shadcn Popover (`src/components/sources-popover/sources-popover.tsx`)
- [x] T017 [S0404] Migrate UserMenu to use DropdownMenu (`src/components/auth/UserMenu.tsx`)
- [x] T018 [S0404] Migrate Avatar to use shadcn Avatar internally (`src/components/auth/Avatar.tsx`)
- [x] T019 [S0404] Migrate ControlTray buttons to use Button component (`src/components/ControlTray.tsx`)
- [x] T020 [S0404] Delete legacy CSS files (PopUp.css, sources-popover.css, UserMenu.css)
- [x] T021 [S0404] Remove @headlessui/react dependency from package.json (`package.json`)

---

## Testing (5 tasks)

Verification and quality assurance.

- [x] T022 [S0404] Run TypeScript typecheck and fix any errors (npm run typecheck)
- [x] T023 [S0404] Run ESLint and fix any warnings (npm run lint)
- [x] T024 [S0404] Run test suite and verify all tests pass (npm run test)
- [x] T025 [S0404] Manual testing of all migrated components (Dialog, Sheet, Popover, DropdownMenu)
- [x] T026 [S0404] Validate ASCII encoding on all created/modified files

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
Tasks T005-T012 (Foundation components) can be worked on simultaneously as they are independent shadcn/ui component files with no cross-dependencies.

### Task Timing
Target ~20-25 minutes per task.

### Dependencies
- T001-T004 must complete before T005-T012
- T005-T012 must complete before T014-T021
- T014-T021 should be done sequentially (migrations may have subtle dependencies)
- T022-T026 depend on all implementation complete

### Component Migration Order
Recommended order for migrations:
1. Dialog (PopUp) - standalone modal
2. Sheet (Sidebar) - standalone panel
3. Popover (SourcesPopover) - depends on no others
4. Avatar - simple component
5. DropdownMenu (UserMenu) - may use Avatar
6. Button (ControlTray) - straightforward swap

### CSS Variable Mapping Reference
```
--background      -> var(--Neutral-00) or var(--Neutral-10)
--foreground      -> var(--text) or var(--Neutral-90)
--primary         -> var(--Blue-500)
--primary-foreground -> white
--destructive     -> var(--Red-500)
--border          -> var(--Neutral-20)
--ring            -> var(--Blue-500)
```

### Radix Dependencies
The shadcn CLI will auto-install these Radix packages:
- @radix-ui/react-dialog
- @radix-ui/react-popover
- @radix-ui/react-dropdown-menu
- @radix-ui/react-scroll-area
- @radix-ui/react-tooltip
- @radix-ui/react-avatar
- @radix-ui/react-slot

---

## Next Steps

Run `/implement` to begin AI-led implementation.
