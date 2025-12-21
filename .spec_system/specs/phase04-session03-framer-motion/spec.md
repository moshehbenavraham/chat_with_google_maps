# Session Specification

**Session ID**: `phase04-session03-framer-motion`
**Phase**: 04 - Frontend Overhaul
**Status**: Not Started
**Created**: 2025-12-21

---

## 1. Session Overview

This session adds smooth animations and micro-interactions throughout the application using Framer Motion 12, transforming the existing static UI into a polished, responsive experience. Animations provide essential feedback to users, making the interface feel more alive and professional.

The implementation focuses on GPU-accelerated animations using only `transform` and `opacity` properties to ensure 60fps performance across all devices. By establishing a library of reusable animation variants in `src/lib/animations.ts`, future components can leverage consistent motion patterns without code duplication.

This session is critical infrastructure for Phase 04, as subsequent sessions (shadcn/ui components, theme system) will integrate with these animation patterns. The animation variants created here will be used when migrating to shadcn/ui Dialog, Sheet, and other animated primitives.

---

## 2. Objectives

1. Install and configure Framer Motion 12 with React 19 compatibility verified
2. Create reusable animation variants library (`src/lib/animations.ts`) with standardized patterns
3. Add entrance/exit animations to key UI components (PopUp, Sidebar, ErrorScreen, AuthModal)
4. Implement micro-interactions on interactive elements (buttons, form inputs)
5. Add AnimatePresence wrappers for components that mount/unmount dynamically
6. Create animated loading states to replace static spinners

---

## 3. Prerequisites

### Required Sessions
- [x] `phase04-session01-tailwind-foundation` - Tailwind CSS 4 configured for styling
- [x] `phase04-session02-utility-setup` - cn() utility for className composition

### Required Tools/Knowledge
- Framer Motion API (motion components, variants, AnimatePresence)
- React 19 concurrent rendering considerations
- CSS transform and opacity properties (GPU-accelerated)

### Environment Requirements
- Node.js 20+ (already configured)
- React 19.2.0 (already installed)
- Tailwind CSS 4 (already configured)

---

## 4. Scope

### In Scope (MVP)
- Install `framer-motion` package
- Create `src/lib/animations.ts` with core variants (fadeIn, slideIn, scaleIn, stagger)
- Animate PopUp component (welcome modal) - scale + fade entrance
- Animate Sidebar component - slide in/out from right
- Animate ErrorScreen component - fade in with subtle shake
- Animate AuthModal component - scale + fade with backdrop
- Add hover/press micro-interactions to ControlTray buttons
- Add AnimatePresence for exit animations on modals/overlays
- Create animated spinner component for loading states
- Add staggered animations for chat message list (StreamingConsole)

### Out of Scope (Deferred)
- Complex gesture-based interactions (drag, pan, pinch) - *Reason: Not needed for MVP*
- 3D animations or physics-based motion - *Reason: Performance concerns on mobile*
- Map marker animations - *Reason: Handled by Google Maps library*
- Route transition animations - *Reason: Requires react-router integration, future session*
- Scroll-triggered animations - *Reason: Not needed for current UI patterns*

---

## 5. Technical Approach

### Architecture

```
src/
  lib/
    animations.ts          # Reusable animation variants
  components/
    popup/
      PopUp.tsx            # Add motion wrapper
    Sidebar.tsx            # Add slide animation
    ErrorScreen.tsx        # Add fade + shake animation
    ControlTray.tsx        # Add button micro-interactions
    streaming-console/
      StreamingConsole.tsx # Add staggered message animations
    auth/
      AuthModal.tsx        # Add scale + fade animation
    ui/
      LoadingSkeleton.tsx  # Add animated spinner
      AnimatedSpinner.tsx  # New animated spinner component
```

### Design Patterns
- **Variant Pattern**: Centralized animation definitions in `animations.ts` for consistency
- **Composition**: Use `motion` wrapper components, not direct style manipulation
- **Exit Animation**: AnimatePresence wraps conditionally rendered components
- **Stagger Pattern**: Container with `staggerChildren` for list animations

### Technology Stack
- Framer Motion 12.x (`framer-motion`)
- React 19.2.0 (existing)
- TypeScript 5.8.x (existing)

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `src/lib/animations.ts` | Reusable animation variants | ~80 |
| `src/components/ui/AnimatedSpinner.tsx` | Animated loading spinner | ~40 |

### Files to Modify
| File | Changes | Est. Lines Changed |
|------|---------|------------|
| `src/components/popup/PopUp.tsx` | Add motion wrapper, scale+fade animation | ~15 |
| `src/components/Sidebar.tsx` | Add slide-in/out animation | ~20 |
| `src/components/ErrorScreen.tsx` | Add fade+shake animation | ~15 |
| `src/components/ControlTray.tsx` | Add button hover/press animations | ~30 |
| `src/components/streaming-console/StreamingConsole.tsx` | Add staggered message animations | ~25 |
| `src/components/auth/AuthModal.tsx` | Add AnimatePresence, scale+fade | ~25 |
| `src/components/ui/LoadingSkeleton.tsx` | Add animated spinner option | ~15 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] Framer Motion 12 installed without peer dependency warnings
- [ ] Animation variants exported from `src/lib/animations.ts`
- [ ] PopUp modal animates in with scale+fade effect
- [ ] PopUp modal animates out when closed
- [ ] Sidebar slides in from right when opened
- [ ] Sidebar slides out to right when closed
- [ ] ErrorScreen fades in when error occurs
- [ ] AuthModal scales+fades in with backdrop animation
- [ ] AuthModal animates out on close
- [ ] ControlTray buttons have hover scale effect
- [ ] ControlTray buttons have press/active effect
- [ ] Chat messages appear with staggered fade-in
- [ ] Loading spinner animates smoothly

### Testing Requirements
- [ ] Manual testing of all animated components
- [ ] Verify animations work on mobile viewport
- [ ] Verify no layout shift during animations
- [ ] Test exit animations with AnimatePresence

### Quality Gates
- [ ] All files ASCII-encoded (0-127)
- [ ] Unix LF line endings
- [ ] TypeScript strict mode passing (`npm run typecheck`)
- [ ] ESLint passing with no warnings (`npm run lint`)
- [ ] Prettier formatting applied (`npm run format:check`)
- [ ] All existing tests pass (`npm run test`)
- [ ] Build succeeds (`npm run build`)

---

## 8. Implementation Notes

### Key Considerations
- **React 19 Compatibility**: Framer Motion 12 is required for React 19 support. Earlier versions may have hydration issues.
- **Bundle Size**: Framer Motion adds ~30KB gzipped. This is acceptable for the animation capabilities provided.
- **Performance**: Only animate `transform` and `opacity` properties. These are GPU-accelerated and don't trigger layout recalculation.
- **Reduced Motion**: Consider `prefers-reduced-motion` media query for accessibility. Framer Motion respects this by default.

### Potential Challenges
- **AnimatePresence Keys**: Components wrapped in AnimatePresence need unique keys for proper exit animations
- **Portal Rendering**: AuthModal uses `createPortal`. Ensure AnimatePresence wraps the component before portal, not inside portal content
- **Conditional Rendering**: Components that conditionally render must be direct children of AnimatePresence
- **React Strict Mode**: May cause double-invocation of animations in development; this is normal

### Animation Timing Guidelines
| Animation Type | Duration | Easing |
|---------------|----------|--------|
| Micro-interactions (hover) | 150ms | ease-out |
| Button press | 100ms | ease-in-out |
| Modal entrance | 200ms | ease-out |
| Modal exit | 150ms | ease-in |
| Sidebar slide | 250ms | ease-out |
| Stagger delay | 50ms | - |

### ASCII Reminder
All output files must use ASCII-only characters (0-127). Avoid unicode quotes, em-dashes, or special symbols in comments and strings.

---

## 9. Testing Strategy

### Unit Tests
- Animation variants export correctly from `animations.ts`
- AnimatedSpinner component renders without errors

### Integration Tests
- Components with animations render correctly
- No console errors during animation lifecycle

### Manual Testing
- [ ] Open PopUp modal - verify scale+fade entrance
- [ ] Close PopUp modal - verify fade out
- [ ] Open Sidebar - verify slide from right
- [ ] Close Sidebar - verify slide to right
- [ ] Trigger error - verify ErrorScreen fade in
- [ ] Open AuthModal - verify scale+fade with backdrop
- [ ] Close AuthModal - verify exit animation
- [ ] Hover ControlTray buttons - verify scale up
- [ ] Press ControlTray buttons - verify press feedback
- [ ] Send chat message - verify staggered appearance
- [ ] View loading state - verify spinner animation
- [ ] Test on mobile viewport - verify performance

### Edge Cases
- Rapid open/close of modals (animation interruption)
- Sidebar open while resizing viewport
- Error appearing during other animations
- Multiple chat messages arriving rapidly (stagger queue)

---

## 10. Dependencies

### External Libraries
- `framer-motion`: ^12.x (to be installed)

### Other Sessions
- **Depends on**: `phase04-session01-tailwind-foundation`, `phase04-session02-utility-setup`
- **Depended by**: `phase04-session04-shadcn-components` (will use animation patterns with shadcn primitives)

---

## Animation Variants Reference

```typescript
// src/lib/animations.ts - Preview of implementation

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
}

export const slideInRight = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
  transition: { duration: 0.25, ease: 'easeOut' }
}

export const scaleIn = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
  transition: { duration: 0.2 }
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
}

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 }
}

export const buttonTap = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { duration: 0.15 }
}
```

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
