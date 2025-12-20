/**
 * Toast Notification Component
 *
 * Provides non-disruptive toast notifications for user feedback.
 * Uses React Context for global toast management.
 *
 * @module src/components/ui/Toast
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import './toast.css';

/**
 * Toast types for different notification styles
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Individual toast configuration
 */
export interface ToastConfig {
  /** Unique identifier */
  id: string;
  /** Toast message */
  message: string;
  /** Toast type for styling */
  type: ToastType;
  /** Duration in ms (0 = no auto-dismiss) */
  duration: number;
  /** Optional icon override */
  icon?: string;
}

/**
 * Context value for toast management
 */
interface ToastContextValue {
  /** Show a new toast notification */
  showToast: (message: string, type?: ToastType, duration?: number, icon?: string) => void;
  /** Dismiss a specific toast by ID */
  dismissToast: (id: string) => void;
  /** Dismiss all toasts */
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * Hook to access toast functionality
 *
 * @returns Toast context with showToast, dismissToast, dismissAll functions
 * @throws Error if used outside ToastProvider
 *
 * @example
 * ```tsx
 * const { showToast } = useToast();
 * showToast('Successfully signed out!', 'success');
 * ```
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/**
 * Get default icon for toast type
 */
function getDefaultIcon(type: ToastType): string {
  switch (type) {
    case 'success':
      return 'check_circle';
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    case 'info':
    default:
      return 'info';
  }
}

/**
 * Individual Toast Component
 */
function ToastItem({ toast, onDismiss }: { toast: ToastConfig; onDismiss: (id: string) => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    // Wait for exit animation before actually removing
    setTimeout(() => {
      onDismiss(toast.id);
    }, 200);
  }, [onDismiss, toast.id]);

  useEffect(() => {
    if (toast.duration > 0) {
      timeoutRef.current = window.setTimeout(handleDismiss, toast.duration);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [toast.duration, handleDismiss]);

  return (
    <div
      className={`toast toast-${toast.type} ${isExiting ? 'toast-exit' : 'toast-enter'}`}
      role="alert"
      aria-live="polite"
    >
      <span className="material-symbols-outlined toast-icon">
        {toast.icon ?? getDefaultIcon(toast.type)}
      </span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-dismiss" onClick={handleDismiss} aria-label="Dismiss notification">
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
}

/**
 * ToastProvider Component
 *
 * Wraps the application to provide toast notification functionality.
 * Renders toast notifications in a fixed container.
 *
 * @example
 * ```tsx
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * ```
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

  const showToast = useCallback(
    (message: string, type?: ToastType, duration?: number, icon?: string) => {
      const toastType = type ?? 'info';
      const toastDuration = duration ?? 4000;
      const id = `toast-${String(Date.now())}-${Math.random().toString(36).slice(2, 9)}`;
      const newToast: ToastConfig = { id, message, type: toastType, duration: toastDuration, icon };

      setToasts(prev => [...prev, newToast]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue: ToastContextValue = {
    showToast,
    dismissToast,
    dismissAll,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {toasts.length > 0 && (
        <div className="toast-container" aria-label="Notifications">
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

/**
 * Standalone Toast component for use without context
 * (Use ToastProvider and useToast for most cases)
 */
export function Toast({
  message,
  type = 'info',
  icon,
  onDismiss,
}: {
  message: string;
  type?: ToastType;
  icon?: string;
  onDismiss?: () => void;
}) {
  return (
    <div className={`toast toast-${type} toast-enter`} role="alert">
      <span className="material-symbols-outlined toast-icon">{icon ?? getDefaultIcon(type)}</span>
      <span className="toast-message">{message}</span>
      {onDismiss && (
        <button className="toast-dismiss" onClick={onDismiss} aria-label="Dismiss notification">
          <span className="material-symbols-outlined">close</span>
        </button>
      )}
    </div>
  );
}

export default ToastProvider;
