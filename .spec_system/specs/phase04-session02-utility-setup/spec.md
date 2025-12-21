# Session Specification

**Session ID**: `phase04-session02-utility-setup`
**Phase**: 04 - Frontend Overhaul
**Status**: Not Started
**Created**: 2025-12-21

---

## 1. Session Overview

This session establishes the foundational className composition utility that powers the entire shadcn/ui component ecosystem. By combining `clsx` for conditional class construction with `tailwind-merge` for intelligent Tailwind class conflict resolution, we create a single `cn()` helper that becomes the standard pattern for all component styling.

The `cn()` utility is critical infrastructure for Phase 04. Every shadcn/ui component uses this pattern, and having it in place before Session 03 (Framer Motion) and Session 04 (shadcn Components) ensures consistent styling patterns across the codebase. This is a small, focused session with high leverage - approximately 1-2 hours of work that benefits every component going forward.

Currently, the codebase uses the `classnames` package in two components (`ControlTray.tsx` and `Sidebar.tsx`). This session migrates those usages to the new `cn()` helper and removes the legacy dependency.

---

## 2. Objectives

1. Install `clsx` and `tailwind-merge` packages as production dependencies
2. Create `cn()` utility function in `src/lib/utils.ts` (extending existing file)
3. Migrate all `classnames` usage to the new `cn()` helper
4. Remove the `classnames` package dependency

---

## 3. Prerequisites

### Required Sessions
- [x] `phase04-session01-tailwind-foundation` - Tailwind CSS 4 configured and working

### Required Tools/Knowledge
- npm/pnpm for package management
- Understanding of TypeScript module exports
- Familiarity with Tailwind CSS class patterns

### Environment Requirements
- Node.js 18+ installed
- Project dependencies installed (`npm install`)
- Development server can start (`npm run dev`)

---

## 4. Scope

### In Scope (MVP)
- Install `clsx` and `tailwind-merge` packages
- Add `cn()` function to existing `src/lib/utils.ts`
- Add unit tests for `cn()` function
- Migrate `ControlTray.tsx` from `classnames` to `cn()`
- Migrate `Sidebar.tsx` from `classnames` to `cn()`
- Remove `classnames` from package.json dependencies
- Verify all quality gates pass (typecheck, lint, format, test)

### Out of Scope (Deferred)
- Migrating other components to use `cn()` - *Reason: Not currently using classnames, can adopt cn() organically*
- Visual component changes - *Reason: Separate session scope*
- Creating new components - *Reason: Separate session scope*

---

## 5. Technical Approach

### Architecture

The `cn()` function combines two utilities in a specific order:

```
Input classes --> clsx (conditionals) --> tailwind-merge (conflict resolution) --> Output string
```

1. **clsx** handles conditional class logic: arrays, objects, falsy values
2. **tailwind-merge** intelligently merges Tailwind classes, resolving conflicts

Example conflict resolution:
```typescript
cn('px-4 py-2', 'px-8')  // Returns 'py-2 px-8' (px-8 wins)
cn('text-red-500', 'text-blue-500')  // Returns 'text-blue-500' (last wins)
```

### Design Patterns
- **Utility Function Pattern**: Single-purpose, composable function
- **Re-export Pattern**: Function exported from centralized utils module

### Technology Stack
- `clsx` ^2.x - Conditional className construction
- `tailwind-merge` ^2.x - Tailwind class conflict resolution
- TypeScript - Type-safe implementation with `ClassValue` type

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| (none - modifying existing) | | |

### Files to Modify
| File | Changes | Est. Lines Changed |
|------|---------|-------------------|
| `src/lib/utils.ts` | Add cn() function and imports | ~10 |
| `src/lib/utils.test.ts` | Add unit tests for cn() | ~30 |
| `src/components/ControlTray.tsx` | Replace classnames import with cn() | ~5 |
| `src/components/Sidebar.tsx` | Replace classnames import with cn() | ~5 |
| `package.json` | Remove classnames, add clsx + tailwind-merge | ~3 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] `cn()` function correctly merges class strings
- [ ] `cn()` resolves Tailwind class conflicts (e.g., `cn('px-4', 'px-8')` returns `'px-8'`)
- [ ] `cn()` handles conditional classes (e.g., `cn('base', isActive && 'active')`)
- [ ] `cn()` handles array and object syntax from clsx
- [ ] Import path `@/lib/utils` works in all components

### Testing Requirements
- [ ] Unit tests for cn() basic merging
- [ ] Unit tests for cn() conflict resolution
- [ ] Unit tests for cn() conditional handling
- [ ] All existing tests pass
- [ ] Manual testing: ControlTray renders correctly
- [ ] Manual testing: Sidebar renders correctly

### Quality Gates
- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run lint` passes with zero warnings
- [ ] `npm run format:check` passes
- [ ] `npm run test` passes with zero failures
- [ ] `npm run build` completes successfully
- [ ] No `classnames` import statements remain in codebase

---

## 8. Implementation Notes

### Key Considerations
- **Existing utils.ts**: The file already exists with audio utilities. Add cn() function alongside existing exports, do not replace the file.
- **Path alias already configured**: `@/*` is set up in both `tsconfig.json` and `vite.config.ts`
- **Import naming**: ControlTray uses `cn`, Sidebar uses `c` - standardize to `cn` from `@/lib/utils`

### Potential Challenges
- **Classnames API compatibility**: clsx has nearly identical API to classnames, migration should be straightforward
- **Ensuring no visual regressions**: Verify components render identically after migration

### ASCII Reminder
All output files must use ASCII-only characters (0-127).

---

## 9. Testing Strategy

### Unit Tests
Add to `src/lib/utils.test.ts`:
- Test basic string concatenation: `cn('a', 'b')` returns `'a b'`
- Test conditional classes: `cn('a', false && 'b', 'c')` returns `'a c'`
- Test Tailwind conflict resolution: `cn('px-4', 'px-8')` returns `'px-8'`
- Test object syntax: `cn({ 'active': true, 'disabled': false })` returns `'active'`
- Test array syntax: `cn(['a', 'b'])` returns `'a b'`
- Test mixed inputs: `cn('base', ['arr'], { obj: true })` works correctly

### Integration Tests
- Not required for this session (utility function is unit-testable)

### Manual Testing
1. Start dev server: `npm run dev`
2. Navigate to app
3. Verify ControlTray buttons render correctly
4. Open Sidebar, verify all elements render correctly
5. Interact with components to ensure dynamic classes work

### Edge Cases
- Empty inputs: `cn()` returns `''`
- Undefined/null values: `cn(undefined, 'a', null)` returns `'a'`
- Deeply nested arrays: Should flatten correctly

---

## 10. Dependencies

### External Libraries
- `clsx`: ^2.1.1 (or latest 2.x)
- `tailwind-merge`: ^2.6.0 (or latest 2.x)

### Packages to Remove
- `classnames`: ^2.5.1

### Other Sessions
- **Depends on**: `phase04-session01-tailwind-foundation` (Tailwind configured)
- **Depended by**:
  - `phase04-session03-framer-motion` (uses cn() for animated components)
  - `phase04-session04-shadcn-components` (all shadcn components use cn())

---

## 11. Current Codebase State

### Existing classnames Usage

**ControlTray.tsx** (line 21):
```typescript
import cn from 'classnames';
```

**Sidebar.tsx** (line 7):
```typescript
import c from 'classnames';
```

### Existing utils.ts Structure
The file contains:
- `audioContext()` - Audio context management
- `base64ToArrayBuffer()` - Base64 conversion utility

The `cn()` function will be added as an additional export.

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
