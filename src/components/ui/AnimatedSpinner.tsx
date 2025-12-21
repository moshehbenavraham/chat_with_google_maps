/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * AnimatedSpinner Component
 *
 * A smooth, GPU-accelerated loading spinner using Framer Motion.
 * Uses only transform and opacity for 60fps performance.
 *
 * @module src/components/ui/AnimatedSpinner
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface AnimatedSpinnerProps {
  /** Size of the spinner in pixels */
  size?: number;
  /** Color of the spinner (CSS color value) */
  color?: string;
  /** Additional class names */
  className?: string;
  /** Label for accessibility */
  label?: string;
}

/**
 * AnimatedSpinner - Smooth rotating loading indicator
 *
 * Uses Framer Motion for GPU-accelerated rotation animation.
 * Configurable size and color with accessible label.
 *
 * @example
 * ```tsx
 * <AnimatedSpinner size={32} color="currentColor" />
 * <AnimatedSpinner size={24} label="Loading messages..." />
 * ```
 */
export function AnimatedSpinner({
  size = 24,
  color = 'currentColor',
  className,
  label = 'Loading...',
}: AnimatedSpinnerProps) {
  return (
    <motion.div
      className={cn('inline-flex items-center justify-center', className)}
      role="status"
      aria-label={label}
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="10"
          opacity={0.25}
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="25"
        />
      </motion.svg>
      <span className="sr-only">{label}</span>
    </motion.div>
  );
}

export default AnimatedSpinner;
