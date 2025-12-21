/**
 * Theme Toggle Component
 *
 * Dropdown menu for switching between light, dark, and system themes.
 * Uses next-themes for state management and Lucide icons for visual indicators.
 *
 * @module src/components/theme-toggle
 */

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { Moon, Sun, Monitor, Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

/**
 * Theme option configuration
 */
interface ThemeOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Available theme options
 */
const themeOptions: ThemeOption[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

// Subscription function for useSyncExternalStore (no-op for mount detection)
function subscribeToNothing(callback: () => void): () => void {
  // This is intentionally a no-op - we just need to detect client vs server
  void callback;
  return () => {
    // Cleanup function - intentionally empty for mount detection pattern
  };
}

/**
 * Hook to detect if component is mounted (client-side)
 * Uses useSyncExternalStore for SSR-safe mount detection
 */
function useMounted(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false
  );
}

/**
 * Trigger icon component that renders the correct icon based on theme
 * Declared outside ThemeToggle to avoid recreation during render
 */
function TriggerIconDisplay({
  theme,
  mounted,
}: {
  theme: string | undefined;
  mounted: boolean;
}): React.ReactElement {
  if (!mounted) {
    return <Sun className="h-4 w-4" />;
  }

  switch (theme) {
    case 'light':
      return <Sun className="h-4 w-4" />;
    case 'dark':
      return <Moon className="h-4 w-4" />;
    case 'system':
      return <Monitor className="h-4 w-4" />;
    default:
      return <Sun className="h-4 w-4" />;
  }
}

/**
 * ThemeToggle Component
 *
 * Renders a dropdown submenu with three theme options:
 * - Light: Forces light mode
 * - Dark: Forces dark mode
 * - System: Follows OS preference
 *
 * Features:
 * - Shows current theme with checkmark indicator
 * - Icons for each theme option
 * - Hydration-safe (waits for client mount)
 *
 * Must be used inside a DropdownMenu context (e.g., UserMenu).
 *
 * @example
 * ```tsx
 * <DropdownMenu>
 *   <DropdownMenuContent>
 *     <ThemeToggle />
 *   </DropdownMenuContent>
 * </DropdownMenu>
 * ```
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  // Handle theme selection
  const handleThemeChange = (value: string) => {
    setTheme(value);
  };

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer">
        <TriggerIconDisplay theme={theme} mounted={mounted} />
        <span>Theme</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent
        className="min-w-[120px] bg-[var(--Neutral-10)] border border-[var(--Neutral-30)]"
        sideOffset={8}
      >
        {themeOptions.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => {
              handleThemeChange(value);
            }}
            className={cn(
              'flex items-center justify-between gap-2 cursor-pointer',
              'focus:bg-[var(--Neutral-20)]'
            )}
          >
            <span className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </span>
            {mounted && theme === value && <Check className="h-4 w-4 text-[var(--Blue-500)]" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

export default ThemeToggle;
