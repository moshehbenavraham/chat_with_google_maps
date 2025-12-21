/**
 * Avatar Component
 *
 * Displays user avatar with initials fallback.
 * Shows first letter of name (or email if no name) on a colored background.
 * Uses shadcn/ui Avatar primitives internally.
 *
 * @module src/components/auth/Avatar
 */

import React from 'react';
import { Avatar as ShadcnAvatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

/**
 * Props for Avatar component
 */
export interface AvatarProps {
  /** User data for avatar display */
  user: {
    name?: string | null;
    email: string;
    image?: string | null;
  };
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS class */
  className?: string;
}

/**
 * Generate a consistent background color from email hash
 */
function getColorFromEmail(email: string): string {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = ((hash << 5) - hash + email.charCodeAt(i)) | 0;
  }

  // Convert hash to HSL color with good saturation and lightness
  const hue = Math.abs(hash) % 360;
  return `hsl(${String(hue)}, 65%, 45%)`;
}

/**
 * Extract initials from user name or email
 */
function getInitials(user: AvatarProps['user']): string {
  if (user.name) {
    // Use first letter of name
    return user.name.charAt(0).toUpperCase();
  }
  // Fall back to first letter of email
  return user.email.charAt(0).toUpperCase();
}

/** Size variant classes */
const sizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
} as const;

/**
 * Avatar Component
 *
 * Shows user image if available, otherwise shows initials
 * on a colored background derived from their email.
 *
 * @example
 * ```tsx
 * <Avatar user={{ email: 'user@example.com', name: 'John' }} size="md" />
 * ```
 */
export function Avatar({ user, size = 'md', className = '' }: AvatarProps) {
  const initials = getInitials(user);
  const bgColor = getColorFromEmail(user.email);

  return (
    <ShadcnAvatar
      className={cn(sizeClasses[size], className)}
      aria-label={`Avatar for ${user.name ?? user.email}`}
    >
      {user.image && (
        <AvatarImage src={user.image} alt={user.name ?? user.email} className="object-cover" />
      )}
      <AvatarFallback
        style={{ backgroundColor: bgColor }}
        className="text-white font-semibold uppercase"
      >
        {initials}
      </AvatarFallback>
    </ShadcnAvatar>
  );
}

export default Avatar;
