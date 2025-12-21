# Session 02: Utility Setup (clsx + tailwind-merge)

**Session ID**: `phase04-session02-utility-setup`
**Status**: Not Started
**Estimated Tasks**: ~10-15
**Estimated Duration**: 1-2 hours

---

## Objective

Create consistent className composition pattern using `cn()` helper that combines clsx and tailwind-merge for conflict-free class merging.

---

## Scope

### In Scope (MVP)
- Install clsx and tailwind-merge dependencies
- Create `src/lib/utils.ts` with `cn()` helper function
- Replace any existing `classnames` usage with new `cn()` helper
- Update components to use `cn()` for conditional classes
- Remove legacy classnames dependency if present

### Out of Scope
- Component visual changes (just utility setup)
- New component creation
- Animation or theme changes

---

## Prerequisites

- [ ] Session 01 completed (Tailwind CSS 4 configured)
- [ ] Tailwind utilities working in components

---

## Deliverables

1. `clsx` and `tailwind-merge` packages installed
2. `src/lib/utils.ts` with `cn()` helper function
3. All className composition using `cn()` helper
4. Legacy `classnames` package removed (if present)

---

## Implementation Details

### Dependencies to Install

```bash
npm install clsx tailwind-merge
```

### Utility Helper

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Usage Examples

```tsx
// Before
<div className={classNames('base-class', { 'active-class': isActive })} />

// After
import { cn } from '@/lib/utils'
<div className={cn('base-class', isActive && 'active-class')} />
```

```tsx
// Merging Tailwind classes without conflicts
<div className={cn('px-4 py-2', className)} /> // Props className properly overrides
```

---

## Success Criteria

- [ ] clsx and tailwind-merge installed
- [ ] `cn()` helper exported from `src/lib/utils.ts`
- [ ] Single utility for all className composition
- [ ] No conflicts between Tailwind classes when merging
- [ ] Legacy classnames package removed (if applicable)
- [ ] TypeScript strict mode passing
- [ ] ESLint passing with no warnings
