/**
 * AuthProvider Component
 *
 * Provides authentication context to the React application.
 * Wraps children with auth state and exposes useAuth hook.
 *
 * @module src/components/auth/AuthProvider
 */

import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useSession, signOut } from '@/lib/auth-client';

/**
 * User type from session data
 */
interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Session type from Better Auth
 */
interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Auth context value type
 */
interface AuthContextValue {
  /** Current authenticated user, null if not signed in */
  user: User | null;
  /** Current session data, null if not signed in */
  session: Session | null;
  /** True while session is being fetched */
  isLoading: boolean;
  /** True if user is authenticated */
  isAuthenticated: boolean;
  /** Error from session fetch, null if none */
  error: Error | null;
  /** Sign out the current user */
  handleSignOut: () => Promise<void>;
}

/**
 * Auth context with undefined default
 * Must be used within AuthProvider
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Props for AuthProvider
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider Component
 *
 * Wraps the application to provide authentication state.
 * Uses Better Auth's useSession hook internally.
 *
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // Use Better Auth's session hook
  const { data: sessionData, isPending, error } = useSession();

  // Handle sign out with Better Auth client
  const handleSignOut = useCallback(async () => {
    await signOut();
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<AuthContextValue>(() => {
    const user = sessionData?.user ?? null;
    const session = sessionData?.session ?? null;

    return {
      user: user as User | null,
      session: session as Session | null,
      isLoading: isPending,
      isAuthenticated: !!user,
      error: error ?? null,
      handleSignOut,
    };
  }, [sessionData, isPending, error, handleSignOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 *
 * Access authentication state from any component.
 * Must be used within an AuthProvider.
 *
 * @returns Auth context value
 * @throws Error if used outside AuthProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, handleSignOut } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <SignInForm />;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome, {user?.email}</p>
 *       <button onClick={handleSignOut}>Sign Out</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default AuthProvider;
