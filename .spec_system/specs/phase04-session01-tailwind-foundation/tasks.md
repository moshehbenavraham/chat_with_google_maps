# Task Checklist

**Session ID**: `phase04-session01-tailwind-foundation`
**Total Tasks**: 24
**Estimated Duration**: 8-10 hours
**Created**: 2025-12-21

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0401]` = Session reference (Phase 04, Session 01)
- `TNNN` = Task ID

---

## Progress Summary

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Setup | 4 | 4 | 0 |
| Foundation | 6 | 6 | 0 |
| Implementation | 10 | 10 | 0 |
| Testing | 4 | 4 | 0 |
| **Total** | **24** | **24** | **0** |

---

## Setup (4 tasks)

Initial configuration and environment preparation.

- [x] T001 [S0401] Verify prerequisites: Node 18+, Vite, dev tooling operational
- [x] T002 [S0401] Install Tailwind CSS 4 dependencies (`package.json`)
- [x] T003 [S0401] Create PostCSS configuration (`postcss.config.js`)
- [x] T004 [S0401] Verify npm install completes without errors

---

## Foundation (6 tasks)

Tailwind configuration and theme setup.

- [x] T005 [S0401] Create Tailwind config with content paths (`tailwind.config.ts`)
- [x] T006 [S0401] Map neutral color tokens to Tailwind theme (`tailwind.config.ts`)
- [x] T007 [S0401] Map green color tokens to Tailwind theme (`tailwind.config.ts`)
- [x] T008 [S0401] Map blue and red color tokens to Tailwind theme (`tailwind.config.ts`)
- [x] T009 [S0401] Configure breakpoints and dark mode in theme (`tailwind.config.ts`)
- [x] T010 [S0401] Add Tailwind directives to main CSS (`src/index.css`)

---

## Implementation (10 tasks)

Component migration to Tailwind utilities.

- [x] T011 [S0401] Migrate Avatar component base styles (`src/components/auth/Avatar.tsx`)
- [x] T012 [S0401] Migrate Avatar size variants to Tailwind (`src/components/auth/Avatar.tsx`)
- [x] T013 [S0401] Delete Avatar.css after migration (`src/components/auth/Avatar.css`)
- [x] T014 [S0401] Migrate ErrorScreen container and layout (`src/components/ErrorScreen.tsx`)
- [x] T015 [S0401] Migrate ErrorScreen typography and button (`src/components/ErrorScreen.tsx`)
- [x] T016 [S0401] Migrate Sidebar header section (`src/components/Sidebar.tsx`)
- [x] T017 [S0401] [P] Migrate action-button base styles in CSS (`src/index.css`)
- [x] T018 [S0401] [P] Migrate action-button state variants in CSS (`src/index.css`)
- [x] T019 [S0401] Migrate ControlTray container styles (`src/components/ControlTray.tsx`)
- [x] T020 [S0401] Migrate actions-nav and prompt-form styles (`src/components/ControlTray.tsx`)

---

## Testing (4 tasks)

Verification and quality assurance.

- [x] T021 [S0401] Run dev server and verify hot reload works
- [x] T022 [S0401] Run production build and verify output
- [x] T023 [S0401] Run quality gates: typecheck, lint, format, tests
- [x] T024 [S0401] Manual visual comparison of migrated components

---

## Completion Checklist

Before marking session complete:

- [x] All tasks marked `[x]`
- [x] All tests passing
- [x] All files ASCII-encoded
- [x] IMPLEMENTATION_SUMMARY.md updated
- [x] Ready for `/validate`

---

## Notes

### Token Mapping Strategy
Map CSS custom properties directly in Tailwind theme:
```typescript
colors: {
  neutral: {
    '00': 'var(--Neutral-00)',
    '5': 'var(--Neutral-5)',
    // ...
  }
}
```

This allows incremental migration - components can use either approach during transition.

### Component Migration Order
1. **Avatar** - Simplest component, isolated CSS file, good first target
2. **ErrorScreen** - Simple layout, few styles, inline styles to remove
3. **Sidebar header** - Small section within larger component
4. **ControlTray** - More complex, action buttons have state variants

### Parallelization
Tasks T017-T018 can be worked on in parallel as they modify independent sections of `index.css`.

### CSS Preservation
Keep all non-migrated CSS in `index.css`. Only remove styles after their corresponding component is fully migrated.

### Build Size Monitoring
Check bundle size before and after:
```bash
npm run build
# Check dist/ folder size
```
Target: < 10% increase from baseline.

---

## Dependencies

### Task Dependencies
- T005-T009 depend on T002-T004 (Tailwind must be installed)
- T011-T020 depend on T010 (Tailwind directives must be in CSS)
- T013 depends on T011-T012 (Avatar must be migrated before deleting CSS)
- T021-T024 can run after all implementation tasks

### File Dependencies
```
package.json -> postcss.config.js -> tailwind.config.ts -> src/index.css
                                                               |
                                   +---------------------------+
                                   |
                                   v
                          Component migrations
```

---

## Next Steps

Run `/implement` to begin AI-led implementation.
