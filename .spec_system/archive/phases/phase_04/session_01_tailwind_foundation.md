# Session 01: Tailwind CSS 4 Foundation

**Session ID**: `phase04-session01-tailwind-foundation`
**Status**: Not Started
**Estimated Tasks**: ~20-25
**Estimated Duration**: 2-4 hours

---

## Objective

Replace vanilla CSS with Tailwind CSS 4 utility-first styling while preserving existing design tokens and visual appearance.

---

## Scope

### In Scope (MVP)
- Install Tailwind CSS 4 and PostCSS dependencies
- Configure PostCSS for Tailwind processing
- Create Tailwind config mapping existing CSS tokens to theme
- Update `src/index.css` with Tailwind directives
- Migrate leaf components first (buttons, badges)
- Progress to layout components (Sidebar, ControlTray)
- Preserve existing breakpoints and design tokens

### Out of Scope
- shadcn/ui component integration (Session 4)
- Animation additions (Session 3)
- Icon migration (Session 5)
- Theme toggle functionality (Session 6)

---

## Prerequisites

- [ ] Phase 03 completed (Authentication working)
- [ ] All dev tooling operational (TypeScript, ESLint, Prettier, Vitest)
- [ ] Existing CSS tokens documented in `src/index.css`

---

## Deliverables

1. Tailwind CSS 4 installed and configured
2. PostCSS configuration (`postcss.config.js`)
3. Tailwind config (`tailwind.config.ts`) with mapped design tokens
4. Updated `src/index.css` with Tailwind directives
5. Migrated components using Tailwind utilities
6. Build passing with no visual regressions

---

## Implementation Details

### Dependencies to Install

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

### PostCSS Configuration

```javascript
// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {}
  }
}
```

### Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Map existing --Neutral-*, --Blue-*, etc. tokens
      },
      screens: {
        md: '768px', // Preserve existing breakpoint
      },
    },
  },
  darkMode: 'class',
} satisfies Config
```

### CSS Directives

```css
/* src/index.css */
@import "tailwindcss";

/* Preserve custom CSS variables as needed */
```

---

## Success Criteria

- [ ] Tailwind CSS 4 installed and configured
- [ ] PostCSS processing working in dev and build
- [ ] Existing design tokens mapped to Tailwind theme
- [ ] At least 3 components migrated to Tailwind utilities
- [ ] Build size remains reasonable (< 10% increase)
- [ ] No visual regressions in migrated components
- [ ] TypeScript strict mode passing
- [ ] ESLint passing with no warnings
