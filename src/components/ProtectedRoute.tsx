/**
 * ProtectedRoute Component
 *
 * Wraps routes that require authentication.
 * Redirects to landing page if user is not authenticated.
 *
 * @module src/components/ProtectedRoute
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/auth';
import { LoadingScreen } from '@/components/ui/LoadingSkeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute Component
 *
 * Guards routes that require authentication.
 * - Shows loading screen while auth status is being determined
 * - Redirects to landing page if not authenticated
 * - Saves intended destination for post-login redirect
 *
 * @example
 * ```tsx
 * <Route
 *   path="/app"
 *   element={
 *     <ProtectedRoute>
 *       <AppPage />
 *     </ProtectedRoute>
 *   }
 * />
 * ```
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." showBranding />;
  }

  if (!isAuthenticated) {
    // Save intended destination for post-login redirect
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
