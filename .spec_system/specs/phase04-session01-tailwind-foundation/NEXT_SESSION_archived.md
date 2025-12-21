# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-21
**Project State**: Phase 04 - Frontend Overhaul
**Completed Sessions**: 16

---

## Recommended Next Session

**Session ID**: `phase04-session01-tailwind-foundation`
**Session Name**: Tailwind CSS 4 Foundation
**Estimated Duration**: 2-4 hours
**Estimated Tasks**: 20-25

---

## Why This Session Next?

### Prerequisites Met
- [x] Phase 03 completed (Authentication with Better Auth)
- [x] All dev tooling operational (TypeScript strict, ESLint, Prettier, Vitest, pre-commit hooks)
- [x] Existing CSS tokens documented in `src/index.css`
- [x] React 19 + TypeScript + Vite stack operational

### Dependencies
- **Builds on**: Phase 03 (Authentication) - complete auth stack ready
- **Enables**: Session 02 (Utility Setup), Session 03 (Framer Motion), Session 04 (shadcn/ui)

### Project Progression
This is the logical first step for Phase 04 (Frontend Overhaul). Tailwind CSS 4 establishes the styling foundation that all subsequent frontend sessions depend on:
- Session 02 needs Tailwind for the `cn()` helper with `tailwind-merge`
- Session 03 (Framer Motion) will animate Tailwind-styled components
- Session 04 (shadcn/ui) requires Tailwind CSS as a core dependency
- Sessions 05-06 will style components using Tailwind utilities

Starting with Tailwind CSS 4 Foundation ensures a clean, incremental migration from vanilla CSS to utility-first styling.

---

## Session Overview

### Objective
Replace vanilla CSS with Tailwind CSS 4 utility-first styling while preserving existing design tokens and visual appearance.

### Key Deliverables
1. Tailwind CSS 4 installed and configured with PostCSS
2. Tailwind config (`tailwind.config.ts`) with mapped design tokens from existing CSS
3. Updated `src/index.css` with Tailwind directives
4. Initial components migrated to Tailwind utilities
5. Build passing with no visual regressions

### Scope Summary
- **In Scope (MVP)**: Install Tailwind CSS 4, configure PostCSS, map existing CSS tokens, migrate leaf components, update index.css
- **Out of Scope**: shadcn/ui (Session 4), animations (Session 3), icon migration (Session 5), theme toggle (Session 6)

---

## Technical Considerations

### Technologies/Patterns
- Tailwind CSS 4 (latest major version with CSS-first configuration)
- @tailwindcss/postcss for build processing
- Design token mapping from existing `--Neutral-*`, `--Blue-*` CSS variables
- `darkMode: 'class'` for future theme support

### Potential Challenges
- **Token mapping complexity**: Existing CSS tokens must be carefully mapped to Tailwind theme
- **Incremental migration**: Must preserve visual appearance while migrating component by component
- **Build configuration**: PostCSS setup with Vite requires correct plugin ordering
- **Bundle size**: Monitor build size to ensure Tailwind tree-shaking works correctly

---

## Alternative Sessions

If this session is blocked:
1. **Session 02 (Utility Setup)** - Could install clsx + tailwind-merge first, but cn() helper is most useful with Tailwind
2. **Session 05 (Lucide Icons)** - Icon migration is independent but less impactful as a starting point

**Note**: Session 01 has no blockers. All prerequisites are met and this is the recommended starting point.

---

## Next Steps

Run `/sessionspec` to generate the formal specification.
