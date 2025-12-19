# Session 01: Better Auth Server Setup

**Session ID**: `phase03-session01-better-auth-server-setup`
**Status**: Not Started
**Estimated Tasks**: ~25
**Estimated Duration**: 2-3 hours

---

## Objective

Install and configure Better Auth on the Hono backend with Drizzle adapter, generate auth database schema, and verify auth endpoints are responding correctly.

---

## Scope

### In Scope (MVP)
- Install `better-auth` package
- Create `/api/lib/auth.ts` with Better Auth configuration
- Configure Drizzle adapter using existing database connection
- Run `npx better-auth generate` to create auth schema additions
- Apply auth migrations to database
- Mount auth handler in Hono at `/api/auth/*`
- Configure environment variables for auth (secret key, base URL)
- Verify auth endpoints respond (health check)
- Add CORS configuration for auth requests
- Document auth server configuration

### Out of Scope
- React client integration (Session 02)
- Sign-in/sign-up UI components (Session 02)
- Protected routes (Session 03)
- OAuth providers (Session 04)
- Email verification (future enhancement)
- Password reset (future enhancement)

---

## Prerequisites

- [ ] Phase 02 complete (PostgreSQL + Drizzle working)
- [ ] Database running with existing schema
- [ ] Understanding of Better Auth concepts

---

## Deliverables

1. `api/lib/auth.ts` - Better Auth server configuration
2. Updated `api/db/schema.ts` - Auth tables (accounts, verifications)
3. New migration files for auth schema
4. Updated `api/index.ts` - Auth routes mounted
5. Updated `.env.example` - Auth environment variables
6. `docs/AUTH.md` - Authentication setup documentation

---

## Technical Details

### Better Auth Configuration

```typescript
// api/lib/auth.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || 'http://localhost:5173',
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
```

### Hono Auth Routes

```typescript
// api/index.ts
import { Hono } from 'hono';
import { auth } from './lib/auth';

const app = new Hono();

// Mount Better Auth handler
app.on(['POST', 'GET'], '/auth/*', (c) => auth.handler(c.req.raw));

export default app;
```

### Environment Variables

```bash
# .env.example additions
# Authentication
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:5173
```

### Auth Schema Additions

Better Auth will generate additional tables:
- `accounts` - OAuth provider accounts linked to users
- `verifications` - Email/password verification tokens

---

## Success Criteria

- [ ] `better-auth` package installed
- [ ] Auth configuration created with Drizzle adapter
- [ ] Auth schema generated and migrated to database
- [ ] Auth routes mounted at `/api/auth/*`
- [ ] `GET /api/auth/session` returns empty session for unauthenticated requests
- [ ] Environment variables configured (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`)
- [ ] CORS properly configured for auth requests
- [ ] No TypeScript errors
- [ ] All existing tests still pass
- [ ] Documentation explains auth server setup
