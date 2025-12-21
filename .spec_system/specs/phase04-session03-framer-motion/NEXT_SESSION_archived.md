# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-21
**Project State**: Phase 04 - Frontend Overhaul
**Completed Sessions**: 18

---

## Recommended Next Session

**Session ID**: `phase04-session03-framer-motion`
**Session Name**: Framer Motion Animations
**Estimated Duration**: 2-4 hours
**Estimated Tasks**: 20-25

---

## Why This Session Next?

### Prerequisites Met
- [x] Session 01 completed (Tailwind CSS 4 configured)
- [x] Session 02 completed (cn() utility available)

### Dependencies
- **Builds on**: phase04-session02-utility-setup (cn() helper for className composition)
- **Enables**: phase04-session04-shadcn-components (animation integration with UI primitives)

### Project Progression

Session 03 is the logical next step because:

1. **Critical Path**: It's on the critical path to Session 04 (shadcn/ui components), which depends on Framer Motion being available for animated transitions
2. **Foundation Complete**: Tailwind and the cn() utility are now in place, providing the styling foundation that animations will complement
3. **Natural Build Order**: Animations should be established before component library migration so shadcn/ui components can integrate smoothly with animation patterns
4. **Progressive Enhancement**: Adding animations at this stage enhances the existing UI without requiring component rewrites

---

## Session Overview

### Objective
Add smooth animations and micro-interactions throughout the app using Framer Motion, creating a polished and responsive user experience.

### Key Deliverables
1. Framer Motion package installed and configured
2. `src/lib/animations.ts` with reusable animation variants (fadeIn, slideIn, scaleIn, stagger)
3. Animated component transitions (chat messages, sidebar, modals)
4. Micro-interactions on interactive elements (button hover/press, input focus)
5. AnimatePresence wrappers for exit animations

### Scope Summary
- **In Scope (MVP)**: Core animation variants, component transitions, micro-interactions, AnimatePresence, loading states
- **Out of Scope**: Complex gestures, 3D animations, physics-based motion, map marker animations

---

## Technical Considerations

### Technologies/Patterns
- Framer Motion 12 (`framer-motion`)
- React 19 compatible
- GPU-accelerated animations (transform, opacity only)
- Reusable variant patterns

### Potential Challenges
- **Performance**: Ensure animations don't cause jank or layout shift - stick to transform/opacity
- **Bundle Size**: Framer Motion adds ~30KB - acceptable for the animation capabilities
- **React 19 Compatibility**: Verify Framer Motion 12 works correctly with React 19
- **Exit Animations**: AnimatePresence requires unique keys and proper component structure

---

## Alternative Sessions

If this session is blocked:
1. **phase04-session05-lucide-icons** - Can proceed independently (prerequisites: 01, 02 - both met). Lower priority as it doesn't block Session 04.

---

## Next Steps

Run `/sessionspec` to generate the formal specification.
