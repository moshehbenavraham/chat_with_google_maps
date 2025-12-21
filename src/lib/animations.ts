/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Reusable Animation Variants Library
 *
 * Centralized animation definitions for consistent motion patterns.
 * All animations use only transform and opacity for GPU-accelerated 60fps performance.
 *
 * @module src/lib/animations
 */

import type { Variants, Transition } from 'framer-motion';

// ============================================================================
// Transition Presets
// ============================================================================

/**
 * Standard transition timings following UX guidelines
 */
export const transitions = {
  /** Quick micro-interactions (hover effects) */
  micro: { duration: 0.15, ease: 'easeOut' } as Transition,
  /** Button press feedback */
  press: { duration: 0.1, ease: 'easeInOut' } as Transition,
  /** Modal entrance */
  modalIn: { duration: 0.2, ease: 'easeOut' } as Transition,
  /** Modal exit */
  modalOut: { duration: 0.15, ease: 'easeIn' } as Transition,
  /** Sidebar slide */
  slide: { duration: 0.25, ease: 'easeOut' } as Transition,
  /** Stagger delay between items */
  staggerDelay: 0.05,
} as const;

// ============================================================================
// Fade Animations
// ============================================================================

/**
 * Simple fade in/out animation
 * Use for overlays, error screens, and subtle entrances
 */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Fade with upward movement
 * Use for content that appears from below
 */
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

// ============================================================================
// Slide Animations
// ============================================================================

/**
 * Slide in from right edge
 * Use for sidebars and side panels
 */
export const slideInRight: Variants = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
};

/**
 * Slide in from left edge
 * Use for left-aligned panels
 */
export const slideInLeft: Variants = {
  initial: { x: '-100%' },
  animate: { x: 0 },
  exit: { x: '-100%' },
};

// ============================================================================
// Scale Animations
// ============================================================================

/**
 * Scale with fade for modals and popups
 * Subtle scale from 95% creates depth effect
 */
export const scaleIn: Variants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
};

/**
 * Backdrop fade for modal overlays
 */
export const backdropFade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// ============================================================================
// Error/Attention Animations
// ============================================================================

/**
 * Subtle shake animation for errors
 * Combines fade with horizontal shake
 */
export const fadeInWithShake: Variants = {
  initial: { opacity: 0, x: 0 },
  animate: {
    opacity: 1,
    x: [0, -5, 5, -5, 5, 0],
    transition: {
      opacity: { duration: 0.2 },
      x: { duration: 0.4, delay: 0.1 },
    },
  },
  exit: { opacity: 0 },
};

// ============================================================================
// Stagger Animations
// ============================================================================

/**
 * Container variant for staggered children
 * Apply to parent element containing staggered items
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: transitions.staggerDelay,
    },
  },
};

/**
 * Child variant for staggered lists
 * Apply to each item in a staggered list
 */
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

// ============================================================================
// Interactive Animations (Motion Props)
// ============================================================================

/**
 * Button hover and tap effects
 * Apply using spread: {...buttonTap}
 */
export const buttonTap = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: transitions.micro,
} as const;

/**
 * Subtle button hover effect
 * For less prominent interactive elements
 */
export const buttonSubtle = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: transitions.micro,
} as const;

// ============================================================================
// Spinner Animation
// ============================================================================

/**
 * Continuous rotation for loading spinners
 */
export const spinnerRotate: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/**
 * Pulsing animation for loading states
 */
export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
