/**
 * Router Configuration
 *
 * Defines the application routing structure using React Router.
 * Separates public routes (landing, auth) from protected routes (app).
 *
 * @module src/router
 */

import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
import { AppPage } from '@/pages/AppPage';
import { AuthPage } from '@/components/auth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthErrorBoundary } from '@/components/AuthErrorBoundary';

/**
 * Root Layout Component
 *
 * Wraps all routes with AuthErrorBoundary to handle session expiry
 * and other authentication errors across the application.
 */
function RootLayout() {
  return (
    <AuthErrorBoundary>
      <Outlet />
    </AuthErrorBoundary>
  );
}

/**
 * Application Router
 *
 * Route structure:
 * - / : Public landing page
 * - /auth : Sign in/up page
 * - /app : Protected main application
 * - * : Catch-all redirect to landing
 */
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: '/auth',
        element: <AuthPage />,
      },
      {
        path: '/app',
        element: (
          <ProtectedRoute>
            <AppPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
