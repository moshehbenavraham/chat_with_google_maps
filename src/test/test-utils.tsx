/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Test utilities for rendering components with providers.
 */

import { render, type RenderOptions } from '@testing-library/react';
import React, { type ReactElement, type ReactNode } from 'react';

/**
 * Mock client interface matching GenAILiveClient event methods.
 */
interface MockClient {
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
}

/**
 * Creates a mock LiveAPI client for testing.
 */
export function createMockClient(): MockClient {
  return {
    on: vi.fn(),
    off: vi.fn(),
  };
}

/**
 * Mock LiveAPI context value.
 */
export interface MockLiveAPIContextValue {
  client: MockClient;
  setConfig: ReturnType<typeof vi.fn>;
  config: Record<string, unknown>;
  audioStreamer: { current: null };
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  connected: boolean;
  volume: number;
  heldGroundingChunks: undefined;
  clearHeldGroundingChunks: ReturnType<typeof vi.fn>;
  heldGroundedResponse: undefined;
  clearHeldGroundedResponse: ReturnType<typeof vi.fn>;
}

/**
 * Creates a mock LiveAPI context value for testing.
 */
export function createMockLiveAPIContext(
  overrides: Partial<MockLiveAPIContextValue> = {}
): MockLiveAPIContextValue {
  return {
    client: createMockClient(),
    setConfig: vi.fn(),
    config: {},
    audioStreamer: { current: null },
    connect: vi.fn(),
    disconnect: vi.fn(),
    connected: false,
    volume: 0,
    heldGroundingChunks: undefined,
    clearHeldGroundingChunks: vi.fn(),
    heldGroundedResponse: undefined,
    clearHeldGroundedResponse: vi.fn(),
    ...overrides,
  };
}

/**
 * Mock LiveAPIContext for testing components that use useLiveAPIContext.
 */
const MockLiveAPIContext = React.createContext<MockLiveAPIContextValue | undefined>(undefined);

interface MockLiveAPIProviderProps {
  children: ReactNode;
  value?: MockLiveAPIContextValue;
}

/**
 * Provider component for wrapping components in tests.
 */
export function MockLiveAPIProvider({
  children,
  value = createMockLiveAPIContext(),
}: MockLiveAPIProviderProps) {
  return <MockLiveAPIContext.Provider value={value}>{children}</MockLiveAPIContext.Provider>;
}

interface AllProvidersProps {
  children: ReactNode;
  liveAPIValue?: MockLiveAPIContextValue;
}

/**
 * Wrapper component that includes all providers needed for testing.
 */
function AllProviders({ children, liveAPIValue }: AllProvidersProps) {
  return <MockLiveAPIProvider value={liveAPIValue}>{children}</MockLiveAPIProvider>;
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  liveAPIValue?: MockLiveAPIContextValue;
}

/**
 * Custom render function that wraps components with all providers.
 */
function customRender(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { liveAPIValue, ...renderOptions } = options;

  return render(ui, {
    wrapper: ({ children }) => <AllProviders liveAPIValue={liveAPIValue}>{children}</AllProviders>,
    ...renderOptions,
  });
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render with custom render
export { customRender as render };

// Export user-event for convenience
export { default as userEvent } from '@testing-library/user-event';
