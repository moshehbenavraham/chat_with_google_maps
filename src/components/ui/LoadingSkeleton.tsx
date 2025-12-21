/**
 * LoadingSkeleton Component
 *
 * Provides loading skeleton/shimmer animations for better UX during loading states.
 * Includes both individual skeleton elements and full-page loading screens.
 *
 * @module src/components/ui/LoadingSkeleton
 */

import React from 'react';
import { Map } from 'lucide-react';
import { AnimatedSpinner } from './AnimatedSpinner';
import './loading-skeleton.css';

/**
 * Props for individual Skeleton element
 */
interface SkeletonProps {
  /** Width of the skeleton (CSS value) */
  width?: string;
  /** Height of the skeleton (CSS value) */
  height?: string;
  /** Border radius (CSS value) */
  borderRadius?: string;
  /** Additional class names */
  className?: string;
  /** Whether to use circular shape */
  circle?: boolean;
}

/**
 * Individual skeleton element with shimmer effect
 */
export function Skeleton({
  width = '100%',
  height = '1rem',
  borderRadius = '4px',
  className = '',
  circle = false,
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: circle ? height : width,
        height,
        borderRadius: circle ? '50%' : borderRadius,
      }}
    />
  );
}

/**
 * Props for LoadingScreen
 */
interface LoadingScreenProps {
  /** Message to display below the spinner */
  message?: string;
  /** Whether to show app branding */
  showBranding?: boolean;
}

/**
 * Full-page loading screen with spinner and optional branding
 */
export function LoadingScreen({ message = 'Loading...', showBranding = true }: LoadingScreenProps) {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        {showBranding && (
          <div className="loading-brand">
            <Map className="loading-icon size-8" />
          </div>
        )}
        <div className="loading-spinner-container">
          <AnimatedSpinner size={48} label={message} />
        </div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
}

/**
 * Skeleton layout for the main app content
 */
export function AppSkeleton() {
  return (
    <div className="app-skeleton">
      {/* Left panel skeleton */}
      <div className="app-skeleton-panel">
        <div className="app-skeleton-header">
          <Skeleton width="60%" height="1.5rem" />
        </div>
        <div className="app-skeleton-content">
          <Skeleton height="3rem" borderRadius="8px" />
          <Skeleton height="3rem" borderRadius="8px" />
          <Skeleton height="3rem" borderRadius="8px" />
        </div>
        <div className="app-skeleton-controls">
          <Skeleton circle height="48px" />
          <Skeleton circle height="48px" />
          <Skeleton circle height="48px" />
        </div>
      </div>
      {/* Map panel skeleton */}
      <div className="app-skeleton-map">
        <div className="app-skeleton-map-content">
          <Map className="size-16" />
          <span>Loading map...</span>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
