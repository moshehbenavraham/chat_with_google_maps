/**
 * AuthProvider Component Tests
 *
 * Unit tests for AuthProvider and useAuth hook.
 *
 * @module src/components/auth/__tests__/AuthProvider.test
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthProvider';
import * as authClient from '@/lib/auth-client';

// Mock the auth client module
vi.mock('@/lib/auth-client', () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}));

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when no session exists', () => {
    beforeEach(() => {
      (authClient.useSession as Mock).mockReturnValue({
        data: null,
        isPending: false,
        error: null,
      });
    });

    it('should provide null user and session', () => {
      const TestComponent = () => {
        const { user, session } = useAuth();
        return (
          <div>
            <span data-testid="user">{user ? 'has-user' : 'no-user'}</span>
            <span data-testid="session">{session ? 'has-session' : 'no-session'}</span>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(screen.getByTestId('session')).toHaveTextContent('no-session');
    });

    it('should provide isAuthenticated as false', () => {
      const TestComponent = () => {
        const { isAuthenticated } = useAuth();
        return <span data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</span>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('auth')).toHaveTextContent('no');
    });

    it('should provide isLoading as false when not pending', () => {
      const TestComponent = () => {
        const { isLoading } = useAuth();
        return <span data-testid="loading">{isLoading ? 'loading' : 'ready'}</span>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });
  });

  describe('when session exists', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockSession = {
      id: 'session-456',
      userId: 'user-123',
      expiresAt: new Date(Date.now() + 86400000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      (authClient.useSession as Mock).mockReturnValue({
        data: { user: mockUser, session: mockSession },
        isPending: false,
        error: null,
      });
    });

    it('should provide user data', () => {
      const TestComponent = () => {
        const { user } = useAuth();
        return <span data-testid="email">{user?.email ?? 'none'}</span>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('email')).toHaveTextContent('test@example.com');
    });

    it('should provide isAuthenticated as true', () => {
      const TestComponent = () => {
        const { isAuthenticated } = useAuth();
        return <span data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</span>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('auth')).toHaveTextContent('yes');
    });

    it('should provide session data', () => {
      const TestComponent = () => {
        const { session } = useAuth();
        return <span data-testid="session-id">{session?.id ?? 'none'}</span>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('session-id')).toHaveTextContent('session-456');
    });
  });

  describe('when loading', () => {
    beforeEach(() => {
      (authClient.useSession as Mock).mockReturnValue({
        data: null,
        isPending: true,
        error: null,
      });
    });

    it('should provide isLoading as true', () => {
      const TestComponent = () => {
        const { isLoading } = useAuth();
        return <span data-testid="loading">{isLoading ? 'loading' : 'ready'}</span>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    });
  });

  describe('when error occurs', () => {
    const mockError = new Error('Session fetch failed');

    beforeEach(() => {
      (authClient.useSession as Mock).mockReturnValue({
        data: null,
        isPending: false,
        error: mockError,
      });
    });

    it('should provide error object', () => {
      const TestComponent = () => {
        const { error } = useAuth();
        return <span data-testid="error">{error?.message ?? 'no-error'}</span>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('error')).toHaveTextContent('Session fetch failed');
    });
  });

  describe('handleSignOut', () => {
    beforeEach(() => {
      (authClient.useSession as Mock).mockReturnValue({
        data: null,
        isPending: false,
        error: null,
      });
      (authClient.signOut as Mock).mockResolvedValue({});
    });

    it('should call signOut when handleSignOut is invoked', async () => {
      const TestComponent = () => {
        const { handleSignOut } = useAuth();
        return (
          <button onClick={() => void handleSignOut()} data-testid="signout">
            Sign Out
          </button>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      screen.getByTestId('signout').click();

      await waitFor(() => {
        expect(authClient.signOut).toHaveBeenCalled();
      });
    });
  });

  describe('useAuth outside AuthProvider', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      const TestComponent = () => {
        useAuth();
        return null;
      };

      expect(() => render(<TestComponent />)).toThrow(
        'useAuth must be used within an AuthProvider'
      );

      consoleSpy.mockRestore();
    });
  });
});
