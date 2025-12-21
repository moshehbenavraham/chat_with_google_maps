# Session Specification

**Session ID**: `phase04-session01-tailwind-foundation`
**Phase**: 04 - Frontend Overhaul
**Status**: Not Started
**Created**: 2025-12-21

---

## 1. Session Overview

This session establishes Tailwind CSS 4 as the foundation for the frontend styling overhaul. The project currently uses vanilla CSS with custom design tokens defined in `src/index.css`, along with component-specific CSS files. This session migrates the styling approach to Tailwind's utility-first methodology while preserving all existing visual appearances.

Tailwind CSS 4 is the critical foundation that all subsequent Phase 04 sessions depend on. Session 02 (clsx + tailwind-merge) creates utilities that work with Tailwind classes. Session 03 (Framer Motion) will animate Tailwind-styled components. Session 04 (shadcn/ui) requires Tailwind CSS as a core dependency. Without this foundation, none of the other frontend modernization work can proceed.

The approach is incremental: install and configure Tailwind, map existing CSS tokens to Tailwind theme extensions, then migrate components one-by-one starting with leaf components (buttons, badges) before progressing to layout components. The goal is zero visual regression while establishing the new styling foundation.

---

## 2. Objectives

1. Install and configure Tailwind CSS 4 with PostCSS integration in the Vite build pipeline
2. Map all existing CSS custom properties (design tokens) to Tailwind theme configuration
3. Migrate at least 5 components from vanilla CSS to Tailwind utility classes
4. Ensure build passes with no visual regressions and acceptable bundle size increase (<10%)

---

## 3. Prerequisites

### Required Sessions
- [x] `phase03-session03-protected-routes-ui` - Complete auth UI with CSS to migrate

### Required Tools/Knowledge
- Tailwind CSS 4 documentation and configuration patterns
- PostCSS plugin configuration for Vite
- Understanding of CSS custom properties and utility-first CSS methodology

### Environment Requirements
- Node.js 18+ (already in place)
- Vite build system (already configured)
- All dev tooling operational (TypeScript strict, ESLint, Prettier, Vitest)

---

## 4. Scope

### In Scope (MVP)
- Install `tailwindcss`, `@tailwindcss/postcss`, and `postcss` dependencies
- Create `postcss.config.js` with Tailwind plugin configuration
- Create `tailwind.config.ts` with content paths and theme extensions
- Map existing CSS tokens to Tailwind theme (colors, spacing, breakpoints)
- Update `src/index.css` with Tailwind directives while preserving custom tokens
- Migrate 5+ components to Tailwind utilities: ControlTray, action buttons, ErrorScreen, Sidebar header, Avatar
- Verify dev server and production build work correctly

### Out of Scope (Deferred)
- `cn()` helper function - *Reason: Session 02 scope*
- Framer Motion animations - *Reason: Session 03 scope*
- shadcn/ui component integration - *Reason: Session 04 scope*
- Lucide icon migration - *Reason: Session 05 scope*
- Theme toggle (dark/light mode) - *Reason: Session 06 scope*
- Complete migration of all components - *Reason: Incremental approach, some components migrate in later sessions*

---

## 5. Technical Approach

### Architecture

```
Tailwind CSS 4 Integration
--------------------------
Vite Build Pipeline
  |
  v
PostCSS (postcss.config.js)
  |
  +-- @tailwindcss/postcss plugin
  |     |
  |     v
  |   tailwind.config.ts
  |     +-- content: ./src/**/*.{tsx,ts}
  |     +-- theme.extend.colors (mapped from CSS tokens)
  |     +-- theme.extend.spacing
  |     +-- darkMode: 'class'
  |
  v
src/index.css
  +-- @import "tailwindcss"
  +-- CSS custom properties (preserved)
  +-- Base styles (preserved, some migrated)
```

### Design Patterns
- **Utility-First CSS**: Replace semantic CSS classes with composable utility classes
- **Theme Extension**: Extend (not replace) Tailwind defaults with project tokens
- **Incremental Migration**: Keep old CSS alongside new Tailwind until component fully migrated
- **CSS Variable Bridge**: Use Tailwind's arbitrary value syntax `[var(--token)]` for gradual migration

### Technology Stack
- Tailwind CSS 4.x (latest stable)
- @tailwindcss/postcss 4.x
- PostCSS 8.x

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `postcss.config.js` | PostCSS configuration with Tailwind plugin | ~8 |
| `tailwind.config.ts` | Tailwind theme configuration with mapped tokens | ~80 |

### Files to Modify
| File | Changes | Est. Lines Changed |
|------|---------|------------|
| `package.json` | Add tailwindcss, @tailwindcss/postcss, postcss dependencies | ~3 |
| `src/index.css` | Add Tailwind directives, begin migrating base styles | ~100 |
| `src/components/ControlTray.tsx` | Migrate to Tailwind utilities | ~30 |
| `src/components/ErrorScreen.tsx` | Migrate to Tailwind utilities | ~20 |
| `src/components/Sidebar.tsx` | Migrate sidebar-header section to Tailwind | ~25 |
| `src/components/auth/Avatar.tsx` | Migrate to Tailwind utilities | ~15 |
| `src/components/auth/Avatar.css` | Remove after migration | -50 (delete) |

---

## 7. Success Criteria

### Functional Requirements
- [ ] Tailwind CSS 4 installed and configured correctly
- [ ] PostCSS processing working in dev (`npm run dev`) and build (`npm run build`)
- [ ] All existing design tokens mapped to Tailwind theme extensions
- [ ] At least 5 components migrated to Tailwind utilities
- [ ] All migrated components visually identical to before migration

### Testing Requirements
- [ ] Existing unit tests pass without modification
- [ ] Manual visual comparison of migrated components
- [ ] Dev server hot reload works with Tailwind classes
- [ ] Production build generates optimized CSS (tree-shaking)

### Quality Gates
- [ ] TypeScript strict mode passing (no type errors)
- [ ] ESLint passing with no warnings
- [ ] Prettier formatting applied
- [ ] Build size increase < 10% from baseline
- [ ] All files ASCII-encoded with Unix LF line endings

---

## 8. Implementation Notes

### Key Considerations

**Token Mapping Strategy**:
The existing CSS uses tokens like `--Neutral-00` through `--Neutral-90`. Map these to Tailwind as:
```typescript
colors: {
  neutral: {
    '00': 'var(--Neutral-00)',  // #000
    '5': 'var(--Neutral-5)',    // #181a1b
    '10': 'var(--Neutral-10)',  // #1c1f21
    // ... etc
  }
}
```

**Preserve CSS Variables**: Keep custom properties in `:root` for:
- Components not yet migrated
- Complex values (e.g., scrollbar-color)
- Integration with third-party components

**Migration Order**:
1. Simple, isolated components first (Avatar, action buttons)
2. Layout components second (ControlTray, ErrorScreen)
3. Complex components last (StreamingConsole, transcription styles)

### Potential Challenges
- **Vite Integration**: Ensure PostCSS processes before Vite's CSS handling
  - *Mitigation*: Use `@tailwindcss/postcss` which handles Vite integration natively
- **Class Specificity**: Tailwind utilities may conflict with existing CSS
  - *Mitigation*: Remove old CSS classes as components migrate
- **Bundle Size**: Initial Tailwind adds overhead before tree-shaking kicks in
  - *Mitigation*: Monitor bundle size, ensure content paths are correct

### ASCII Reminder
All output files must use ASCII-only characters (0-127). No unicode characters in config files.

---

## 9. Testing Strategy

### Unit Tests
- Existing component tests should pass unchanged
- No new unit tests required for styling changes

### Integration Tests
- Verify Vite dev server starts without errors
- Verify production build completes without errors

### Manual Testing
- Compare screenshots of migrated components before/after
- Test responsive breakpoints (768px boundary)
- Verify action buttons in all states (default, hover, connected, mic-on, mic-off)
- Check ErrorScreen displays correctly
- Validate Avatar component sizing and colors

### Edge Cases
- Dark mode class application (prepare for Session 06)
- Mobile responsive styles at 768px breakpoint
- Landscape orientation styles for mobile
- Disabled button states

---

## 10. Dependencies

### External Libraries
| Library | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^4.0.0 | Utility-first CSS framework |
| `@tailwindcss/postcss` | ^4.0.0 | PostCSS integration plugin |
| `postcss` | ^8.x | CSS processing pipeline |

### Other Sessions
- **Depends on**: Phase 03 sessions (complete)
- **Depended by**:
  - `phase04-session02-utility-setup` (needs Tailwind for tailwind-merge)
  - `phase04-session03-framer-motion` (animates Tailwind-styled components)
  - `phase04-session04-shadcn-components` (requires Tailwind as core dependency)
  - `phase04-session05-lucide-icons` (icons styled with Tailwind)
  - `phase04-session06-theme-system` (uses Tailwind dark mode)

---

## 11. Design Token Mapping Reference

### Color Tokens to Map

```typescript
// Neutrals (10 shades)
neutral: {
  '00': '#000000',
  '5': '#181a1b',
  '10': '#1c1f21',
  '15': '#232729',
  '20': '#2a2f31',
  '30': '#404547',
  '50': '#707577',
  '60': '#888d8f',
  '80': '#c3c6c7',
  '90': '#e1e2e3',
}

// Semantic colors
green: {
  '400': '#57e092',
  '500': '#0d9c53',
  '700': '#025022',
  '800': '#0a3d20',
}

blue: {
  '400': '#80c1ff',
  '500': '#1f94ff',
  '800': '#0f3557',
}

red: {
  '400': '#ff9c7a',
  '500': '#ff4600',
  '600': '#e03c00',
  '700': '#bd3000',
  '800': '#5c1300',
}
```

### Breakpoints to Preserve

```typescript
screens: {
  md: '768px',  // Current --breakpoint-md
}
```

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
