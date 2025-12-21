/**
 * Avatar Component
 *
 * Displays user avatar with initials fallback.
 * Shows first letter of name (or email if no name) on a colored background.
 *
 * @module src/components/auth/Avatar
 */

import React from 'react';
import './Avatar.css';

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
  const hasImage = user.image && user.image.length > 0;

  const sizeClass = `avatar-${size}`;

  return (
    <div
      className={`avatar ${sizeClass} ${className}`.trim()}
      style={hasImage ? undefined : { backgroundColor: bgColor }}
      aria-label={`Avatar for ${user.name ?? user.email}`}
    >
      {hasImage ? (
        <img src={user.image!} alt={user.name ?? user.email} className="avatar-image" />
      ) : (
        <span className="avatar-initials">{initials}</span>
      )}
    </div>
  );
}

export default Avatar;
