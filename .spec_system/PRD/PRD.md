# Chat with Google Maps - Product Requirements Document

## Overview

A voice-driven conversational interface for exploring locations using Gemini Live API and Photorealistic 3D Maps. Users can have real-time voice conversations with an AI assistant that can navigate 3D maps, provide location information, and help plan itineraries.

## Goals

1. Establish robust developer tooling and quality gates (type checking, linting, formatting, testing)
2. Build a reliable voice-to-map interaction pipeline with Gemini Live API
3. Create an intuitive 3D map exploration experience with location grounding
4. Enable interactive itinerary planning through natural conversation

## Deployment Philosophy

**This project is deployment-agnostic by design.** The codebase should work on multiple platforms without modification, with self-hosting as the long-term goal.

### Core Principles

1. **No Platform Lock-in**: All code uses standard Web APIs and runs on any JavaScript runtime
2. **Multiple Deployment Options**: Vercel works now, self-hosting available when needed
3. **Zero Proprietary Dependencies**: No reliance on vendor-specific APIs or runtime features
4. **Self-Hosting Ready**: Docker configuration provided for when you want full control

### Why Deployment Agnostic?

| Benefit | Details |
|---------|---------|
| **Flexibility** | Switch platforms without code changes |
| **Cost Control** | Move to self-hosting when scale demands it |
| **Data Sovereignty** | Option to self-host for full data control |
| **No Lock-in** | Never trapped by a single vendor |

### Supported Deployment Targets

```
All deployment options supported with same codebase:
┌─────────────────────────────────────────────────────────────┐
│ Serverless (Quick Setup)                                    │
│   - Vercel (current, works out of box)                      │
│   - Cloudflare Workers                                      │
│   - AWS Lambda                                              │
├─────────────────────────────────────────────────────────────┤
│ Self-Hosted (Long-term Target)                              │
│   - Docker Compose                                          │
│   - VPS (Hetzner, DigitalOcean, Linode)                     │
│   - Kubernetes                                              │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Requirements

Every backend component must:
- Use standard Web APIs (Request/Response)
- Work on Vercel AND be self-hostable via Docker
- Avoid vendor-specific features that prevent portability
- Be testable locally without cloud services

## Phases

| Phase | Name | Sessions | Status |
|-------|------|----------|--------|
| 00 | Developer Tooling & Quality Foundation | 5 | Complete |
| 01 | Backend API Layer (Hono) | 4 | Complete |
| 02 | Database Layer (PostgreSQL + Drizzle) | 4 | Complete |
| 03 | Authentication (Better Auth) | 3 | Complete |
| 04 | Frontend Overhaul | 6 | Not Started |

## Phase 00: Developer Tooling & Quality Foundation

### Objectives

1. Set up comprehensive TypeScript type checking with strict configuration
2. Configure ESLint for code quality and consistency
3. Set up Prettier for code formatting
4. Establish unit testing framework with Vitest
5. Configure pre-commit hooks for automated quality checks

### Sessions (To Be Defined)

Use `/nextsession` to get recommendations for sessions to implement.

## Phase 01: Backend API Layer (Hono)

### Overview

Add a lightweight backend API layer using Hono. This enables server-side API key protection, future authentication, and database access while remaining **vendor-neutral** (works on Vercel, Cloudflare, AWS, or self-hosted).

### Why Hono (Research Summary)

| Framework | Portability | Size | Better Auth Support | Notes |
|-----------|-------------|------|---------------------|-------|
| **Hono** ✅ | Excellent | ~14KB | Native integration | Web Standards, runs everywhere |
| Express | Good | ~200KB | Via adapter | Legacy, heavier |
| Fastify | Good | ~100KB | Via adapter | More opinionated |
| Next.js API | Vercel-optimized | N/A | Native | Framework lock-in |

**Hono Advantages:**
- **Vendor Neutral**: Runs on Vercel, Cloudflare Workers, AWS Lambda, Deno Deploy, Bun, Node.js
- **Web Standards**: Uses standard Request/Response objects (portable code)
- **Zero Config on Vercel**: Native support, Fluid Compute benefits
- **Lightweight**: ~14KB, minimal overhead
- **TypeScript First**: Excellent type inference and RPC support
- **Better Auth Integration**: Official example in Hono docs

### Objectives

1. Set up Hono backend in `/api` directory
2. Configure Vite to proxy API requests in development
3. Move sensitive API keys to server-side environment
4. Create API routes for Gemini and Maps proxying
5. Verify deployment works on Vercel and document alternatives

### Deployment Portability

```
┌─────────────────────────────────────────────────────────────┐
│                     Same Hono Code                          │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│   Vercel    │ Cloudflare  │ AWS Lambda  │   Self-Hosted    │
│  (current)  │   Workers   │             │   (Node/Bun)     │
├─────────────┼─────────────┼─────────────┼──────────────────┤
│ Zero config │ wrangler    │ SST/Serverless│ docker compose │
└─────────────┴─────────────┴─────────────┴──────────────────┘
```

### Sessions (To Be Defined)

Use `/nextsession` to get recommendations for sessions to implement.

### Implementation Steps

#### Session 1: Hono Setup & Configuration
1. Install `hono` package
2. Create `/api/index.ts` with basic Hono app
3. Configure Vite dev server proxy for `/api/*`
4. Add health check endpoint (`GET /api/health`)
5. Verify local development works
6. Deploy and verify on Vercel

#### Session 2: API Key Protection
1. Move `GEMINI_API_KEY` to server-side only (remove `VITE_` prefix)
2. Move `GOOGLE_MAPS_API_KEY` to server-side only
3. Create `/api/gemini/*` proxy routes
4. Create `/api/maps/*` proxy routes
5. Update React client to use proxied endpoints
6. Verify API keys are no longer exposed in browser

### Architecture After Phase 01

```
┌─────────────────────────────────────────────────────────────┐
│                    Deployment (Vercel/etc)                   │
├─────────────────────────┬───────────────────────────────────┤
│   Static Assets (CDN)   │   Serverless Functions            │
│                         │                                   │
│   React + Vite App      │   /api/* → Hono                   │
│   (no API keys)         │     ├── /api/health               │
│                         │     ├── /api/gemini/* → Gemini    │
│                         │     └── /api/maps/* → Google Maps │
└─────────────────────────┴───────────────────────────────────┘
```

### References

- [Hono on Vercel](https://vercel.com/docs/frameworks/backend/hono)
- [Hono Getting Started](https://hono.dev/docs/getting-started/vercel)
- [Hono + Cloudflare Workers](https://hono.dev/docs/getting-started/cloudflare-workers)
- [Hono + Node.js](https://hono.dev/docs/getting-started/nodejs)

---

## Phase 02: Database Layer (PostgreSQL + Drizzle)

### Overview

Add a PostgreSQL database with Drizzle ORM. This provides persistent storage for user data, sessions, and future features (saved itineraries, preferences) while remaining **vendor-neutral**.

### Why PostgreSQL + Drizzle (Research Summary)

#### Database Choice

| Database | License | Self-Hostable | Notes |
|----------|---------|---------------|-------|
| **PostgreSQL** ✅ | PostgreSQL (OSI) | Yes | Industry standard, full-featured |
| MySQL | GPL | Yes | Less feature-rich |
| SQLite | Public Domain | Yes | Limited for multi-user |
| MongoDB | SSPL | Partial | Different paradigm, license concerns |

**PostgreSQL Deployment Options:**

| Option | Open Source | Self-Hosted | Notes |
|--------|-------------|-------------|-------|
| **Docker PostgreSQL** ✅ | Yes | Yes | Recommended for dev + prod |
| Bare metal PostgreSQL | Yes | Yes | Traditional server deployment |
| Kubernetes (via Helm) | Yes | Yes | For orchestrated environments |

**Recommendation**: **Self-hosted PostgreSQL** via Docker. Fully open source, no vendor dependency, same setup for dev and prod.

#### ORM Choice

| ORM | Type Safety | Bundle Size | Better Auth | Migration |
|-----|-------------|-------------|-------------|-----------|
| **Drizzle** ✅ | Excellent | ~50KB | Native adapter | CLI |
| Prisma | Excellent | ~2MB | Native adapter | CLI |
| Kysely | Excellent | ~30KB | Native adapter | Manual |
| TypeORM | Good | ~500KB | Community | CLI |

**Drizzle Advantages:**
- Lightweight (~50KB vs Prisma's ~2MB)
- SQL-like syntax (no new DSL to learn)
- Better Auth auto-generates schemas via CLI
- Works with any PostgreSQL provider
- Edge-compatible (runs on Cloudflare Workers)

### Objectives

1. Set up Drizzle ORM with PostgreSQL adapter
2. Configure database connection with connection pooling
3. Create initial schema (prepare for auth tables)
4. Set up migrations workflow
5. Verify works locally and in production
6. Document switching database providers

### Database Portability

```typescript
// Drizzle works with any PostgreSQL driver
import { drizzle } from 'drizzle-orm/node-postgres';  // Node.js (pg)
import { drizzle } from 'drizzle-orm/postgres-js';    // postgres.js
```

### Local Development Setup

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: chat_maps
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### Sessions (To Be Defined)

Use `/nextsession` to get recommendations for sessions to implement.

### Implementation Steps

#### Session 1: Drizzle Setup & Configuration
1. Install `drizzle-orm` and `drizzle-kit`
2. Install PostgreSQL driver (`pg` or `postgres`)
3. Create `docker-compose.yml` for local PostgreSQL
4. Create `/api/db/index.ts` with database connection
5. Create `/api/db/schema.ts` with initial schema
6. Configure `drizzle.config.ts` for migrations
7. Add `DATABASE_URL` to environment variables

#### Session 2: Migrations & Verification
1. Start local PostgreSQL with `docker compose up -d`
2. Generate initial migration with `drizzle-kit generate`
3. Apply migration with `drizzle-kit migrate`
4. Create test endpoint to verify database connection
5. Test locally with Docker PostgreSQL
6. Document production PostgreSQL deployment options

### Schema Preview (Prepared for Auth)

```typescript
// api/db/schema.ts
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// User table (Better Auth will extend this)
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  emailVerified: boolean('email_verified').default(false),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Session table (Better Auth will extend this)
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### References

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Drizzle + PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Better Auth Database Docs](https://www.better-auth.com/docs/concepts/database)

---

## Phase 03: Authentication (Better Auth)

### Overview

Implement user authentication using Better Auth, an open-source authentication library. Combined with Hono backend and PostgreSQL database from previous phases, this provides a **complete, vendor-neutral auth stack**.

### Why Better Auth (Research Summary)

| Option | Vendor Lock-in | Pricing | Self-Hostable | Control |
|--------|----------------|---------|---------------|---------|
| **Better Auth** ✅ | None | Free/OSS | Yes | Full |
| Clerk | High | $0.02/MAU | No | Limited |
| Auth0 | High | Complex | No | Limited |
| Firebase Auth | High | Usage-based | No | Limited |
| Supabase Auth | Medium | Bundled | Yes | Medium |

**Better Auth Advantages:**
- **Open Source**: MIT license, full code access
- **No Vendor Lock-in**: Runs anywhere Hono runs
- **No Per-User Pricing**: No surprise bills at scale
- **Framework Agnostic**: Works with React, Vue, Svelte, etc.
- **Native Integrations**: Hono + Drizzle adapters built-in
- **Full Control**: Customize every aspect of auth flow
- **Plugin System**: Add features like 2FA, organizations, etc.

### Objectives

1. Install and configure Better Auth with Drizzle adapter
2. Set up auth routes in Hono backend
3. Generate and apply auth database schema
4. Create React auth client with hooks
5. Implement sign-in/sign-up UI components
6. Add protected routes and session management

### Auth Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Complete Auth Stack                       │
├─────────────────────────┬───────────────────────────────────┤
│   React Client          │   Hono Backend                    │
│                         │                                   │
│   better-auth/react     │   /api/auth/* → Better Auth       │
│   ├── useSession()      │     ├── POST /sign-in             │
│   ├── useUser()         │     ├── POST /sign-up             │
│   └── signIn/signOut    │     ├── POST /sign-out            │
│                         │     └── GET /session              │
├─────────────────────────┴───────────────────────────────────┤
│                      PostgreSQL                              │
│   ├── users          (managed by Better Auth)               │
│   ├── sessions       (managed by Better Auth)               │
│   ├── accounts       (OAuth providers)                      │
│   └── verifications  (email verification)                   │
└─────────────────────────────────────────────────────────────┘
```

### Sessions (To Be Defined)

Use `/nextsession` to get recommendations for sessions to implement.

### Implementation Steps

#### Session 1: Better Auth Server Setup
1. Install `better-auth`
2. Create `/api/auth.ts` with Better Auth configuration
3. Configure Drizzle adapter with existing database
4. Run `npx better-auth generate` to create auth schema
5. Apply auth migrations to database
6. Mount auth handler in Hono (`/api/auth/*`)
7. Verify auth endpoints respond

#### Session 2: React Client Integration
1. Install `better-auth` client (same package)
2. Create `/src/lib/auth-client.ts` with client config
3. Create `AuthProvider` context component
4. Implement `useSession` and `useUser` hooks
5. Add sign-in form component
6. Add sign-up form component
7. Verify auth flow works end-to-end

#### Session 3: Protected Routes & UI Polish
1. Create `ProtectedRoute` component
2. Wrap main app content with auth guard
3. Add user menu with profile/logout
4. Style auth forms to match app theme
5. Add loading states and error handling
6. Test complete auth flow

### Code Preview

```typescript
// api/auth.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true },
  session: {
    cookieCache: { enabled: true, maxAge: 60 * 5 }, // 5 min cache
  },
});

// api/index.ts
import { Hono } from 'hono';
import { auth } from './auth';

const app = new Hono();
app.on(['POST', 'GET'], '/auth/*', (c) => auth.handler(c.req.raw));

export default app;
```

```typescript
// src/lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || '',
});

export const { useSession, signIn, signUp, signOut } = authClient;
```

### References

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Better Auth + Hono Example](https://hono.dev/examples/better-auth)
- [Better Auth + Drizzle Adapter](https://www.better-auth.com/docs/adapters/drizzle)
- [Better Auth React Client](https://www.better-auth.com/docs/concepts/client)

---

## Phase 04: Frontend Overhaul

### Overview

Modernize the frontend stack to achieve polished, production-grade visual appearance with smooth animations, consistent design system, and accessible components.

### Current State vs Target State

| Aspect | Current | Target |
|--------|---------|--------|
| **Styling** | Vanilla CSS with custom tokens in `src/index.css` | Tailwind CSS 4 with design tokens |
| **Utilities** | Minimal | clsx + tailwind-merge via `cn()` helper |
| **Components** | Minimal use of `@headlessui/react` | shadcn/ui (Radix primitives + Tailwind) |
| **Icons** | Material Symbols via Google Fonts | Lucide React |
| **Animations** | None | Framer Motion 12 |
| **Theming** | Dark mode only | Dark/light mode toggle |

### Why This Stack (Research Summary)

| Technology | Benefit | Bundle Impact | Notes |
|------------|---------|---------------|-------|
| **Tailwind CSS 4** | Utility-first, consistent design | Tree-shaken | Industry standard |
| **shadcn/ui** | Accessible Radix primitives | Copy-paste, no npm | Full control over components |
| **Framer Motion** | Production animations | ~30KB | Best-in-class React animations |
| **Lucide React** | Tree-shakeable icons | Per-icon | No external font dependency |
| **next-themes** | Theme management | ~3KB | Works with Vite |

### Objectives

1. Replace vanilla CSS with Tailwind CSS 4 utilities
2. Establish consistent className composition with `cn()` helper
3. Add smooth animations and micro-interactions
4. Replace custom components with accessible shadcn/ui primitives
5. Migrate icons from Material Symbols to Lucide React
6. Implement dark/light theme toggle

### Frontend Architecture After Phase 04

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Stack                            │
├─────────────────────────────────────────────────────────────┤
│   React 19 + TypeScript + Vite                              │
├─────────────────────────────────────────────────────────────┤
│   Styling Layer                                              │
│   ├── Tailwind CSS 4 (utilities)                            │
│   ├── CSS Variables (design tokens)                         │
│   └── cn() helper (clsx + tailwind-merge)                   │
├─────────────────────────────────────────────────────────────┤
│   Component Layer                                            │
│   ├── shadcn/ui (Radix primitives)                          │
│   │   ├── Button, Dialog, Popover, Sheet                    │
│   │   ├── ScrollArea, Tooltip, Avatar                       │
│   │   └── DropdownMenu                                       │
│   └── Custom components (using shadcn base)                 │
├─────────────────────────────────────────────────────────────┤
│   Animation Layer                                            │
│   ├── Framer Motion (transitions, gestures)                 │
│   └── AnimatePresence (exit animations)                     │
├─────────────────────────────────────────────────────────────┤
│   Icon Layer                                                 │
│   └── Lucide React (tree-shakeable SVG icons)               │
├─────────────────────────────────────────────────────────────┤
│   Theme Layer                                                │
│   ├── next-themes (provider)                                │
│   └── Tailwind dark: variants                               │
└─────────────────────────────────────────────────────────────┘
```

### Sessions (To Be Defined)

Use `/nextsession` to get recommendations for sessions to implement.

### Implementation Steps

#### Session 1: Tailwind CSS 4 Foundation

**Objective**: Replace vanilla CSS with Tailwind utilities while preserving existing design tokens.

**Tasks**:
1. Install dependencies: `tailwindcss`, `@tailwindcss/postcss`, `postcss`
2. Configure PostCSS (`postcss.config.js`)
3. Create Tailwind config (`tailwind.config.ts`)
   - Map existing CSS tokens (`--Neutral-*`, `--Blue-*`, etc.) to Tailwind theme
   - Configure breakpoints (preserve `--breakpoint-md: 768px`)
   - Set up dark mode strategy
4. Update `src/index.css` with Tailwind directives (`@import "tailwindcss"`)
5. Migrate leaf components first (buttons, badges)
6. Progress to layout components (Sidebar, ControlTray)

**Success Criteria**:
- All new styles use Tailwind utilities
- Existing components still render correctly
- Build size remains reasonable

#### Session 2: Utility Setup (clsx + tailwind-merge)

**Objective**: Create consistent className composition pattern.

**Tasks**:
1. Install dependencies: `clsx`, `tailwind-merge`
2. Create utility helper (`src/lib/utils.ts`):
   ```typescript
   import { clsx, type ClassValue } from 'clsx'
   import { twMerge } from 'tailwind-merge'

   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs))
   }
   ```
3. Replace any existing `classnames` usage with new `cn()` helper
4. Remove `classnames` dependency if present

**Success Criteria**:
- Single utility for all className composition
- No conflicts between Tailwind classes

#### Session 3: Framer Motion Animations

**Objective**: Add smooth animations and micro-interactions throughout the app.

**Tasks**:
1. Install Framer Motion: `npm install framer-motion`
2. Create animation variants (`src/lib/animations.ts`):
   ```typescript
   export const fadeIn = {
     initial: { opacity: 0 },
     animate: { opacity: 1 },
     exit: { opacity: 0 }
   }

   export const slideInLeft = {
     initial: { x: -20, opacity: 0 },
     animate: { x: 0, opacity: 1 },
     exit: { x: -20, opacity: 0 }
   }

   export const scaleIn = {
     initial: { scale: 0.95, opacity: 0 },
     animate: { scale: 1, opacity: 1 },
     exit: { scale: 0.95, opacity: 0 }
   }
   ```
3. Animate key components:

   | Component | Animation |
   |-----------|-----------|
   | Chat messages | Staggered fade-in from bottom |
   | Sidebar | Slide in/out from right |
   | PopUp (welcome) | Scale + fade with backdrop blur |
   | ControlTray buttons | Hover scale, press feedback |
   | ErrorScreen | Fade in with shake on error |
   | Markers (Map3D) | Bounce on appear |

4. Add `AnimatePresence` wrapper for exit animations
5. Implement micro-interactions (button hover/active, input focus, loading spinners)

**Success Criteria**:
- All major UI transitions are animated
- Animations feel snappy (< 300ms for most)
- No jank or layout shift during animations

#### Session 4: shadcn/ui Components

**Objective**: Replace custom components with accessible, polished shadcn/ui primitives.

**Tasks**:
1. Initialize shadcn/ui for Vite: `npx shadcn@latest init`
   - Select: TypeScript, Tailwind CSS, `src/components/ui` path
   - Configure `components.json`
2. Add base components:
   ```bash
   npx shadcn@latest add button dialog popover scroll-area sheet tooltip avatar dropdown-menu
   ```
3. Migrate existing components:

   | Current | Replace With |
   |---------|--------------|
   | `PopUp` (welcome modal) | `Dialog` |
   | `Sidebar` | `Sheet` (slide-over panel) |
   | `SourcesPopover` | `Popover` |
   | Custom buttons | `Button` variants |
   | Scrollable areas | `ScrollArea` |

4. Delete legacy CSS files (`PopUp.css`, `sources-popover.css`)
5. Customize theme in `src/components/ui/*.tsx` to match brand

**Success Criteria**:
- All interactive components use Radix primitives
- Keyboard navigation works throughout
- Screen reader accessible

#### Session 5: Lucide React Icons

**Objective**: Replace Material Symbols with consistent, customizable Lucide icons.

**Tasks**:
1. Install Lucide React: `npm install lucide-react`
2. Create icon mapping and update components:
   ```tsx
   // Before
   <span className="material-symbols-outlined">settings</span>

   // After
   import { Settings } from 'lucide-react'
   <Settings className="size-5" />
   ```
3. Icon mapping reference:

   | Material Symbol | Lucide Equivalent |
   |-----------------|-------------------|
   | `settings` | `Settings` |
   | `mic` | `Mic` |
   | `mic_off` | `MicOff` |
   | `send` | `Send` |
   | `close` | `X` |
   | `menu` | `Menu` |
   | `place` | `MapPin` |
   | `error` | `AlertCircle` |

4. Remove Material Symbols font link from `index.html`
5. Remove any `.material-symbols-*` CSS

**Success Criteria**:
- All icons use Lucide
- Consistent sizing via Tailwind (`size-*`)
- No external font dependencies for icons

#### Session 6: Theme System

**Objective**: Add dark/light mode toggle with system preference detection.

**Tasks**:
1. Install next-themes: `npm install next-themes`
2. Create theme provider (`src/providers/theme-provider.tsx`):
   ```tsx
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
3. Update Tailwind config: `darkMode: 'class'`
4. Add theme toggle component (using shadcn/ui `DropdownMenu` or `Button`)
   - Icons: `Sun`, `Moon`, `Monitor` (system)
5. Update color usage with `dark:` variants
6. Ensure sufficient contrast in both modes

**Success Criteria**:
- Theme persists across sessions
- Respects system preference on first visit
- Smooth transition between themes (or instant if preferred)

### Component Migration Checklist

| Component | Tailwind | Framer | shadcn | Lucide | Theme |
|-----------|:--------:|:------:|:------:|:------:|:-----:|
| `App.tsx` | [ ] | [ ] | - | - | [ ] |
| `StreamingConsole` | [ ] | [ ] | [ ] | [ ] | [ ] |
| `ControlTray` | [ ] | [ ] | [ ] | [ ] | [ ] |
| `Sidebar` | [ ] | [ ] | [ ] | [ ] | [ ] |
| `PopUp` | [ ] | [ ] | [ ] | [ ] | [ ] |
| `ErrorScreen` | [ ] | [ ] | - | [ ] | [ ] |
| `Map3D` | [ ] | [ ] | - | - | [ ] |
| `SourcesPopover` | [ ] | [ ] | [ ] | - | [ ] |

### Dependencies Summary

**Add**:
```json
{
  "tailwindcss": "^4.0.0",
  "@tailwindcss/postcss": "^4.0.0",
  "postcss": "^8.x",
  "clsx": "^2.x",
  "tailwind-merge": "^2.x",
  "framer-motion": "^12.x",
  "lucide-react": "^0.x",
  "next-themes": "^0.x"
}
```

**Remove**:
```json
{
  "classnames": "remove after Session 2"
}
```

**shadcn/ui** (copy-paste, not npm): Components copied to `src/components/ui/`

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Large migration scope | Migrate incrementally, component by component |
| Breaking existing styles | Keep old CSS until component fully migrated |
| Bundle size increase | Tree-shake unused components, lazy load where appropriate |
| Animation performance | Use `transform` and `opacity` only, avoid layout animations |
| Accessibility regression | Test with keyboard/screen reader after each shadcn migration |

### References

- [Tailwind CSS 4 Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/icons/)
- [next-themes](https://github.com/pacocoursey/next-themes)

---

## Technical Stack

### Frontend (Existing)
- React 19 + TypeScript
- Vite (build tooling)
- Zustand (state management)
- @vis.gl/react-google-maps (map rendering)
- @google/genai (Gemini SDK for voice/AI)

### Developer Tooling (Phase 00)
- Vitest (testing - to be set up)
- ESLint + Prettier (linting/formatting - to be set up)

### Backend API (Phase 01)
- Hono (lightweight, vendor-neutral web framework)
- Vercel Serverless Functions (current deployment, swappable)

### Database (Phase 02)
- PostgreSQL (self-hosted via Docker, fully open source)
- Drizzle ORM (type-safe, lightweight, open source)

### Authentication (Phase 03)
- Better Auth (open-source, vendor-neutral)
- better-auth/react (React client hooks)

### Frontend Modernization (Phase 04)
- Tailwind CSS 4 (utility-first styling)
- shadcn/ui (accessible Radix primitives)
- Framer Motion 12 (animations)
- Lucide React (tree-shakeable icons)
- next-themes (dark/light mode)

## Success Criteria

### Phase 00: Developer Tooling
- [x] Zero TypeScript errors with strict mode enabled
- [x] ESLint configured with no warnings in codebase
- [x] Prettier formatting applied consistently
- [x] Unit test framework operational with example tests
- [x] Pre-commit hooks blocking commits with quality issues
- [x] CI-ready quality checks (can run in pipeline)

### Phase 01: Backend API Layer
- [x] Hono backend running at `/api/*` endpoints
- [x] Health check endpoint responding (`GET /api/health`)
- [x] API keys moved to server-side (not exposed in browser)
- [x] Gemini API calls proxied through backend
- [x] Maps API calls proxied through backend
- [x] Works on Vercel deployment
- [x] Docker configuration for self-hosted deployment
- [x] Documentation for deploying to alternative platforms

### Phase 02: Database Layer
- [x] PostgreSQL running via Docker (local dev)
- [x] docker-compose.yml configured for local development
- [x] Drizzle ORM configured with type-safe schema
- [x] Database connection working in development and production
- [x] Migrations workflow established (`drizzle-kit generate/migrate`)
- [x] Test endpoint verifying database connectivity
- [x] Documentation for production PostgreSQL deployment

### Phase 03: Authentication
- [x] Better Auth configured with Drizzle adapter
- [x] Auth routes mounted in Hono (`/api/auth/*`)
- [x] Sign-up flow working (email/password)
- [x] Sign-in flow working (email/password)
- [x] Session management with secure cookies
- [x] React client hooks working (`useSession`, `useUser`)
- [x] Protected routes redirecting unauthenticated users
- [x] User can view profile and log out
- [x] Environment variables properly configured for dev/prod

### Phase 04: Frontend Overhaul
- [ ] All components use Tailwind utilities (no vanilla CSS)
- [ ] Consistent className composition via `cn()`
- [ ] Key UI transitions animated with Framer Motion
- [ ] Interactive components use shadcn/ui (Radix)
- [ ] Icons from Lucide React (no external font dependencies)
- [ ] Dark/light theme toggle functional
- [ ] Lighthouse accessibility score >= 90
- [ ] No TypeScript errors
- [ ] All existing tests pass

## Open Source & Vendor Neutrality Checklist

The entire stack is **100% open source** with no vendor dependencies:

| Component | License | Self-Hostable |
|-----------|---------|---------------|
| Hono | MIT | ✅ |
| PostgreSQL | PostgreSQL License (OSI) | ✅ |
| Drizzle ORM | Apache 2.0 | ✅ |
| Better Auth | MIT | ✅ |
| Tailwind CSS | MIT | ✅ |
| shadcn/ui | MIT | ✅ |
| Framer Motion | MIT | ✅ |
| Lucide React | ISC | ✅ |
| next-themes | MIT | ✅ |

**Verification Criteria:**

- [x] **Backend**: Hono code runs on Vercel, Cloudflare, AWS, Deno, Bun, Node.js
- [x] **Database**: PostgreSQL runs via Docker, deployable anywhere
- [x] **ORM**: Drizzle schema portable across any PostgreSQL instance
- [x] **Auth**: Better Auth is self-hostable, no external service dependency
- [ ] **Frontend**: All UI libraries are open source with no vendor lock-in
- [x] **Zero SaaS Dependencies**: No required third-party services
- [x] **Deployment**: Documentation exists for at least 2 deployment targets
