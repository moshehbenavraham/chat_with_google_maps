# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-21
**Project State**: Phase 04 - Frontend Overhaul
**Completed Sessions**: 19

---

## Recommended Next Session

**Session ID**: `phase04-session04-shadcn-components`
**Session Name**: shadcn/ui Components
**Estimated Duration**: 3-4 hours
**Estimated Tasks**: 25-30

---

## Why This Session Next?

### Prerequisites Met
- [x] Session 01 completed (Tailwind CSS 4 configured)
- [x] Session 02 completed (cn() utility available)
- [x] Session 03 completed (Framer Motion available)

### Dependencies
- **Builds on**: Tailwind foundation (Session 01), cn() utility (Session 02), Framer Motion (Session 03)
- **Enables**: Theme System (Session 06) which requires shadcn DropdownMenu for theme toggle

### Project Progression

This is the natural next step in the Frontend Overhaul phase. Sessions 01-03 established the styling foundation (Tailwind), utility pattern (cn()), and animation system (Framer Motion). Session 04 now builds the component layer using shadcn/ui primitives built on Radix UI.

The shadcn/ui components provide:
1. **Accessibility**: Keyboard navigation and screen reader support via Radix primitives
2. **Consistency**: Polished, cohesive component library matching the established design system
3. **Customization**: Full control over component styling using Tailwind utilities

Session 05 (Lucide Icons) could technically run in parallel since it only requires Sessions 01 and 02, but Session 06 (Theme System) explicitly depends on both Session 04 (for DropdownMenu) and Session 05 (for Sun/Moon/Monitor icons). Completing Session 04 first maintains logical flow.

---

## Session Overview

### Objective

Replace custom components with accessible, polished shadcn/ui primitives built on Radix UI, ensuring keyboard navigation and screen reader compatibility throughout the app.

### Key Deliverables
1. shadcn/ui initialized with `components.json`
2. Base components added: Button, Dialog, Popover, ScrollArea, Sheet, Tooltip, Avatar, DropdownMenu
3. Existing components migrated to shadcn/ui equivalents
4. Legacy CSS files deleted
5. Theme customized to match app brand

### Scope Summary
- **In Scope (MVP)**: Initialize shadcn/ui, add base components, migrate PopUp to Dialog, Sidebar to Sheet, SourcesPopover to Popover, custom buttons to Button variants, scrollable areas to ScrollArea, user menu to DropdownMenu
- **Out of Scope**: Complex form components, data tables, virtualized lists, custom animations beyond Framer Motion integration

---

## Technical Considerations

### Technologies/Patterns
- shadcn/ui (copy-paste components, not npm package)
- Radix UI primitives (Dialog, Popover, Sheet, DropdownMenu)
- Tailwind CSS 4 for styling
- cn() utility for className composition

### Potential Challenges
- **shadcn/ui + Tailwind CSS 4 compatibility**: May need to verify configuration options work with new Tailwind version
- **Component migration scope**: Large number of components to migrate (PopUp, Sidebar, SourcesPopover, buttons, scroll areas)
- **Theme mapping**: Need to map existing CSS variables to shadcn/ui theme tokens
- **Accessibility testing**: Must verify keyboard navigation and screen reader support after migration

---

## Component Migration Matrix

| Current Component | Replace With | Priority |
|-------------------|--------------|----------|
| `PopUp` (welcome modal) | `Dialog` | High |
| `Sidebar` | `Sheet` | High |
| `SourcesPopover` | `Popover` | High |
| Custom buttons | `Button` variants | High |
| Scrollable areas | `ScrollArea` | Medium |
| User menu | `DropdownMenu` | Medium |
| User avatar | `Avatar` | Low |

---

## Alternative Sessions

If this session is blocked:

1. **phase04-session05-lucide-icons** - Can run independently since it only requires Sessions 01 and 02. Replaces Material Symbols with Lucide React icons.
2. **Resume any failing tests/lint** - If quality gates are failing, address those before new feature work.

---

## Next Steps

Run `/sessionspec` to generate the formal specification.
