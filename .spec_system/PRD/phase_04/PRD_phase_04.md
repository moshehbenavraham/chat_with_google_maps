# PRD Phase 04: Frontend Overhaul

**Status**: In Progress
**Sessions**: 6 (initial estimate)
**Estimated Duration**: 2-3 days

**Progress**: 3/6 sessions (50%)

---

## Overview

Modernize the frontend stack to achieve a polished, production-grade visual appearance with smooth animations, consistent design system, and accessible components. This phase replaces vanilla CSS with Tailwind CSS 4, introduces shadcn/ui for accessible components, adds Framer Motion for animations, migrates to Lucide icons, and implements a dark/light theme system.

---

## Progress Tracker

| Session | Name | Status | Est. Tasks | Validated |
|---------|------|--------|------------|-----------|
| 01 | Tailwind CSS 4 Foundation | Complete | 24 | 2025-12-21 |
| 02 | Utility Setup (clsx + tailwind-merge) | Complete | 20 | 2025-12-21 |
| 03 | Framer Motion Animations | Complete | 22 | 2025-12-21 |
| 04 | shadcn/ui Components | Not Started | ~25-30 | - |
| 05 | Lucide React Icons | Not Started | ~15-20 | - |
| 06 | Theme System | Not Started | ~15-20 | - |

---

## Completed Sessions

### Session 01: Tailwind CSS 4 Foundation
- **Completed**: 2025-12-21
- **Tasks**: 24/24
- **Key Deliverables**:
  - Installed Tailwind CSS 4 with PostCSS integration
  - Created tailwind.config.ts with design token mapping
  - Migrated 7 components to Tailwind utilities
  - All 188 tests passing, bundle size within limits

### Session 02: Utility Setup (clsx + tailwind-merge)
- **Completed**: 2025-12-21
- **Tasks**: 20/20
- **Key Deliverables**:
  - Created cn() utility function combining clsx + tailwind-merge
  - Migrated ControlTray and Sidebar from classnames to cn()
  - Removed classnames package dependency
  - Added 11 unit tests for cn() function
  - All 199 tests passing

### Session 03: Framer Motion Animations
- **Completed**: 2025-12-21
- **Tasks**: 22/22
- **Key Deliverables**:
  - Installed Framer Motion 12.23.26 for React 19 compatibility
  - Created animation variants library (src/lib/animations.ts)
  - Added entrance/exit animations to PopUp, Sidebar, ErrorScreen, AuthModal
  - Added button micro-interactions to ControlTray
  - Created AnimatedSpinner component
  - All 222 tests passing

---

## Upcoming Sessions

- Session 04: shadcn/ui Components

---

## Objectives

1. Replace vanilla CSS with Tailwind CSS 4 utility-first styling
2. Establish consistent className composition with `cn()` helper
3. Add smooth animations and micro-interactions using Framer Motion
4. Replace custom components with accessible shadcn/ui primitives (Radix-based)
5. Migrate icons from Material Symbols to tree-shakeable Lucide React
6. Implement dark/light theme toggle with system preference detection

---

## Prerequisites

- Phase 03 completed (Authentication with Better Auth)
- React 19 + TypeScript + Vite stack operational
- All dev tooling (TypeScript strict, ESLint, Prettier, Vitest, pre-commit hooks) active

---

## Technical Considerations

### Architecture

```
Frontend Stack After Phase 04
------------------------------
React 19 + TypeScript + Vite
├── Styling Layer
│   ├── Tailwind CSS 4 (utilities)
│   ├── CSS Variables (design tokens)
│   └── cn() helper (clsx + tailwind-merge)
├── Component Layer
│   ├── shadcn/ui (Radix primitives)
│   │   ├── Button, Dialog, Popover, Sheet
│   │   ├── ScrollArea, Tooltip, Avatar
│   │   └── DropdownMenu
│   └── Custom components (using shadcn base)
├── Animation Layer
│   ├── Framer Motion (transitions, gestures)
│   └── AnimatePresence (exit animations)
├── Icon Layer
│   └── Lucide React (tree-shakeable SVG icons)
└── Theme Layer
    ├── next-themes (provider)
    └── Tailwind dark: variants
```

### Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Tailwind CSS | ^4.0.0 | Utility-first styling |
| shadcn/ui | latest | Accessible Radix components |
| Framer Motion | ^12.x | Production animations |
| Lucide React | ^0.x | Tree-shakeable icons |
| next-themes | ^0.x | Theme management |
| clsx | ^2.x | Conditional classes |
| tailwind-merge | ^2.x | Class conflict resolution |

### Risks

- **Large migration scope**: Mitigate by migrating incrementally, component by component
- **Breaking existing styles**: Keep old CSS until component fully migrated
- **Bundle size increase**: Tree-shake unused components, lazy load where appropriate
- **Animation performance**: Use `transform` and `opacity` only, avoid layout animations
- **Accessibility regression**: Test with keyboard/screen reader after each shadcn migration

---

## Success Criteria

Phase complete when:
- [ ] All 6 sessions completed and validated
- [ ] All components use Tailwind utilities (no vanilla CSS)
- [ ] Consistent className composition via `cn()` helper
- [ ] Key UI transitions animated with Framer Motion
- [ ] Interactive components use shadcn/ui (Radix primitives)
- [ ] Icons from Lucide React (no external font dependencies)
- [ ] Dark/light theme toggle functional with persistence
- [ ] Lighthouse accessibility score >= 90
- [ ] No TypeScript errors
- [ ] All existing tests pass

---

## Dependencies

### Depends On
- Phase 03: Authentication (Better Auth) - Complete

### Enables
- Phase 05: Voice & AI Pipeline (future phase - polished UI ready for voice features)

---

## Current State vs Target State

| Aspect | Current | Target |
|--------|---------|--------|
| **Styling** | Vanilla CSS with custom tokens in `src/index.css` | Tailwind CSS 4 with design tokens |
| **Utilities** | Minimal | clsx + tailwind-merge via `cn()` helper |
| **Components** | Minimal use of `@headlessui/react` | shadcn/ui (Radix primitives + Tailwind) |
| **Icons** | Material Symbols via Google Fonts | Lucide React |
| **Animations** | None | Framer Motion 12 |
| **Theming** | Dark mode only | Dark/light mode toggle |

---

## Component Migration Checklist

| Component | Tailwind | Framer | shadcn | Lucide | Theme |
|-----------|:--------:|:------:|:------:|:------:|:-----:|
| `App.tsx` | [ ] | [ ] | - | - | [ ] |
| `StreamingConsole` | [ ] | [ ] | [ ] | [ ] | [ ] |
| `ControlTray` | [ ] | [ ] | [ ] | [ ] | [ ] |
| `Sidebar` | [ ] | [ ] | [ ] | [ ] | [ ] |
| `PopUp` | [ ] | [ ] | [ ] | [ ] | [ ] |
| `ErrorScreen` | [ ] | [ ] | - | [ ] | [ ] |
| `Map3D` | [ ] | [ ] | - | - | [ ] |
| `SourcesPopover` | [ ] | [ ] | [ ] | - | [ ] |
| Auth Components | [ ] | [ ] | [ ] | [ ] | [ ] |

---

## Dependencies Summary

**Add**:
```json
{
  "tailwindcss": "^4.0.0",
  "@tailwindcss/postcss": "^4.0.0",
  "postcss": "^8.x",
  "clsx": "^2.x",
  "tailwind-merge": "^2.x",
  "framer-motion": "^12.x",
  "lucide-react": "^0.x",
  "next-themes": "^0.x"
}
```

**Remove**:
```json
{
  "classnames": "remove after Session 2"
}
```

**shadcn/ui** (copy-paste, not npm): Components copied to `src/components/ui/`

---

## References

- [Tailwind CSS 4 Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/icons/)
- [next-themes](https://github.com/pacocoursey/next-themes)
