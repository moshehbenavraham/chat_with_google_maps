# Session 02: React Client Integration

**Session ID**: `phase03-session02-react-client-integration`
**Status**: Not Started
**Estimated Tasks**: ~25
**Estimated Duration**: 2-3 hours

---

## Objective

Create the React auth client with Better Auth hooks, implement AuthProvider context, and build sign-in/sign-up form components for a complete authentication flow.

---

## Scope

### In Scope (MVP)
- Create `/src/lib/auth-client.ts` with Better Auth client configuration
- Create `AuthProvider` context component
- Implement `useSession` and `useUser` hooks usage
- Build `SignInForm` component with email/password
- Build `SignUpForm` component with email/password
- Add form validation for auth inputs
- Handle auth errors with user-friendly messages
- Add loading states during auth operations
- Test complete sign-up and sign-in flow
- Document client auth setup

### Out of Scope
- Protected routes (Session 03)
- User profile page (Session 03)
- Social OAuth buttons (Session 04)
- Password reset functionality
- Email verification UI
- Remember me functionality

---

## Prerequisites

- [ ] Session 01 complete (Better Auth server running)
- [ ] Auth endpoints responding at `/api/auth/*`
- [ ] Understanding of React context and hooks

---

## Deliverables

1. `src/lib/auth-client.ts` - Better Auth React client
2. `src/components/auth/AuthProvider.tsx` - Auth context provider
3. `src/components/auth/SignInForm.tsx` - Sign-in form component
4. `src/components/auth/SignUpForm.tsx` - Sign-up form component
5. `src/components/auth/AuthError.tsx` - Error display component
6. Updated documentation for client auth

---

## Technical Details

### Auth Client Configuration

```typescript
// src/lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || '',
});

export const {
  useSession,
  signIn,
  signUp,
  signOut,
} = authClient;
```

### AuthProvider Component

```typescript
// src/components/auth/AuthProvider.tsx
import { createContext, useContext, ReactNode } from 'react';
import { useSession } from '@/lib/auth-client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();

  const value = {
    user: session?.user ?? null,
    session: session ?? null,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Sign-In Form Structure

```typescript
// src/components/auth/SignInForm.tsx
interface SignInFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
}

// Form fields: email, password
// Actions: sign in, switch to sign up
// States: idle, loading, error
```

### Sign-Up Form Structure

```typescript
// src/components/auth/SignUpForm.tsx
interface SignUpFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

// Form fields: email, password, confirm password, name (optional)
// Actions: sign up, switch to sign in
// Validation: password match, password length, email format
// States: idle, loading, error
```

---

## Success Criteria

- [ ] Auth client configured and exported
- [ ] `AuthProvider` wraps application root
- [ ] `useSession` returns session data when authenticated
- [ ] `SignInForm` component renders with email/password fields
- [ ] `SignUpForm` component renders with email/password/confirm fields
- [ ] User can create new account via sign-up form
- [ ] User can sign in with created account
- [ ] Auth errors display user-friendly messages
- [ ] Loading states shown during auth operations
- [ ] Form validation prevents invalid submissions
- [ ] No TypeScript errors
- [ ] All existing tests still pass
