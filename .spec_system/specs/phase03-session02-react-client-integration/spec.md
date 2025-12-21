# Session Specification

**Session ID**: `phase03-session02-react-client-integration`
**Phase**: 03 - Authentication (Better Auth)
**Status**: Not Started
**Created**: 2025-12-19

---

## 1. Session Overview

This session implements the React client-side integration for Better Auth, connecting the frontend to the authentication infrastructure established in Session 01. The server-side auth is already fully operational with email/password authentication, session management, and all necessary database tables in place.

The goal is to create a seamless authentication experience for users by building an auth client, context provider, and sign-in/sign-up form components. Users will be able to create accounts, sign in with their credentials, and maintain authenticated sessions. This forms the foundation for protected routes and user-specific features in subsequent sessions.

This session bridges the gap between backend auth infrastructure and user-facing functionality. Without this integration, users cannot actually authenticate despite the backend being ready. Completing this session enables Session 03 (protected routes) and Session 04 (social OAuth) to proceed.

---

## 2. Objectives

1. Create a configured Better Auth React client that communicates with `/api/auth/*` endpoints
2. Implement an AuthProvider context that exposes authentication state throughout the application
3. Build SignInForm and SignUpForm components with proper validation and error handling
4. Verify end-to-end authentication flow works with the existing backend

---

## 3. Prerequisites

### Required Sessions
- [x] `phase03-session01-better-auth-server-setup` - Server-side Better Auth configured with Drizzle adapter, auth routes mounted at `/api/auth/*`

### Required Tools/Knowledge
- React Context API and hooks
- Controlled form components in React
- TypeScript strict type checking
- Better Auth React client API

### Environment Requirements
- PostgreSQL running via Docker (`npm run db:start`)
- Backend API running (`npm run api:dev` or `npm run dev:all`)
- `BETTER_AUTH_URL` and `BETTER_AUTH_SECRET` environment variables configured

---

## 4. Scope

### In Scope (MVP)
- Auth client configuration in `src/lib/auth-client.ts`
- `AuthProvider` context component with `useAuth` hook
- `SignInForm` component with email/password fields
- `SignUpForm` component with email/password/confirm fields
- Form validation (email format, password length, password match)
- Loading states during auth operations
- Error display with user-friendly messages
- Integration with existing app structure

### Out of Scope (Deferred)
- Protected routes - *Reason: Session 03 scope*
- User profile/menu - *Reason: Session 03 scope*
- Social OAuth buttons - *Reason: Session 04 scope*
- Password reset flow - *Reason: Future enhancement*
- Email verification UI - *Reason: Future enhancement*
- Remember me checkbox - *Reason: Future enhancement*

---

## 5. Technical Approach

### Architecture

```
src/
  lib/
    auth-client.ts          # Better Auth React client
  components/
    auth/
      AuthProvider.tsx      # Context provider with useAuth hook
      SignInForm.tsx        # Email/password sign-in form
      SignUpForm.tsx        # Email/password sign-up form
      AuthError.tsx         # Error message display component
      AuthPage.tsx          # Container page for auth forms
      index.ts              # Barrel export
```

The auth client communicates with the server at `/api/auth/*` endpoints. The `AuthProvider` wraps the application (or auth-relevant portions) and uses Better Auth's `useSession` hook internally to track authentication state. Individual form components call the auth client's `signIn` and `signUp` methods.

### Design Patterns
- **Context Provider Pattern**: AuthProvider exposes `useAuth()` hook for auth state access
- **Controlled Components**: Form inputs managed via React state for validation
- **Composition**: AuthPage composes SignInForm/SignUpForm with switching logic
- **Error Boundaries**: Graceful error handling at form level

### Technology Stack
- `better-auth` (v1.4.7) - Already installed, provides `createAuthClient` for React
- React 19 + TypeScript - Existing frontend framework
- CSS Modules or inline styles - Match existing app patterns

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `src/lib/auth-client.ts` | Better Auth React client configuration | ~30 |
| `src/components/auth/AuthProvider.tsx` | Auth context provider and useAuth hook | ~50 |
| `src/components/auth/SignInForm.tsx` | Email/password sign-in form | ~100 |
| `src/components/auth/SignUpForm.tsx` | Email/password sign-up form with confirm | ~120 |
| `src/components/auth/AuthError.tsx` | Error message display component | ~30 |
| `src/components/auth/AuthPage.tsx` | Container switching between forms | ~60 |
| `src/components/auth/auth.css` | Styles for auth components | ~100 |
| `src/components/auth/index.ts` | Barrel exports | ~10 |

### Files to Modify
| File | Changes | Est. Lines |
|------|---------|------------|
| `src/main.tsx` | Wrap App with AuthProvider | ~5 |
| `src/App.tsx` | Add temporary auth testing UI | ~15 |

---

## 7. Success Criteria

### Functional Requirements
- [x] Auth client exports `signIn`, `signUp`, `signOut`, `useSession` methods
- [x] `AuthProvider` provides `user`, `session`, `isLoading`, `isAuthenticated` via `useAuth()`
- [x] `SignInForm` renders email and password inputs with submit button
- [x] `SignUpForm` renders email, password, confirm password, and optional name inputs
- [x] User can create new account via sign-up form (database row created)
- [x] User can sign in with valid credentials (session cookie set)
- [x] User can sign out (session invalidated)
- [x] Invalid credentials show appropriate error message
- [x] Password mismatch prevented at form validation level
- [x] Loading spinner/state shown during auth API calls

### Testing Requirements
- [x] Unit tests for AuthProvider hook behavior
- [x] Unit tests for form validation logic
- [x] Manual test: full sign-up -> sign-in -> sign-out flow
- [x] Manual test: invalid email format rejected
- [x] Manual test: password too short rejected
- [x] Manual test: wrong password shows error

### Quality Gates
- [x] All files ASCII-encoded (0-127 characters only)
- [x] Unix LF line endings
- [x] Zero TypeScript errors (`npm run typecheck`)
- [x] Zero ESLint warnings (`npm run lint`)
- [x] Prettier formatting applied (`npm run format:check`)
- [x] All existing tests pass (`npm run test`)

---

## 8. Implementation Notes

### Key Considerations
- Better Auth client must use empty string or correct base URL for API requests
- Session cookies require `credentials: 'include'` which Better Auth handles internally
- The `useSession` hook from Better Auth returns `{ data: session, isPending, error }`
- Form components should be reusable for future modal integration (Session 03)

### Potential Challenges
- **Cookie propagation**: Ensure dev proxy forwards cookies correctly (Vite config may need adjustment)
- **CORS with credentials**: Server already configured, but test thoroughly
- **TypeScript types**: Better Auth exports types, use them for type safety
- **Error mapping**: Better Auth errors may need user-friendly translation

### ASCII Reminder
All output files must use ASCII-only characters (0-127). No smart quotes, em dashes, or special Unicode characters.

### Better Auth Client Import Path
The Better Auth React client is imported from `better-auth/react`:
```typescript
import { createAuthClient } from 'better-auth/react';
```

---

## 9. Testing Strategy

### Unit Tests
- `AuthProvider` exposes correct default values when no session
- `AuthProvider` updates values when session exists
- `useAuth` throws when used outside provider
- Form validation functions work correctly

### Integration Tests
- Auth client can reach `/api/auth/session` endpoint
- Sign-up creates user in database
- Sign-in returns valid session

### Manual Testing
1. Start database: `npm run db:start`
2. Start dev servers: `npm run dev:all`
3. Navigate to auth page
4. Test sign-up with new email
5. Verify session in browser dev tools (cookies)
6. Test sign-out
7. Test sign-in with created account
8. Test invalid credentials

### Edge Cases
- Empty form submission (validation should block)
- Duplicate email sign-up (should show error from server)
- Network error during auth (should show error message)
- Session expiration handling (defer to Session 03)

---

## 10. Dependencies

### External Libraries
- `better-auth`: v1.4.7 (already installed)
- `react`: v19 (already installed)

### Other Sessions
- **Depends on**: `phase03-session01-better-auth-server-setup` (provides auth endpoints)
- **Depended by**: `phase03-session03-protected-routes-ui` (requires auth client for route guards)

---

## 11. Auth Endpoint Reference

The server (Session 01) exposes these endpoints:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/sign-up/email` | Create new account |
| POST | `/api/auth/sign-in/email` | Sign in with email/password |
| POST | `/api/auth/sign-out` | Invalidate session |
| GET | `/api/auth/session` | Get current session |

Better Auth client methods map to these automatically.

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
