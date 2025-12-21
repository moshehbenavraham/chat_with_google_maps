# Session 04: shadcn/ui Components

**Session ID**: `phase04-session04-shadcn-components`
**Status**: Not Started
**Estimated Tasks**: ~25-30
**Estimated Duration**: 3-4 hours

---

## Objective

Replace custom components with accessible, polished shadcn/ui primitives built on Radix UI, ensuring keyboard navigation and screen reader compatibility throughout the app.

---

## Scope

### In Scope (MVP)
- Initialize shadcn/ui for Vite project
- Configure `components.json` for project structure
- Add base components: Button, Dialog, Popover, ScrollArea, Sheet, Tooltip, Avatar, DropdownMenu
- Migrate existing components to shadcn/ui equivalents
- Delete legacy CSS files for replaced components
- Customize theme to match app brand

### Out of Scope
- Complex form components (future session)
- Data tables or virtualized lists
- Custom animation beyond Framer Motion integration

---

## Prerequisites

- [ ] Session 01 completed (Tailwind CSS 4 configured)
- [ ] Session 02 completed (cn() utility available)
- [ ] Session 03 completed (Framer Motion available)

---

## Deliverables

1. shadcn/ui initialized with `components.json`
2. Base components added to `src/components/ui/`
3. Existing components migrated to shadcn/ui equivalents
4. Legacy CSS files deleted
5. Theme customized to match app brand

---

## Implementation Details

### Initialization

```bash
npx shadcn@latest init
```

Configuration choices:
- TypeScript: Yes
- Style: Default
- Base color: Slate (or match existing)
- CSS variables: Yes
- React Server Components: No (Vite)
- Component path: `src/components/ui`
- Utility path: `src/lib/utils` (already exists)

### Add Components

```bash
npx shadcn@latest add button dialog popover scroll-area sheet tooltip avatar dropdown-menu
```

### Component Migration Mapping

| Current Component | Replace With | Notes |
|-------------------|--------------|-------|
| `PopUp` (welcome modal) | `Dialog` | Modal with backdrop |
| `Sidebar` | `Sheet` | Slide-over panel from right |
| `SourcesPopover` | `Popover` | Dropdown content |
| Custom buttons | `Button` variants | Multiple variants |
| Scrollable areas | `ScrollArea` | Custom scrollbar styling |
| User menu | `DropdownMenu` | Accessible dropdown |
| User avatar | `Avatar` | Image with fallback |

### Theme Customization

Update CSS variables in `src/index.css` to match existing design tokens:

```css
@layer base {
  :root {
    --background: /* map to existing neutral */;
    --foreground: /* map to existing text color */;
    --primary: /* map to existing blue */;
    /* ... */
  }
  .dark {
    --background: /* dark mode values */;
    /* ... */
  }
}
```

### Files to Delete After Migration

- `src/components/PopUp.css` (if exists)
- `src/components/sources-popover.css` (if exists)
- Any other component-specific CSS files replaced by Tailwind

---

## Success Criteria

- [ ] shadcn/ui initialized with components.json
- [ ] All specified base components added
- [ ] PopUp migrated to Dialog
- [ ] Sidebar migrated to Sheet
- [ ] SourcesPopover migrated to Popover
- [ ] Buttons using shadcn/ui Button component
- [ ] Legacy CSS files deleted
- [ ] Keyboard navigation works throughout
- [ ] Screen reader accessible
- [ ] TypeScript strict mode passing
- [ ] ESLint passing with no warnings
