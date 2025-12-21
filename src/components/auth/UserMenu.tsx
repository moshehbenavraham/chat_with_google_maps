/**
 * UserMenu Component
 *
 * Dropdown menu showing user info and sign-out button.
 * Displays Avatar as trigger, with dropdown containing user details.
 *
 * @module src/components/auth/UserMenu
 */

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Avatar } from './Avatar';
import { useToast } from '@/components/ui/Toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

/**
 * Props for UserMenu component
 */
export interface UserMenuProps {
  /** Additional CSS class */
  className?: string;
}

/**
 * UserMenu Component
 *
 * Features:
 * - Avatar trigger button
 * - Dropdown with user email and name
 * - Sign out button
 * - Click-outside to close (built into DropdownMenu)
 * - Escape key to close (built into DropdownMenu)
 * - Full keyboard navigation
 *
 * @example
 * ```tsx
 * <UserMenu className="header-user-menu" />
 * ```
 */
export function UserMenu({ className = '' }: UserMenuProps) {
  const { user, handleSignOut } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Handle sign out
  const handleSignOutClick = useCallback(async () => {
    await handleSignOut();
    showToast('Successfully signed out', 'success');
    void navigate('/');
  }, [handleSignOut, navigate, showToast]);

  // Don't render if no user
  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--background)]',
            className
          )}
          aria-label="User menu"
        >
          <Avatar user={user} size="md" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-[200px] bg-[var(--Neutral-10)] border border-[var(--Neutral-30)]"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            {user.name && <p className="text-sm font-medium text-[var(--text)]">{user.name}</p>}
            <p className="text-xs text-[var(--muted-foreground)]">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[var(--Neutral-30)]" />
        <DropdownMenuItem
          onClick={() => void handleSignOutClick()}
          className="text-[var(--Red-400)] focus:text-[var(--Red-400)] focus:bg-[var(--Neutral-20)] cursor-pointer"
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;
