# Session Specification

**Session ID**: `phase03-session01-better-auth-server-setup`
**Phase**: 03 - Authentication (Better Auth)
**Status**: Not Started
**Created**: 2025-12-19

---

## 1. Session Overview

This session establishes the server-side authentication infrastructure for the Chat with Google Maps application using Better Auth with Drizzle adapter. Better Auth is an open-source, vendor-neutral authentication library that integrates seamlessly with our existing Hono backend and PostgreSQL/Drizzle stack.

The authentication foundation must be established server-side before any client integration can occur. This session focuses exclusively on the backend configuration: installing Better Auth, configuring the Drizzle adapter to work with our existing database schema, generating and applying the additional auth tables (accounts, verifications), mounting auth routes on Hono, and verifying the endpoints respond correctly.

By the end of this session, the API server will expose fully functional auth endpoints at `/api/auth/*` that can handle sign-up, sign-in, sign-out, and session management requests. The database will have all required auth tables, and the configuration will be ready for React client integration in Session 02.

---

## 2. Objectives

1. Install and configure Better Auth with Drizzle adapter using existing database connection
2. Generate and apply auth schema additions (accounts, verifications tables) via migrations
3. Mount Better Auth handler on Hono at `/api/auth/*` with proper CORS configuration
4. Verify auth endpoints respond correctly (session endpoint returns empty for unauthenticated)

---

## 3. Prerequisites

### Required Sessions
- [x] `phase02-session04-integration-verification` - Provides working PostgreSQL + Drizzle integration

### Required Tools/Knowledge
- Understanding of Better Auth concepts and configuration
- Familiarity with Drizzle ORM schema definitions
- Knowledge of httpOnly cookie-based session management

### Environment Requirements
- PostgreSQL database running (Docker)
- Node.js 18+
- pnpm package manager
- `.env` configured with `DATABASE_URL`

---

## 4. Scope

### In Scope (MVP)
- Install `better-auth` package
- Create `api/_lib/auth.ts` with Better Auth server configuration
- Configure Drizzle adapter using existing `api/_db/client.ts`
- Create `api/_db/schema/accounts.ts` for OAuth accounts table
- Create `api/_db/schema/verifications.ts` for verification tokens table
- Generate migration for new auth tables
- Apply migration to database
- Mount auth handler in Hono at `/api/auth/*`
- Configure CORS for auth requests
- Add auth environment variables (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`)
- Update `.env.example` with auth variables
- Create `docs/AUTH.md` documentation
- Add unit tests for auth configuration

### Out of Scope (Deferred)
- React client integration - *Reason: Session 02 deliverable*
- Sign-in/sign-up UI components - *Reason: Session 02 deliverable*
- Protected routes and auth guards - *Reason: Session 03 deliverable*
- OAuth social providers (Google, GitHub) - *Reason: Future enhancement*
- Email verification flow - *Reason: Future enhancement*
- Password reset functionality - *Reason: Future enhancement*

---

## 5. Technical Approach

### Architecture

```
+-------------------------------------------------------------------+
|                     Better Auth Server Setup                       |
+-------------------------------------------------------------------+
|                                                                    |
|   api/_lib/auth.ts                                                 |
|   +----------------------------------------------------------+    |
|   | betterAuth({                                              |    |
|   |   database: drizzleAdapter(db, { provider: 'pg' }),       |    |
|   |   emailAndPassword: { enabled: true },                    |    |
|   |   session: { cookieCache: { enabled: true } },            |    |
|   |   trustedOrigins: [BETTER_AUTH_URL]                       |    |
|   | })                                                        |    |
|   +----------------------------------------------------------+    |
|                           |                                        |
|                           v                                        |
|   api/_app.ts                                                      |
|   +----------------------------------------------------------+    |
|   | app.on(['POST', 'GET'], '/api/auth/*', authHandler)       |    |
|   +----------------------------------------------------------+    |
|                           |                                        |
|                           v                                        |
|   PostgreSQL                                                       |
|   +----------------------------------------------------------+    |
|   | users | sessions | accounts | verifications               |    |
|   +----------------------------------------------------------+    |
|                                                                    |
+-------------------------------------------------------------------+
```

### Design Patterns
- **Adapter Pattern**: Drizzle adapter abstracts database operations for Better Auth
- **Handler Mounting**: Better Auth provides a single handler for all auth routes
- **Cookie-based Sessions**: httpOnly secure cookies for session management

### Technology Stack
- `better-auth` ^1.x - Authentication framework
- `drizzle-orm` (existing) - Database ORM
- `hono` (existing) - Web framework
- `postgres` (existing) - PostgreSQL driver

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `api/_lib/auth.ts` | Better Auth server configuration with Drizzle adapter | ~50 |
| `api/_db/schema/accounts.ts` | OAuth accounts table schema | ~35 |
| `api/_db/schema/verifications.ts` | Verification tokens table schema | ~30 |
| `api/_lib/__tests__/auth.test.ts` | Auth configuration unit tests | ~80 |
| `docs/AUTH.md` | Authentication setup documentation | ~150 |
| `drizzle/NNNN_auth_tables.sql` | Migration for auth tables | ~40 |

### Files to Modify
| File | Changes | Est. Lines |
|------|---------|------------|
| `api/_db/schema/index.ts` | Export accounts and verifications schemas | ~4 |
| `api/_app.ts` | Mount auth handler at `/api/auth/*` | ~10 |
| `.env.example` | Add `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` | ~15 |
| `api/_lib/env.ts` | Add auth environment validation | ~10 |
| `package.json` | Add `better-auth` dependency | ~2 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] `better-auth` package installed and configured
- [ ] Auth configuration created with Drizzle adapter at `api/_lib/auth.ts`
- [ ] Accounts table schema created and exported
- [ ] Verifications table schema created and exported
- [ ] Migration generated for auth tables
- [ ] Migration applied to database (tables exist)
- [ ] Auth routes mounted at `/api/auth/*`
- [ ] `GET /api/auth/session` returns `{ session: null, user: null }` for unauthenticated
- [ ] `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` environment variables configured
- [ ] CORS configured to allow auth requests from trusted origins

### Testing Requirements
- [ ] Unit tests for auth configuration
- [ ] Manual test: `GET /api/auth/session` returns expected response
- [ ] All existing tests still pass

### Quality Gates
- [ ] All files ASCII-encoded (0-127 characters only)
- [ ] Unix LF line endings
- [ ] No TypeScript errors (`pnpm typecheck`)
- [ ] No ESLint warnings (`pnpm lint`)
- [ ] Prettier formatting applied (`pnpm format`)

---

## 8. Implementation Notes

### Key Considerations
- Better Auth expects specific table structures; our existing `users` and `sessions` tables are already compatible
- The `accounts` table links OAuth providers to users (required even for email/password auth)
- The `verifications` table stores email verification and password reset tokens
- Cookie configuration must match frontend domain for auth to work
- `BETTER_AUTH_SECRET` must be at least 32 characters for security

### Potential Challenges
- **Schema Compatibility**: Better Auth schema must align with existing users/sessions tables
  - Mitigation: Review Better Auth docs for required fields; our tables already match
- **Cookie Domain Configuration**: Cookies must be set for correct domain
  - Mitigation: Use `trustedOrigins` config; defaults work for localhost
- **CORS Configuration**: Auth requests need proper CORS headers
  - Mitigation: Better Auth handles CORS when trustedOrigins is configured

### ASCII Reminder
All output files must use ASCII-only characters (0-127). Avoid smart quotes, em-dashes, and non-ASCII symbols.

---

## 9. Testing Strategy

### Unit Tests
- Auth configuration exports `auth` object
- Auth has expected methods (handler, signIn, signUp, signOut)
- Session type exports are correct

### Integration Tests
- Database connection works with auth tables
- Auth tables have correct structure

### Manual Testing
1. Start dev server: `pnpm dev`
2. Start database: `pnpm db:up`
3. Run migrations: `pnpm db:migrate`
4. Test session endpoint: `curl http://localhost:3011/api/auth/session`
5. Verify response: `{"session":null,"user":null}`

### Edge Cases
- Missing `BETTER_AUTH_SECRET` should throw clear error
- Invalid `DATABASE_URL` should fail gracefully
- Unauthenticated requests should return null session (not error)

---

## 10. Dependencies

### External Libraries
- `better-auth`: ^1.x (new dependency)

### Other Sessions
- **Depends on**:
  - `phase02-session04-integration-verification` (database layer)
  - `phase01-session01-hono-setup` (Hono backend)
- **Depended by**:
  - `phase03-session02-react-client-integration` (needs auth server)
  - `phase03-session03-protected-routes-ui` (needs auth server)

---

## 11. File Structure After Session

```
api/
  _lib/
    auth.ts              # NEW - Better Auth configuration
    env.ts               # MODIFIED - Auth env validation
    __tests__/
      auth.test.ts       # NEW - Auth unit tests
  _db/
    schema/
      index.ts           # MODIFIED - Export new schemas
      users.ts           # EXISTING - No changes
      sessions.ts        # EXISTING - No changes
      accounts.ts        # NEW - OAuth accounts table
      verifications.ts   # NEW - Verification tokens table
  _app.ts                # MODIFIED - Mount auth handler

drizzle/
  NNNN_auth_tables.sql   # NEW - Auth tables migration

docs/
  AUTH.md                # NEW - Auth documentation

.env.example             # MODIFIED - Auth env vars
package.json             # MODIFIED - Add better-auth
```

---

## 12. Environment Variables

### Required (New)
```bash
# Authentication (Better Auth)
BETTER_AUTH_SECRET=your-secret-key-minimum-32-characters-long
BETTER_AUTH_URL=http://localhost:5173
```

### Existing (No Changes)
```bash
DATABASE_URL=postgresql://chatmaps:chatmaps_dev_password@localhost:5438/chatmaps
```

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
