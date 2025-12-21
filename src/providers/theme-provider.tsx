/**
 * Theme Provider Component
 *
 * Wraps the application with next-themes ThemeProvider for dark/light mode support.
 * Provides theme state management, localStorage persistence, and system preference detection.
 *
 * @module src/providers/theme-provider
 */

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

/**
 * Props for ThemeProvider component
 */
export interface ThemeProviderProps {
  /** Child components to wrap with theme context */
  children: ReactNode;
}

/**
 * ThemeProvider Component
 *
 * Wraps the application to provide theme context. Uses next-themes under the hood
 * which handles:
 * - localStorage persistence (key: 'theme')
 * - System preference detection
 * - Flash prevention via script injection
 * - Class-based theme switching (dark/light on html element)
 *
 * Configuration:
 * - attribute="class" - Uses class attribute on html element for Tailwind
 * - defaultTheme="dark" - Default to dark mode (current app default)
 * - enableSystem - Allow "system" option that follows OS preference
 * - disableTransitionOnChange - Prevent jarring color transitions
 * - storageKey="theme" - localStorage key for persistence
 *
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      storageKey="theme"
    >
      {children}
    </NextThemesProvider>
  );
}

export default ThemeProvider;
