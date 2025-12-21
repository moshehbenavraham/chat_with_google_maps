/**
 * UserMenu Component
 *
 * Dropdown menu showing user info and sign-out button.
 * Displays Avatar as trigger, with dropdown containing user details.
 *
 * @module src/components/auth/UserMenu
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Avatar } from './Avatar';
import { useToast } from '@/components/ui/Toast';
import './UserMenu.css';

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
 * - Click-outside to close
 * - Escape key to close
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

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Toggle dropdown open/closed
  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Close dropdown
  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Handle sign out
  const handleSignOutClick = useCallback(async () => {
    closeMenu();
    await handleSignOut();
    showToast('Successfully signed out', 'success');
    void navigate('/');
  }, [handleSignOut, navigate, showToast, closeMenu]);

  // Click outside detection
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeMenu]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeMenu]);

  // Don't render if no user
  if (!user) {
    return null;
  }

  return (
    <div className={`user-menu ${className}`.trim()} ref={menuRef}>
      <button
        type="button"
        className="user-menu-trigger"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="User menu"
      >
        <Avatar user={user} size="md" />
      </button>

      {isOpen && (
        <div className="user-menu-dropdown" role="menu">
          <div className="user-menu-info">
            {user.name && <div className="user-menu-name">{user.name}</div>}
            <div className="user-menu-email">{user.email}</div>
          </div>
          <div className="user-menu-divider" />
          <button
            type="button"
            className="user-menu-item user-menu-signout"
            onClick={() => void handleSignOutClick()}
            role="menuitem"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
