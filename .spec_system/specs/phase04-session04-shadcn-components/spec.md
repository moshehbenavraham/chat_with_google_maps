# Session Specification

**Session ID**: `phase04-session04-shadcn-components`
**Phase**: 04 - Frontend Overhaul
**Status**: Not Started
**Created**: 2025-12-21

---

## 1. Session Overview

This session replaces custom-built UI components with accessible, polished shadcn/ui primitives built on Radix UI. The goal is to establish a consistent component library that provides keyboard navigation, screen reader compatibility, and a cohesive visual design across the entire application.

Currently, the app uses a mix of custom CSS components (PopUp, Sidebar, UserMenu) and HeadlessUI (@headlessui/react for SourcesPopover). This session consolidates everything under shadcn/ui, which provides copy-paste components that integrate seamlessly with the existing Tailwind CSS 4 setup and cn() utility from previous sessions.

The migration will enable Session 06 (Theme System) by providing the DropdownMenu component needed for the theme toggle, while also improving accessibility compliance across all interactive elements.

---

## 2. Objectives

1. **Initialize shadcn/ui** with proper Vite/React configuration and components.json
2. **Add core components**: Button, Dialog, Popover, ScrollArea, Sheet, Tooltip, Avatar, DropdownMenu
3. **Migrate existing components** to shadcn/ui equivalents with preserved functionality
4. **Remove legacy CSS files** and @headlessui/react dependency
5. **Customize theme tokens** to match existing app design system (Neutral-*, Blue-*, etc.)

---

## 3. Prerequisites

### Required Sessions
- [x] `phase04-session01-tailwind-foundation` - Tailwind CSS 4 configured with design tokens
- [x] `phase04-session02-utility-setup` - cn() utility available in src/lib/utils.ts
- [x] `phase04-session03-framer-motion` - Framer Motion animations for component transitions

### Required Tools/Knowledge
- Node.js and npm for installing shadcn/ui components
- Understanding of Radix UI primitives and accessibility patterns
- Familiarity with React component composition

### Environment Requirements
- Development server running (npm run dev)
- TypeScript strict mode enabled
- ESLint and Prettier configured

---

## 4. Scope

### In Scope (MVP)
- Initialize shadcn/ui with components.json for Vite
- Add 8 base components: Button, Dialog, Popover, ScrollArea, Sheet, Tooltip, Avatar, DropdownMenu
- Migrate PopUp component to Dialog
- Migrate Sidebar component to Sheet (slide-over panel)
- Migrate SourcesPopover to shadcn Popover
- Migrate UserMenu to DropdownMenu
- Migrate custom buttons to Button variants
- Delete legacy CSS files (PopUp.css, sources-popover.css, UserMenu.css)
- Remove @headlessui/react dependency
- Map existing CSS variables to shadcn/ui theme tokens

### Out of Scope (Deferred)
- Form components (Input, Select, etc.) - *Reason: Auth forms already functional, address in future session*
- Data tables or virtualized lists - *Reason: No current use case*
- Custom animations beyond current Framer Motion setup - *Reason: Session 03 already complete*
- Toast component migration - *Reason: Current Toast works, low priority*

---

## 5. Technical Approach

### Architecture

shadcn/ui components are installed via CLI and copied to `src/components/ui/`. They integrate with:
- Tailwind CSS 4 for styling
- cn() utility for className composition
- Framer Motion for animations (preserved in migrated components)

```
src/components/
  ui/                    # shadcn/ui components
    button.tsx
    dialog.tsx
    popover.tsx
    scroll-area.tsx
    sheet.tsx
    tooltip.tsx
    avatar.tsx
    dropdown-menu.tsx
  popup/                 # Migrated to use Dialog
    PopUp.tsx            # Updated, uses Dialog
    PopUp.css            # DELETED
  sources-popover/
    sources-popover.tsx  # Updated, uses shadcn Popover
    sources-popover.css  # DELETED
  auth/
    UserMenu.tsx         # Updated, uses DropdownMenu
    UserMenu.css         # DELETED
    Avatar.tsx           # Updated, uses shadcn Avatar
  Sidebar.tsx            # Updated, uses Sheet
```

### Design Patterns
- **Compound Components**: Radix patterns like Dialog.Root, Dialog.Trigger, Dialog.Content
- **Controlled/Uncontrolled**: Support both patterns for flexibility
- **Forward Refs**: All components forward refs for animation and focus management
- **Slot Pattern**: Use Radix Slot for trigger customization

### Technology Stack
- shadcn/ui (latest via npx shadcn@latest)
- @radix-ui/* primitives (installed automatically with components)
- Tailwind CSS 4.1.18
- React 19.2.0
- TypeScript 5.8.2

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `src/components/ui/button.tsx` | Button component with variants | ~60 |
| `src/components/ui/dialog.tsx` | Modal dialog component | ~80 |
| `src/components/ui/popover.tsx` | Popover/dropdown component | ~50 |
| `src/components/ui/scroll-area.tsx` | Custom scrollbar component | ~50 |
| `src/components/ui/sheet.tsx` | Slide-over panel component | ~100 |
| `src/components/ui/tooltip.tsx` | Tooltip component | ~40 |
| `src/components/ui/avatar.tsx` | Avatar with fallback | ~50 |
| `src/components/ui/dropdown-menu.tsx` | Dropdown menu component | ~120 |
| `components.json` | shadcn/ui configuration | ~25 |

### Files to Modify
| File | Changes | Est. Lines |
|------|---------|------------|
| `src/components/popup/PopUp.tsx` | Use Dialog instead of custom overlay | ~40 delta |
| `src/components/Sidebar.tsx` | Use Sheet for slide-over | ~30 delta |
| `src/components/sources-popover/sources-popover.tsx` | Use shadcn Popover | ~20 delta |
| `src/components/auth/UserMenu.tsx` | Use DropdownMenu | ~40 delta |
| `src/components/auth/Avatar.tsx` | Use shadcn Avatar | ~20 delta |
| `src/components/ControlTray.tsx` | Use Button component for action buttons | ~30 delta |
| `src/index.css` | Add shadcn/ui base styles | ~40 delta |
| `package.json` | Remove @headlessui/react, add radix dependencies | ~10 delta |
| `tailwind.config.ts` | Add shadcn/ui theme configuration if needed | ~20 delta |

### Files to Delete
| File | Reason |
|------|--------|
| `src/components/popup/PopUp.css` | Replaced by Dialog component styling |
| `src/components/sources-popover/sources-popover.css` | Replaced by Popover styling |
| `src/components/auth/UserMenu.css` | Replaced by DropdownMenu styling |

---

## 7. Success Criteria

### Functional Requirements
- [ ] shadcn/ui initialized with components.json in project root
- [ ] All 8 base components added to src/components/ui/
- [ ] PopUp displays as Dialog with backdrop and close animation
- [ ] Sidebar slides in/out as Sheet panel from right
- [ ] SourcesPopover functions identically with new Popover
- [ ] UserMenu dropdown works with keyboard navigation
- [ ] Avatar shows user image with fallback initials
- [ ] All buttons in ControlTray use Button component

### Testing Requirements
- [ ] Manual testing: Dialog opens/closes with Escape key
- [ ] Manual testing: Sheet opens/closes with animation
- [ ] Manual testing: Popover positions correctly
- [ ] Manual testing: DropdownMenu navigates with arrow keys
- [ ] Existing component tests pass
- [ ] No console errors or warnings

### Quality Gates
- [ ] TypeScript strict mode passing (npm run typecheck)
- [ ] ESLint passing with no warnings (npm run lint)
- [ ] Prettier formatting applied (npm run format:check)
- [ ] All existing tests pass (npm run test)
- [ ] All files ASCII-encoded
- [ ] Unix LF line endings

---

## 8. Implementation Notes

### Key Considerations

1. **Framer Motion Integration**: PopUp and Sidebar already use Framer Motion animations. These should be preserved by wrapping shadcn Dialog/Sheet content with motion.div variants.

2. **CSS Variable Mapping**: shadcn/ui uses CSS variables like `--background`, `--foreground`, `--primary`. Map these to existing tokens:
   - `--background` -> `var(--Neutral-00)` or `var(--Neutral-10)`
   - `--foreground` -> `var(--text)` or `var(--Neutral-90)`
   - `--primary` -> `var(--Blue-500)`
   - `--destructive` -> `var(--Red-500)`

3. **HeadlessUI Removal**: SourcesPopover uses @headlessui/react. After migration, remove the dependency from package.json.

4. **Existing Avatar Component**: src/components/auth/Avatar.tsx already exists. Update it to use shadcn Avatar internally while preserving the current API.

### Potential Challenges

- **Tailwind CSS 4 Compatibility**: shadcn/ui was designed for Tailwind 3.x. May need to adjust some utility classes for v4 syntax. Mitigation: Test each component after adding.

- **Animation Preservation**: Sidebar and PopUp have custom Framer Motion animations. Mitigation: Compose shadcn primitives with motion components.

- **Theme Token Conflicts**: shadcn uses different variable names than existing CSS. Mitigation: Add layer in index.css to map values.

### ASCII Reminder
All output files must use ASCII-only characters (0-127). No smart quotes, em-dashes, or unicode symbols.

---

## 9. Testing Strategy

### Unit Tests
- Button component renders with correct variants
- Dialog opens and closes on trigger
- Avatar falls back to initials when no image

### Integration Tests
- PopUp integration with Dialog primitives
- Sidebar Sheet with existing Zustand state
- UserMenu with auth context

### Manual Testing
1. **Dialog (PopUp)**
   - Opens on app load (welcome modal)
   - Closes with "Got It" button
   - Closes with Escape key
   - Closes on backdrop click
   - Focus trapped inside modal

2. **Sheet (Sidebar)**
   - Opens when settings icon clicked
   - Slides in from right
   - Closes with X button
   - Closes with Escape key
   - Form controls work correctly

3. **Popover (SourcesPopover)**
   - Opens on button click
   - Positions above trigger
   - Links are clickable
   - Closes on outside click

4. **DropdownMenu (UserMenu)**
   - Opens on Avatar click
   - Arrow key navigation works
   - Sign out button triggers logout
   - Closes on selection
   - Closes on outside click

### Edge Cases
- Screen reader announces dialog/popover opening
- Focus returns to trigger after dialog closes
- Scrollable content in ScrollArea maintains position
- Multiple popovers don't conflict

---

## 10. Dependencies

### External Libraries
| Library | Version | Purpose |
|---------|---------|---------|
| @radix-ui/react-dialog | ~1.1.x | Dialog primitive |
| @radix-ui/react-popover | ~1.1.x | Popover primitive |
| @radix-ui/react-dropdown-menu | ~2.1.x | Dropdown menu primitive |
| @radix-ui/react-scroll-area | ~1.2.x | Custom scrollbar |
| @radix-ui/react-tooltip | ~1.1.x | Tooltip primitive |
| @radix-ui/react-avatar | ~1.1.x | Avatar primitive |
| @radix-ui/react-slot | ~1.1.x | Slot utility |
| class-variance-authority | ~0.7.x | Variant styling utility |

### Libraries to Remove
| Library | Reason |
|---------|--------|
| @headlessui/react | Replaced by Radix primitives |

### Other Sessions
- **Depends on**: phase04-session01, phase04-session02, phase04-session03
- **Depended by**: phase04-session06 (Theme System needs DropdownMenu)

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
