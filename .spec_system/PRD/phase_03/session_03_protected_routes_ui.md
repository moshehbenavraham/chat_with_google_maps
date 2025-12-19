# Session 03: Protected Routes & UI

**Session ID**: `phase03-session03-protected-routes-ui`
**Status**: Not Started
**Estimated Tasks**: ~20
**Estimated Duration**: 2-3 hours

---

## Objective

Implement route protection to guard authenticated content, create a user menu component, and polish the auth UI to provide a complete authentication user experience.

---

## Scope

### In Scope (MVP)
- Create `ProtectedRoute` component for route guarding
- Implement redirect to sign-in for unauthenticated users
- Create `UserMenu` component with profile dropdown
- Add user avatar/initial display
- Implement sign-out functionality in UI
- Create `AuthModal` for sign-in/sign-up modal flow
- Style auth components to match application theme
- Add proper loading states during session checks
- Handle auth state persistence on page refresh
- Test complete auth flow end-to-end

### Out of Scope
- Social OAuth (Session 04)
- User profile editing page
- Password change functionality
- Account deletion
- Admin roles/permissions

---

## Prerequisites

- [ ] Session 02 complete (Auth client and forms working)
- [ ] User can sign up and sign in
- [ ] Understanding of React Router (if used)

---

## Deliverables

1. `src/components/auth/ProtectedRoute.tsx` - Route guard component
2. `src/components/auth/UserMenu.tsx` - User dropdown menu
3. `src/components/auth/AuthModal.tsx` - Modal auth flow
4. `src/components/auth/Avatar.tsx` - User avatar component
5. Updated styling for all auth components
6. Integration with main app layout

---

## Technical Details

### Protected Route Component

```typescript
// src/components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return fallback ?? <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

### User Menu Component

```typescript
// src/components/auth/UserMenu.tsx
interface UserMenuProps {
  user: User;
}

// Displays:
// - User avatar or initial
// - User name/email
// - Dropdown with: Profile, Settings, Sign Out
```

### Auth Modal Component

```typescript
// src/components/auth/AuthModal.tsx
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: 'sign-in' | 'sign-up';
}

// Modal that contains SignInForm and SignUpForm
// Allows switching between views
// Closes on successful auth
```

### App Layout Integration

```typescript
// Example integration in App.tsx
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
```

---

## Success Criteria

- [ ] `ProtectedRoute` blocks unauthenticated access
- [ ] Unauthenticated users redirected to auth page
- [ ] `UserMenu` displays current user info
- [ ] Sign-out button works correctly
- [ ] `AuthModal` provides seamless sign-in/sign-up flow
- [ ] User avatar shows initials or image
- [ ] Auth state persists across page refresh
- [ ] Loading states shown during session verification
- [ ] Auth UI matches application design language
- [ ] Complete flow: visit protected route -> sign in -> access content -> sign out
- [ ] No TypeScript errors
- [ ] All existing tests still pass
