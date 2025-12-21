# Session 06: Theme System

**Session ID**: `phase04-session06-theme-system`
**Status**: Not Started
**Estimated Tasks**: ~15-20
**Estimated Duration**: 2-3 hours

---

## Objective

Implement dark/light theme toggle with system preference detection, theme persistence, and smooth visual transitions between modes.

---

## Scope

### In Scope (MVP)
- Install next-themes package
- Create ThemeProvider wrapper component
- Configure Tailwind for class-based dark mode
- Add theme toggle component (dark/light/system)
- Update color usage with `dark:` variants
- Ensure sufficient contrast in both modes
- Persist theme preference across sessions

### Out of Scope
- Custom theme colors beyond dark/light
- Theme customization UI
- Per-component theme overrides

---

## Prerequisites

- [ ] Session 01 completed (Tailwind CSS 4 configured)
- [ ] Session 02 completed (cn() utility available)
- [ ] Session 04 completed (shadcn/ui components available)
- [ ] Session 05 completed (Lucide icons available)

---

## Deliverables

1. next-themes package installed
2. ThemeProvider component wrapping app
3. Theme toggle component with Sun/Moon/Monitor icons
4. All components supporting dark/light modes
5. Theme preference persisted in localStorage

---

## Implementation Details

### Dependencies to Install

```bash
npm install next-themes
```

### Theme Provider

```tsx
// src/providers/theme-provider.tsx
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
```

### App Integration

```tsx
// src/main.tsx or src/App.tsx
import { ThemeProvider } from '@/providers/theme-provider'

function App() {
  return (
    <ThemeProvider>
      {/* rest of app */}
    </ThemeProvider>
  )
}
```

### Theme Toggle Component

```tsx
// src/components/theme-toggle.tsx
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 size-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 size-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 size-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### Tailwind Configuration

```typescript
// tailwind.config.ts
export default {
  darkMode: 'class',
  // ...
}
```

### Dark Mode Utility Pattern

```tsx
// Use dark: variant for theme-aware colors
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-900 dark:text-gray-100">
    Themed content
  </p>
</div>
```

### Theme Toggle Placement

Add theme toggle to:
- User dropdown menu (primary location)
- Settings panel (if exists)

---

## Success Criteria

- [ ] next-themes installed and configured
- [ ] ThemeProvider wrapping entire app
- [ ] Theme toggle accessible from user menu
- [ ] Dark mode renders correctly
- [ ] Light mode renders correctly
- [ ] System preference detection working
- [ ] Theme persists across page reloads
- [ ] Theme persists across sessions
- [ ] Sufficient contrast in both modes (WCAG AA)
- [ ] No flash of wrong theme on page load
- [ ] TypeScript strict mode passing
- [ ] ESLint passing with no warnings
