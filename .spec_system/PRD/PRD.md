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
| 02 | Database Layer (PostgreSQL + Drizzle) | 4 | Not Started |
| 03 | Authentication (Better Auth) | TBD | Not Started |

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
7. Configure social OAuth providers (optional)

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

#### Session 4 (Optional): Social OAuth
1. Configure Google OAuth provider
2. Configure GitHub OAuth provider
3. Add social login buttons
4. Test OAuth flows
5. Document adding additional providers

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
- [ ] PostgreSQL running via Docker (local dev)
- [ ] docker-compose.yml configured for local development
- [ ] Drizzle ORM configured with type-safe schema
- [ ] Database connection working in development and production
- [ ] Migrations workflow established (`drizzle-kit generate/migrate`)
- [ ] Test endpoint verifying database connectivity
- [ ] Documentation for production PostgreSQL deployment

### Phase 03: Authentication
- [ ] Better Auth configured with Drizzle adapter
- [ ] Auth routes mounted in Hono (`/api/auth/*`)
- [ ] Sign-up flow working (email/password)
- [ ] Sign-in flow working (email/password)
- [ ] Session management with secure cookies
- [ ] React client hooks working (`useSession`, `useUser`)
- [ ] Protected routes redirecting unauthenticated users
- [ ] User can view profile and log out
- [ ] Environment variables properly configured for dev/prod

## Open Source & Vendor Neutrality Checklist

The entire backend stack is **100% open source** with no vendor dependencies:

| Component | License | Self-Hostable |
|-----------|---------|---------------|
| Hono | MIT | ✅ |
| PostgreSQL | PostgreSQL License (OSI) | ✅ |
| Drizzle ORM | Apache 2.0 | ✅ |
| Better Auth | MIT | ✅ |

**Verification Criteria:**

- [ ] **Backend**: Hono code runs on Vercel, Cloudflare, AWS, Deno, Bun, Node.js
- [ ] **Database**: PostgreSQL runs via Docker, deployable anywhere
- [ ] **ORM**: Drizzle schema portable across any PostgreSQL instance
- [ ] **Auth**: Better Auth is self-hostable, no external service dependency
- [ ] **Zero SaaS Dependencies**: No required third-party services
- [ ] **Deployment**: Documentation exists for at least 2 deployment targets
