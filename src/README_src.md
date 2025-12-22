# Frontend Source

React 19 + TypeScript frontend with Tailwind CSS 4, shadcn/ui, and Framer Motion.

## Directory Structure

```
src/
├── main.tsx              # Entry point, renders app with providers
├── router.tsx            # React Router with protected routes
├── index.css             # Tailwind CSS imports and CSS variables
├── components/           # React components
│   ├── ui/               # shadcn/ui components (Button, Card, Dialog, etc.)
│   ├── auth/             # Authentication forms (SignIn, SignUp, UserMenu)
│   ├── map-3d/           # 3D Map wrapper and types
│   ├── popup/            # Welcome popup
│   ├── streaming-console/# Chat conversation display
│   └── sources-popover/  # Sources display
├── contexts/             # React contexts
│   └── LiveAPIContext.tsx
├── hooks/                # Custom React hooks
│   └── use-live-api.ts
├── lib/                  # Utilities organized by domain
│   ├── api/              # API clients (Gemini, Maps)
│   ├── audio/            # Audio recording and streaming
│   ├── map/              # Map utilities
│   ├── prompts/          # AI prompt definitions
│   ├── tools/            # Function calling tools
│   ├── worklets/         # Audio worklets
│   ├── animations.ts     # Framer Motion variants
│   └── utils.ts          # cn() helper and utilities
├── pages/                # Route pages (Home, SignIn, SignUp)
├── providers/            # Provider components
│   └── theme-provider.tsx
├── stores/               # Zustand state management
├── test/                 # Test utilities
└── types/                # Global TypeScript types
```

## Key Files

| File                           | Purpose                               |
| ------------------------------ | ------------------------------------- |
| `main.tsx`                     | App entry with ThemeProvider          |
| `router.tsx`                   | Protected routes, auth flow           |
| `index.css`                    | Tailwind + shadcn/ui variables        |
| `lib/utils.ts`                 | `cn()` helper (clsx + tailwind-merge) |
| `lib/animations.ts`            | Shared Framer Motion variants         |
| `providers/theme-provider.tsx` | Dark/light mode via next-themes       |
| `components/ui/*`              | shadcn/ui component library           |

## Run Commands

| Command             | Purpose                   |
| ------------------- | ------------------------- |
| `npm run dev`       | Start dev server on :3003 |
| `npm run build`     | Build for production      |
| `npm run typecheck` | TypeScript type checking  |
| `npm run lint`      | ESLint                    |
| `npm run test`      | Vitest                    |

## Adding Components

### shadcn/ui Components

```bash
npx shadcn@latest add <component-name>
```

Components are copied to `src/components/ui/` for full customization.

### Custom Components

1. Create component in appropriate directory
2. Use `cn()` for className composition
3. Import icons from `lucide-react`
4. Use Framer Motion for animations

Example:

```tsx
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';

export function MyComponent({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn('p-4 bg-background', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Settings className="size-5" />
    </motion.div>
  );
}
```

## Related

- [Frontend Guide](../docs/frontend.md) - Detailed frontend documentation
- [Architecture](../docs/ARCHITECTURE.md) - System overview
