# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-21
**Project State**: Phase 04 - Frontend Overhaul
**Completed Sessions**: 17

---

## Recommended Next Session

**Session ID**: `phase04-session02-utility-setup`
**Session Name**: Utility Setup (clsx + tailwind-merge)
**Estimated Duration**: 1-2 hours
**Estimated Tasks**: 10-15

---

## Why This Session Next?

### Prerequisites Met
- [x] Session 01 completed (Tailwind CSS 4 configured)
- [x] Tailwind utilities working in components

### Dependencies
- **Builds on**: phase04-session01-tailwind-foundation
- **Enables**: phase04-session03-framer-motion, phase04-session04-shadcn-components

### Project Progression

Session 02 is the natural next step after establishing Tailwind CSS 4. The `cn()` utility helper is a **foundational pattern** that:

1. **Unlocks shadcn/ui adoption** - Every shadcn component uses `cn()` for className composition
2. **Enables clean conditional styling** - Replaces verbose ternary/classnames patterns
3. **Prevents Tailwind class conflicts** - tailwind-merge intelligently resolves conflicting utilities
4. **Small scope, high leverage** - 1-2 hours of work that benefits every component going forward

This is a focused, low-risk session that establishes infrastructure for all subsequent frontend work.

---

## Session Overview

### Objective
Create consistent className composition pattern using `cn()` helper that combines clsx and tailwind-merge for conflict-free class merging.

### Key Deliverables
1. `clsx` and `tailwind-merge` packages installed
2. `src/lib/utils.ts` with `cn()` helper function
3. All className composition using `cn()` helper
4. Legacy `classnames` package removed (if present)

### Scope Summary
- **In Scope (MVP)**: Install dependencies, create cn() helper, update components to use it
- **Out of Scope**: Component visual changes, new component creation, animation or theme changes

---

## Technical Considerations

### Technologies/Patterns
- **clsx** - Lightweight utility for constructing className strings conditionally
- **tailwind-merge** - Merge Tailwind CSS classes without style conflicts
- **Path alias** - Uses `@/lib/utils` for clean imports (verify tsconfig paths)

### Potential Challenges
- Ensuring path alias `@/` is configured in tsconfig.json and vite.config.ts
- Finding and replacing any existing `classnames` usage in the codebase
- Updating existing components without introducing visual regressions

---

## Alternative Sessions

If this session is blocked:
1. **phase04-session05-lucide-icons** - Icon migration has no dependencies on cn() and can be done in parallel if needed
2. **phase04-session06-theme-system** - Theme provider setup is independent of utility helper, though cn() is preferred

---

## Next Steps

Run `/sessionspec` to generate the formal specification.
