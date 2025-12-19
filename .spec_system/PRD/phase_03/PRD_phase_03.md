# PRD Phase 03: Authentication (Better Auth)

**Status**: In Progress
**Sessions**: 4
**Estimated Duration**: 2-3 days

**Progress**: 1/4 sessions (25%)

---

## Overview

Implement user authentication using Better Auth, an open-source authentication library. Combined with Hono backend and PostgreSQL database from previous phases, this provides a **complete, vendor-neutral auth stack** with no external service dependencies.

**Auth Philosophy**: This phase uses 100% open-source components. Better Auth is self-hosted, runs anywhere Hono runs, and has no per-user pricing. Full control over authentication flows and user data is maintained.

---

## Progress Tracker

| Session | Name | Status | Est. Tasks | Validated |
|---------|------|--------|------------|-----------|
| 01 | Better Auth Server Setup | Complete | 22 | 2025-12-19 |
| 02 | React Client Integration | Not Started | ~25 | - |
| 03 | Protected Routes & UI | Not Started | ~20 | - |
| 04 | Social OAuth (Optional) | Not Started | ~20 | - |

---

## Completed Sessions

### Session 01: Better Auth Server Setup

**Completed**: 2025-12-19

Established server-side authentication infrastructure using Better Auth with Drizzle adapter. Created accounts and verifications tables, mounted auth routes on Hono at `/api/auth/*`, and configured CORS for auth requests.

**Key Deliverables**:
- `api/_lib/auth.ts` - Better Auth server configuration
- `api/_db/schema/accounts.ts` - OAuth accounts table
- `api/_db/schema/verifications.ts` - Verification tokens table
- `docs/AUTH.md` - Authentication documentation
- Auth routes mounted at `/api/auth/*`

---

## Upcoming Sessions

- Session 02: React Client Integration

---

## Objectives

1. **Server Authentication**: Install and configure Better Auth with Drizzle adapter on Hono backend
2. **Client Integration**: Create React auth client with hooks for session management
3. **Protected Routes**: Implement route protection and user-aware UI components
4. **Social OAuth**: (Optional) Add Google/GitHub OAuth providers for social login
5. **Security**: Ensure secure cookie handling, CSRF protection, and proper session management

---

## Prerequisites

- Phase 00 completed (Developer Tooling & Quality Foundation)
- Phase 01 completed (Backend API Layer - Hono)
- Phase 02 completed (Database Layer - PostgreSQL + Drizzle)
- PostgreSQL database running with auth-ready schema (users, sessions tables)

---

## Technical Considerations

### Architecture

```
+-----------------------------------------------------------------+
|                    Complete Auth Stack                           |
+-------------------------+---------------------------------------+
|   React Client          |   Hono Backend                        |
|                         |                                       |
|   better-auth/react     |   /api/auth/* -> Better Auth          |
|   +-- useSession()      |     +-- POST /sign-in                 |
|   +-- useUser()         |     +-- POST /sign-up                 |
|   +-- signIn/signOut    |     +-- POST /sign-out                |
|                         |     +-- GET /session                  |
+-------------------------+---------------------------------------+
|                      PostgreSQL                                  |
|   +-- users          (managed by Better Auth)                   |
|   +-- sessions       (managed by Better Auth)                   |
|   +-- accounts       (OAuth providers)                          |
|   +-- verifications  (email verification)                       |
+-----------------------------------------------------------------+
```

### Why Better Auth

| Factor | Better Auth | Clerk | Auth0 | Firebase |
|--------|-------------|-------|-------|----------|
| **Vendor Lock-in** | None | High | High | High |
| **Pricing** | Free/OSS | $0.02/MAU | Complex | Usage-based |
| **Self-Hostable** | Yes | No | No | No |
| **Control** | Full | Limited | Limited | Limited |
| **Hono Support** | Native | Adapter | Adapter | Adapter |
| **Drizzle Support** | Native | N/A | N/A | N/A |

### Technologies

- Better Auth (authentication framework)
- better-auth/react (React client hooks)
- Drizzle adapter (database integration)
- Hono middleware (request handling)
- httpOnly cookies (secure sessions)

### Risks

- **Session Management**: Cookies must be configured correctly for security
  - Mitigation: Use Better Auth defaults with proper CORS settings
- **OAuth Complexity**: Social providers require app registration and callback URLs
  - Mitigation: Make OAuth optional (Session 04), email/password works without it
- **Schema Changes**: Better Auth may need additional database tables
  - Mitigation: Run `better-auth generate` and review schema changes before applying

---

## Success Criteria

Phase complete when:
- [ ] All 4 sessions completed
- [x] Better Auth configured with Drizzle adapter
- [x] Auth routes mounted in Hono (`/api/auth/*`)
- [ ] Sign-up flow working (email/password)
- [ ] Sign-in flow working (email/password)
- [ ] Session management with secure cookies
- [ ] React client hooks working (`useSession`, `useUser`)
- [ ] Protected routes redirecting unauthenticated users
- [ ] User can view profile and log out
- [x] Environment variables properly configured for dev/prod
- [x] All quality gates still passing (TypeScript, ESLint, Prettier, tests)

---

## Dependencies

### Depends On
- Phase 00: Developer Tooling & Quality Foundation
- Phase 01: Backend API Layer (Hono)
- Phase 02: Database Layer (PostgreSQL + Drizzle)

### Enables
- Future: User-specific saved itineraries
- Future: Conversation history persistence
- Future: User preferences and settings
- Future: Multi-user collaboration features
