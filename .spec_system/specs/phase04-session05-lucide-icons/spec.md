# Session Specification

**Session ID**: `phase04-session05-lucide-icons`
**Phase**: 04 - Frontend Overhaul
**Status**: Not Started
**Created**: 2025-12-21

---

## 1. Session Overview

This session replaces the Material Symbols font-based icons with Lucide React, a tree-shakeable icon library. Currently, the application loads the entire Material Symbols font from Google Fonts (variable weight/fill/grade), which adds external network dependencies and includes thousands of unused icons in the download.

Lucide React provides individually importable SVG icons as React components. This approach enables Vite's tree-shaking to bundle only the icons actually used, eliminating the external font dependency entirely. Icons become first-class React components with proper TypeScript types, and sizing is standardized through Tailwind's `size-*` utilities.

This session is a prerequisite for Session 06 (Theme System), which requires Lucide icons (Sun, Moon, Monitor) for the theme toggle component. Completing this migration ensures all UI icons are consistent, performant, and ready for theming.

---

## 2. Objectives

1. Install Lucide React and replace all Material Symbols icons with equivalent Lucide components
2. Remove Material Symbols font link from `index.html`, eliminating external font dependency
3. Remove all `.material-symbols-*` CSS classes and related styling
4. Standardize icon sizing using Tailwind `size-*` utilities for consistency

---

## 3. Prerequisites

### Required Sessions
- [x] `phase04-session01-tailwind-foundation` - Provides Tailwind CSS 4 configuration
- [x] `phase04-session02-utility-setup` - Provides cn() utility for className composition

### Required Tools/Knowledge
- npm/package management
- React component patterns
- Lucide React icon naming conventions

### Environment Requirements
- Node.js and npm installed
- Development server runnable (`npm run dev`)
- TypeScript strict mode enabled

---

## 4. Scope

### In Scope (MVP)
- Install `lucide-react` package
- Migrate all Material Symbols icons to Lucide equivalents
- Remove Material Symbols font links from `index.html`
- Remove Material Symbols CSS classes from stylesheets
- Standardize icon sizing with Tailwind utilities

### Out of Scope (Deferred)
- Custom SVG icon creation - *Reason: Lucide provides sufficient icon set*
- Animated icons - *Reason: Handled by Framer Motion in Session 03 if needed*
- Icon sprites or bundles - *Reason: Tree-shaking provides optimal bundling*

---

## 5. Technical Approach

### Architecture

Icons will be imported directly from `lucide-react` as named exports. Each icon is a React component that accepts standard SVG props plus `className` for Tailwind styling.

```tsx
// Import pattern
import { Settings, Mic, MicOff, X } from 'lucide-react'

// Usage pattern
<Settings className="size-5" />
<Mic className="size-6 text-green-500" />
```

### Design Patterns
- **Direct imports**: Import icons by name to enable tree-shaking
- **Tailwind sizing**: Use `size-*` utilities instead of inline styles
- **Consistent props**: Pass `className` for all styling, avoid inline `style`

### Technology Stack
- `lucide-react` (latest) - Tree-shakeable React icon library
- Tailwind CSS 4 - For icon sizing via `size-*` utilities

### Icon Mapping Reference

| Material Symbol | Lucide Equivalent | Current Location |
|-----------------|-------------------|------------------|
| `videocam` | `Video` | ControlTray.tsx |
| `videocam_off` | `VideoOff` | ControlTray.tsx |
| `mic` | `Mic` | ControlTray.tsx |
| `mic_off` | `MicOff` | ControlTray.tsx |
| `close` | `X` | Toast.tsx |
| `check_circle` | `CheckCircle` | Toast.tsx |
| `error` | `AlertCircle` | Toast.tsx, AuthErrorBoundary.tsx |
| `warning` | `AlertTriangle` | Toast.tsx |
| `info` | `Info` | Toast.tsx |
| `map` | `Map` | LoadingSkeleton.tsx |

### Icon Sizing Convention

| Size Class | Pixels | Usage |
|------------|--------|-------|
| `size-4` | 16px | Inline text icons, small buttons |
| `size-5` | 20px | Default buttons, menu items |
| `size-6` | 24px | Large buttons, headers, primary actions |
| `size-8` | 32px | Hero icons, empty states |

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| None | All work is modifications | - |

### Files to Modify
| File | Changes | Est. Lines Changed |
|------|---------|-------------------|
| `package.json` | Add lucide-react dependency | ~1 |
| `index.html` | Remove Material Symbols font links | ~-15 |
| `src/components/ControlTray.tsx` | Replace 4 icon instances | ~10 |
| `src/components/ui/Toast.tsx` | Replace icon instances | ~15 |
| `src/components/ui/LoadingSkeleton.tsx` | Replace 2 map icons | ~5 |
| `src/components/AuthErrorBoundary.tsx` | Replace error icon | ~5 |
| `src/components/ui/loading-skeleton.css` | Remove .material-symbols-outlined styling | ~-5 |
| `src/components/ui/toast.css` | Remove .material-symbols-outlined styling | ~-5 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] All icons render correctly in all components
- [ ] Icons have proper sizing (consistent with original design)
- [ ] No visual regression in UI appearance
- [ ] Icons inherit color from parent text color as expected

### Testing Requirements
- [ ] Manual visual inspection of all icon locations
- [ ] Verify icons appear in ControlTray (video, mic buttons)
- [ ] Verify icons appear in Toast notifications
- [ ] Verify icons appear in LoadingSkeleton
- [ ] Verify icons appear in AuthErrorBoundary

### Quality Gates
- [ ] `npm run build` succeeds with no errors
- [ ] `npm run lint` passes with no warnings
- [ ] `npm run typecheck` passes
- [ ] No Material Symbols references remain in codebase (excluding .spec_system)
- [ ] No external font requests for Material Symbols in Network tab
- [ ] All files ASCII-encoded with Unix LF line endings

---

## 8. Implementation Notes

### Key Considerations
- **Import style**: Use named imports `{ Icon }` not default imports
- **Sizing**: Replace any `fontSize` inline styles with Tailwind `size-*`
- **Color**: Icons inherit `currentColor` by default, so text color classes work
- **Stroke width**: Lucide uses stroke-based icons (default strokeWidth=2)

### Potential Challenges
- **Icon name differences**: Material uses snake_case (`mic_off`), Lucide uses PascalCase (`MicOff`)
- **Filled variants**: Material has `filled` class; Lucide icons are outline by default (some have `-filled` variants)
- **CSS cleanup**: Ensure all `.material-symbols-*` CSS is removed without breaking other styles

### Migration Pattern
```tsx
// Before
<span className="material-symbols-outlined filled">videocam</span>

// After
import { Video } from 'lucide-react'
<Video className="size-6" />
```

### ASCII Reminder
All output files must use ASCII-only characters (0-127).

---

## 9. Testing Strategy

### Unit Tests
- No new unit tests required (icons are presentational)

### Integration Tests
- Existing component tests should continue passing

### Manual Testing
1. Start dev server (`npm run dev`)
2. Navigate through app and verify all icons render
3. Check ControlTray: video on/off, mic on/off icons
4. Trigger toast notifications: success, error, warning, info types
5. Check loading skeleton appearance
6. Trigger auth error boundary (if possible)
7. Open Network tab: verify no Material Symbols font requests

### Edge Cases
- Icons in disabled/loading states
- Icons with custom colors (check color inheritance)
- Icons at different viewport sizes

---

## 10. Dependencies

### External Libraries
- `lucide-react`: latest (currently ~0.460.0)

### Other Sessions
- **Depends on**:
  - `phase04-session01-tailwind-foundation` (Tailwind size-* utilities)
  - `phase04-session02-utility-setup` (cn() for className composition)
- **Depended by**:
  - `phase04-session06-theme-system` (requires Sun, Moon, Monitor icons)

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
