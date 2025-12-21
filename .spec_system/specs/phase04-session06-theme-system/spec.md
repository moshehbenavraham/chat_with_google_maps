# Session Specification

**Session ID**: `phase04-session06-theme-system`
**Phase**: 04 - Frontend Overhaul
**Status**: Not Started
**Created**: 2025-12-22

---

## 1. Session Overview

This session implements a complete dark/light theme system for the Chat with Google Maps application. Currently, the app operates exclusively in dark mode with hardcoded color values. This session adds user-controlled theming with three options: dark, light, and system preference.

The implementation leverages `next-themes`, a battle-tested library that works with Vite and provides localStorage persistence, system preference detection, and flash prevention out of the box. Combined with Tailwind's `dark:` variant (already configured with `darkMode: 'class'`), this creates a seamless theming experience.

This is the **final session of Phase 04**, completing the Frontend Overhaul. It builds upon all previous Phase 04 sessions: Tailwind CSS 4 (foundation), cn() utility (class composition), Framer Motion (animations), shadcn/ui (components), and Lucide React (icons). After completion, the frontend stack will be fully modernized with a polished, accessible, user-configurable interface.

---

## 2. Objectives

1. Install and configure next-themes with ThemeProvider wrapping the entire application
2. Create a theme toggle component accessible from the UserMenu dropdown
3. Define light mode CSS custom properties and update components with `dark:` variants
4. Ensure theme persistence across sessions with no flash of wrong theme on load

---

## 3. Prerequisites

### Required Sessions
- [x] `phase04-session01-tailwind-foundation` - Tailwind CSS 4 with `darkMode: 'class'`
- [x] `phase04-session02-utility-setup` - `cn()` utility for class composition
- [x] `phase04-session04-shadcn-components` - DropdownMenu for theme toggle UI
- [x] `phase04-session05-lucide-icons` - Sun, Moon, Monitor icons

### Required Tools/Knowledge
- React 19 component patterns
- Tailwind CSS dark mode variants
- CSS custom properties (CSS variables)
- next-themes library API

### Environment Requirements
- Node.js 18+ with npm
- Local development server running

---

## 4. Scope

### In Scope (MVP)
- Install `next-themes` package
- Create `ThemeProvider` component wrapping app in `main.tsx`
- Create `ThemeToggle` component with Sun/Moon/Monitor options
- Add theme toggle to UserMenu dropdown
- Define light mode CSS custom properties in `index.css`
- Add `dark:` variants to key components for theme-aware styling
- Ensure sufficient contrast ratios in both modes (WCAG AA)
- Test theme persistence and system preference detection

### Out of Scope (Deferred)
- Custom theme colors beyond dark/light - *Reason: MVP focuses on standard themes*
- Theme customization UI (color pickers) - *Reason: Complexity, low priority*
- Per-component theme overrides - *Reason: Unnecessary for initial implementation*
- Google Maps styling for light mode - *Reason: Maps API handles its own theming*

---

## 5. Technical Approach

### Architecture

```
src/
  providers/
    theme-provider.tsx    # NextThemesProvider wrapper
  components/
    theme-toggle.tsx      # Theme toggle dropdown component
  main.tsx                # Add ThemeProvider to component tree
  index.css               # Add .light class CSS variables
```

The ThemeProvider wraps the entire app at the top level in `main.tsx`. When the theme changes, next-themes applies the appropriate class (`dark` or `light`) to the `<html>` element. Tailwind's `dark:` variants respond to this class, and CSS custom properties update accordingly.

### Design Patterns
- **Provider Pattern**: ThemeProvider at root level for global state
- **Composition**: Theme toggle uses existing shadcn/ui DropdownMenu
- **CSS Custom Properties**: Semantic color tokens that change per theme

### Technology Stack
- `next-themes` ^0.4.x - Theme management (works with Vite)
- Tailwind CSS 4 - `dark:` variant for conditional styling
- shadcn/ui DropdownMenu - Theme toggle UI component
- Lucide React - Sun, Moon, Monitor icons

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `src/providers/theme-provider.tsx` | NextThemesProvider wrapper with configuration | ~25 |
| `src/components/theme-toggle.tsx` | Theme toggle dropdown with three options | ~50 |

### Files to Modify
| File | Changes | Est. Lines Changed |
|------|---------|-------------------|
| `src/main.tsx` | Wrap app with ThemeProvider | ~5 |
| `src/index.css` | Add `.light` class CSS variables | ~40 |
| `src/components/auth/UserMenu.tsx` | Add ThemeToggle to dropdown | ~15 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] Theme toggle visible in UserMenu dropdown
- [ ] Clicking "Light" switches app to light mode
- [ ] Clicking "Dark" switches app to dark mode
- [ ] Clicking "System" follows OS preference
- [ ] Theme persists after page reload
- [ ] Theme persists across browser sessions (localStorage)
- [ ] No flash of wrong theme on initial page load
- [ ] System preference changes are detected and applied

### Testing Requirements
- [ ] Manual testing of all three theme options
- [ ] Test persistence by reloading page
- [ ] Test system preference by changing OS theme
- [ ] Verify contrast ratios meet WCAG AA (4.5:1 for text)

### Quality Gates
- [ ] All files ASCII-encoded (no unicode issues)
- [ ] Unix LF line endings
- [ ] TypeScript strict mode passing
- [ ] ESLint passing with no warnings
- [ ] Prettier formatting applied

---

## 8. Implementation Notes

### Key Considerations

1. **Provider Order in main.tsx**: ThemeProvider should wrap AuthProvider to ensure theme is available to all auth components:
   ```tsx
   <ThemeProvider>
     <AuthProvider>
       <ToastProvider>
         <RouterProvider router={router} />
       </ToastProvider>
     </AuthProvider>
   </ThemeProvider>
   ```

2. **Existing CSS Variables**: The app uses `--Neutral-*`, `--Blue-*`, `--Red-*`, `--Green-*` palette. Light mode should redefine these with appropriate light values, OR use the shadcn semantic tokens (`--background`, `--foreground`, etc.) which are already mapped.

3. **shadcn/ui Token Mapping**: The current `index.css` already defines shadcn tokens in `:root`. For light mode, add a `.light` selector (or `:root` without `.dark`) with inverted values.

4. **Flash Prevention**: next-themes injects a script to read localStorage before React hydrates. Use `disableTransitionOnChange` to prevent jarring color transitions.

### Potential Challenges

| Challenge | Mitigation |
|-----------|------------|
| Hardcoded dark colors in components | Audit and replace with CSS variables or Tailwind classes |
| Google Maps doesn't follow theme | Leave Maps as-is; it has its own styling |
| Contrast issues in light mode | Use WCAG contrast checker; adjust light palette values |
| Components using `var(--text)` directly | These should work if `--text` is redefined in light mode |

### ASCII Reminder
All output files must use ASCII-only characters (0-127). No unicode symbols in comments or strings.

---

## 9. Testing Strategy

### Unit Tests
- No unit tests required for this session (UI theming is visual)

### Integration Tests
- None required; theme system is self-contained

### Manual Testing
1. **Theme Toggle Visibility**: Open UserMenu, verify theme options present
2. **Dark Mode**: Select "Dark", verify dark colors applied
3. **Light Mode**: Select "Light", verify light colors applied
4. **System Mode**: Select "System", verify matches OS preference
5. **Persistence**: Reload page, verify theme preserved
6. **Cross-Session**: Close and reopen browser, verify theme preserved
7. **No Flash**: Reload with light theme selected, verify no dark flash

### Edge Cases
- User with no localStorage (fresh browser)
- User with "system" preference and changing OS theme
- User with "prefers-reduced-motion" (no transitions)

---

## 10. Dependencies

### External Libraries
| Library | Version | Purpose |
|---------|---------|---------|
| `next-themes` | ^0.4.x | Theme state management and persistence |

### Other Sessions
- **Depends on**: phase04-session01 (Tailwind), phase04-session02 (cn), phase04-session04 (shadcn), phase04-session05 (Lucide)
- **Depended by**: None (final session of Phase 04)

---

## 11. CSS Variable Strategy

### Current Dark Mode Variables (in `:root`)
The app currently defines all colors in `:root`, effectively making dark mode the default.

### Light Mode Strategy
Add a `.light` selector that overrides the color values:

```css
/* Light mode overrides */
.light {
  --text: #1c1f21;
  --Neutral-00: #ffffff;
  --Neutral-5: #f8f9fa;
  --Neutral-10: #f1f3f4;
  --Neutral-15: #e8eaed;
  --Neutral-20: #dadce0;
  --Neutral-30: #bdc1c6;
  --Neutral-50: #9aa0a6;
  --Neutral-60: #80868b;
  --Neutral-80: #5f6368;
  --Neutral-90: #3c4043;
  --background: #ffffff;
  --gray-900: #f1f3f4;
  --gray-800: #e8eaed;
  /* ... etc */
}
```

This approach:
- Requires minimal component changes
- Leverages existing CSS variable usage
- Keeps dark mode as default (current behavior)

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
