# Session 03: Framer Motion Animations

**Session ID**: `phase04-session03-framer-motion`
**Status**: Not Started
**Estimated Tasks**: ~20-25
**Estimated Duration**: 2-4 hours

---

## Objective

Add smooth animations and micro-interactions throughout the app using Framer Motion, creating a polished and responsive user experience.

---

## Scope

### In Scope (MVP)
- Install Framer Motion package
- Create reusable animation variants in `src/lib/animations.ts`
- Animate key component transitions (chat messages, sidebar, modals)
- Add micro-interactions (button hover/press, input focus)
- Implement `AnimatePresence` for exit animations
- Add loading spinners and state transitions

### Out of Scope
- Complex gesture-based interactions
- 3D animations or physics-based motion
- Map marker animations (handled by map library)

---

## Prerequisites

- [ ] Session 01 completed (Tailwind CSS 4 configured)
- [ ] Session 02 completed (cn() utility available)

---

## Deliverables

1. Framer Motion package installed
2. `src/lib/animations.ts` with reusable animation variants
3. Animated component transitions throughout app
4. Micro-interactions on interactive elements
5. AnimatePresence wrappers for exit animations

---

## Implementation Details

### Dependencies to Install

```bash
npm install framer-motion
```

### Animation Variants

```typescript
// src/lib/animations.ts
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

export const slideInLeft = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -20, opacity: 0 }
}

export const slideInRight = {
  initial: { x: 20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 }
}

export const scaleIn = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 }
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
}
```

### Component Animation Mapping

| Component | Animation |
|-----------|-----------|
| Chat messages | Staggered fade-in from bottom |
| Sidebar | Slide in/out from right |
| PopUp (welcome) | Scale + fade with backdrop blur |
| ControlTray buttons | Hover scale, press feedback |
| ErrorScreen | Fade in with shake on error |
| Auth forms | Fade in with subtle slide |
| Loading states | Pulse or spin animation |

### Animation Best Practices

- Keep animations snappy (< 300ms for most transitions)
- Use `transform` and `opacity` only (GPU accelerated)
- Avoid animating layout properties (width, height, margin)
- Use `AnimatePresence` with `mode="wait"` for route transitions

---

## Success Criteria

- [ ] Framer Motion installed and configured
- [ ] Reusable animation variants created
- [ ] All major UI transitions animated
- [ ] Micro-interactions on buttons and inputs
- [ ] Exit animations working with AnimatePresence
- [ ] No jank or layout shift during animations
- [ ] Animations feel snappy (< 300ms)
- [ ] TypeScript strict mode passing
- [ ] ESLint passing with no warnings
