# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-22
**Project State**: Phase 04 - Frontend Overhaul
**Completed Sessions**: 21

---

## Recommended Next Session

**Session ID**: `phase04-session06-theme-system`
**Session Name**: Theme System
**Estimated Duration**: 2-3 hours
**Estimated Tasks**: 15-20

---

## Why This Session Next?

### Prerequisites Met
- [x] Session 01 completed (Tailwind CSS 4 configured)
- [x] Session 02 completed (cn() utility available)
- [x] Session 04 completed (shadcn/ui components available)
- [x] Session 05 completed (Lucide icons available)

### Dependencies
- **Builds on**: All Phase 04 sessions (Tailwind, shadcn/ui, Framer Motion, Lucide)
- **Enables**: Phase 04 completion, polished user experience

### Project Progression
This is the **final session of Phase 04** and completes the Frontend Overhaul. With Tailwind CSS, shadcn/ui components, Framer Motion animations, and Lucide icons all in place, adding the theme system is the natural capstone. It will:

1. Give users control over their visual preference (dark/light/system)
2. Complete the modern, polished frontend stack
3. Mark Phase 04 as complete

---

## Session Overview

### Objective
Implement dark/light theme toggle with system preference detection, theme persistence, and smooth visual transitions between modes.

### Key Deliverables
1. next-themes package installed and configured
2. ThemeProvider component wrapping entire app
3. Theme toggle component with Sun/Moon/Monitor icons
4. All components supporting dark/light modes via `dark:` variants
5. Theme preference persisted across sessions

### Scope Summary
- **In Scope (MVP)**: next-themes setup, ThemeProvider, theme toggle in user menu, dark/light/system modes, localStorage persistence, WCAG AA contrast
- **Out of Scope**: Custom theme colors beyond dark/light, theme customization UI, per-component theme overrides

---

## Technical Considerations

### Technologies/Patterns
- **next-themes**: Battle-tested theme provider that works with Vite
- **Tailwind `dark:` variant**: Class-based dark mode switching
- **shadcn/ui DropdownMenu**: For the theme toggle UI
- **Lucide icons**: Sun, Moon, Monitor for theme options

### Potential Challenges
1. **Flash of wrong theme on load**: next-themes script injection prevents this
2. **Ensuring contrast in both modes**: Systematic audit of color usage
3. **Map component theming**: 3D Maps may need special handling
4. **Existing hardcoded colors**: May need to replace with theme-aware variants

---

## Alternative Sessions

If this session is blocked:
1. **None available** - This is the only remaining session in Phase 04
2. **Consider Phase 05 planning** - If theme system is blocked, begin planning next phase

---

## Next Steps

Run `/sessionspec` to generate the formal specification.
