# Session 05: Lucide React Icons

**Session ID**: `phase04-session05-lucide-icons`
**Status**: Not Started
**Estimated Tasks**: ~15-20
**Estimated Duration**: 2-3 hours

---

## Objective

Replace Material Symbols font icons with tree-shakeable Lucide React icons, eliminating external font dependencies and enabling consistent icon styling via Tailwind utilities.

---

## Scope

### In Scope (MVP)
- Install Lucide React package
- Create icon mapping from Material Symbols to Lucide equivalents
- Update all components using Material Symbols icons
- Remove Material Symbols font link from `index.html`
- Remove any `.material-symbols-*` CSS classes
- Standardize icon sizing with Tailwind utilities

### Out of Scope
- Custom SVG icon creation
- Animated icons (handled by Framer Motion if needed)
- Icon sprites or bundles

---

## Prerequisites

- [ ] Session 01 completed (Tailwind CSS 4 configured)
- [ ] Session 02 completed (cn() utility available)

---

## Deliverables

1. Lucide React package installed
2. All Material Symbols icons replaced with Lucide equivalents
3. Material Symbols font link removed from `index.html`
4. Material Symbols CSS classes removed
5. Consistent icon sizing via Tailwind (`size-*` utilities)

---

## Implementation Details

### Dependencies to Install

```bash
npm install lucide-react
```

### Icon Mapping Reference

| Material Symbol | Lucide Equivalent | Usage |
|-----------------|-------------------|-------|
| `settings` | `Settings` | Settings menu |
| `mic` | `Mic` | Microphone on |
| `mic_off` | `MicOff` | Microphone muted |
| `send` | `Send` | Send message |
| `close` | `X` | Close/dismiss |
| `menu` | `Menu` | Hamburger menu |
| `place` | `MapPin` | Location marker |
| `error` | `AlertCircle` | Error state |
| `check` | `Check` | Success/confirm |
| `person` | `User` | User/profile |
| `logout` | `LogOut` | Sign out |
| `login` | `LogIn` | Sign in |
| `expand_more` | `ChevronDown` | Expand/dropdown |
| `expand_less` | `ChevronUp` | Collapse |
| `arrow_back` | `ArrowLeft` | Back navigation |
| `info` | `Info` | Information |
| `visibility` | `Eye` | Show/visible |
| `visibility_off` | `EyeOff` | Hide/hidden |

### Migration Pattern

```tsx
// Before
<span className="material-symbols-outlined">settings</span>

// After
import { Settings } from 'lucide-react'
<Settings className="size-5" />
```

### Icon Sizing Convention

| Size Class | Pixels | Usage |
|------------|--------|-------|
| `size-4` | 16px | Inline text icons |
| `size-5` | 20px | Default buttons |
| `size-6` | 24px | Large buttons, headers |
| `size-8` | 32px | Hero icons |

### Files to Update

1. Remove from `index.html`:
```html
<!-- Remove this line -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined..." rel="stylesheet" />
```

2. Remove from CSS (if any):
```css
/* Remove these classes */
.material-symbols-outlined { ... }
```

---

## Success Criteria

- [ ] Lucide React installed
- [ ] All Material Symbols icons replaced with Lucide
- [ ] Material Symbols font link removed from index.html
- [ ] No `.material-symbols-*` CSS remaining
- [ ] Consistent icon sizing via Tailwind size-* utilities
- [ ] No external font dependencies for icons
- [ ] Icons render correctly in all components
- [ ] TypeScript strict mode passing
- [ ] ESLint passing with no warnings
