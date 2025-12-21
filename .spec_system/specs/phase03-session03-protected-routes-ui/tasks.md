# Task Checklist

**Session ID**: `phase03-session03-protected-routes-ui`
**Total Tasks**: 25
**Estimated Duration**: 8-10 hours
**Created**: 2025-12-21

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0303]` = Session reference (Phase 03, Session 03)
- `TNNN` = Task ID

---

## Progress Summary

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Setup | 2 | 2 | 0 |
| Foundation | 6 | 6 | 0 |
| Implementation | 13 | 13 | 0 |
| Testing | 4 | 3 | 1 |
| **Total** | **25** | **24** | **1** |

---

## Setup (2 tasks)

Initial configuration and environment preparation.

- [x] T001 [S0303] Verify prerequisites met (PostgreSQL running, auth endpoints functional)
- [x] T002 [S0303] Review existing auth components and understand useAuth hook interface

---

## Foundation (6 tasks)

Core structures and base implementations.

- [x] T003 [S0303] [P] Create Avatar.tsx with AvatarProps interface and component skeleton (`src/components/auth/Avatar.tsx`)
- [x] T004 [S0303] [P] Create Avatar.css with base styles and size variants (`src/components/auth/Avatar.css`)
- [x] T005 [S0303] [P] Create UserMenu.tsx with UserMenuProps interface and component skeleton (`src/components/auth/UserMenu.tsx`)
- [x] T006 [S0303] [P] Create UserMenu.css with dropdown positioning and styles (`src/components/auth/UserMenu.css`)
- [x] T007 [S0303] [P] Create AuthModal.tsx with AuthModalProps interface and component skeleton (`src/components/auth/AuthModal.tsx`)
- [x] T008 [S0303] [P] Create AuthModal.css with modal overlay and container styles (`src/components/auth/AuthModal.css`)

---

## Implementation (13 tasks)

Main feature implementation.

### Avatar Component

- [x] T009 [S0303] Implement Avatar initials extraction from name or email (`src/components/auth/Avatar.tsx`)
- [x] T010 [S0303] Implement Avatar background color generation from email hash (`src/components/auth/Avatar.tsx`)
- [x] T011 [S0303] Implement Avatar image display with initials fallback (`src/components/auth/Avatar.tsx`)

### UserMenu Component

- [x] T012 [S0303] Implement UserMenu dropdown toggle state management (`src/components/auth/UserMenu.tsx`)
- [x] T013 [S0303] Implement UserMenu click-outside detection with cleanup (`src/components/auth/UserMenu.tsx`)
- [x] T014 [S0303] Implement UserMenu Escape key handler (`src/components/auth/UserMenu.tsx`)
- [x] T015 [S0303] Implement UserMenu dropdown content with user info and sign-out button (`src/components/auth/UserMenu.tsx`)

### AuthModal Component

- [x] T016 [S0303] Implement AuthModal React Portal rendering to document.body (`src/components/auth/AuthModal.tsx`)
- [x] T017 [S0303] Implement AuthModal backdrop click-to-close and Escape handler (`src/components/auth/AuthModal.tsx`)
- [x] T018 [S0303] Implement AuthModal form mode switching between signin and signup (`src/components/auth/AuthModal.tsx`)
- [x] T019 [S0303] Implement AuthModal body scroll lock when open (`src/components/auth/AuthModal.tsx`)

### Integration

- [x] T020 [S0303] Update auth/index.ts with Avatar, UserMenu, and AuthModal exports (`src/components/auth/index.ts`)
- [x] T021 [S0303] Integrate UserMenu into AppPage, replacing inline sign-out button (`src/pages/AppPage.tsx`)

---

## Testing (4 tasks)

Verification and quality assurance.

- [x] T022 [S0303] [P] Run TypeScript type checking and fix any errors (`npm run typecheck`)
- [x] T023 [S0303] [P] Run ESLint and Prettier, fix any violations (`npm run lint && npm run format`)
- [x] T024 [S0303] Run existing test suite and verify all tests pass (`npm run test`)
- [ ] T025 [S0303] Manual testing: dropdown interactions, modal flows, sign-out redirect

---

## Completion Checklist

Before marking session complete:

- [ ] All tasks marked `[x]`
- [ ] All tests passing
- [ ] All files ASCII-encoded
- [ ] implementation-notes.md updated
- [ ] Ready for `/validate`

---

## Notes

### Parallelization

Tasks marked `[P]` can be worked on simultaneously:
- **T003-T008**: All foundation tasks (component skeletons and CSS files) are independent
- **T022-T023**: TypeScript and linting checks can run in parallel

### Task Timing

Target ~20-25 minutes per task.

### Dependencies

1. **Foundation before Implementation**: Complete T003-T008 before T009-T021
2. **Avatar before UserMenu integration**: T009-T011 must complete before UserMenu uses Avatar
3. **Exports before Integration**: T020 must complete before T021
4. **All implementation before Testing**: T009-T021 must complete before T022-T025

### Key Implementation Details

| Component | Key Patterns |
|-----------|--------------|
| Avatar | Color from email hash, initials fallback, size variants (sm/md/lg) |
| UserMenu | useRef for dropdown, document event listeners, useAuth hook |
| AuthModal | createPortal, body overflow:hidden, onSuccess callback |

### Z-Index Strategy

```
Map: 1
UserMenu dropdown: 9000
AuthModal backdrop: 10000
AuthModal content: 10001
```

---

## Next Steps

Run `/implement` to begin AI-led implementation.
