/**
 * AuthModal Component
 *
 * Modal wrapper for authentication forms.
 * Renders to portal, supports backdrop click and Escape to close.
 *
 * @module src/components/auth/AuthModal
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { backdropFade, scaleIn, transitions } from '@/lib/animations';
import './AuthModal.css';

/**
 * Props for AuthModal component
 */
export interface AuthModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Initial form mode */
  initialMode?: 'signin' | 'signup';
}

/**
 * AuthModal Component
 *
 * Features:
 * - Portal rendering to document.body
 * - Backdrop with click-to-close
 * - Escape key to close
 * - Form mode switching (signin/signup)
 * - Body scroll lock when open
 * - Closes on successful authentication
 *
 * @example
 * ```tsx
 * <AuthModal
 *   isOpen={showAuth}
 *   onClose={() => setShowAuth(false)}
 *   initialMode="signin"
 * />
 * ```
 */
export function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  // Mode resets when modal closes and re-opens via key prop pattern
  // Parent should remount modal or manage initialMode changes
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Handle successful auth
  const handleSuccess = useCallback(() => {
    onClose();
  }, [onClose]);

  // Switch to sign-up mode
  const handleSwitchToSignUp = useCallback(() => {
    setMode('signup');
  }, []);

  // Switch to sign-in mode
  const handleSwitchToSignIn = useCallback(() => {
    setMode('signin');
  }, []);

  // AnimatePresence must wrap the conditional render before portal
  // to properly handle exit animations
  return (
    <AnimatePresence>
      {isOpen &&
        createPortal(
          <motion.div
            className="auth-modal-backdrop"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-label="Authentication"
            variants={backdropFade}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transitions.modalIn}
          >
            <motion.div
              className="auth-modal-content"
              variants={scaleIn}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transitions.modalIn}
            >
              <button
                type="button"
                className="auth-modal-close"
                onClick={onClose}
                aria-label="Close"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {mode === 'signin' ? (
                <SignInForm onSuccess={handleSuccess} onSwitchToSignUp={handleSwitchToSignUp} />
              ) : (
                <SignUpForm onSuccess={handleSuccess} onSwitchToSignIn={handleSwitchToSignIn} />
              )}
            </motion.div>
          </motion.div>,
          document.body
        )}
    </AnimatePresence>
  );
}

export default AuthModal;
