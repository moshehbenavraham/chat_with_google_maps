/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Component tests for ErrorScreen demonstrating React Testing Library patterns.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import ErrorScreen from './ErrorScreen';
import { useLiveAPIContext } from '@/contexts/LiveAPIContext';

// Mock the LiveAPIContext hook
vi.mock('@/contexts/LiveAPIContext', () => ({
  useLiveAPIContext: vi.fn(),
}));

describe('ErrorScreen', () => {
  let mockClient: { on: Mock; off: Mock };
  let capturedErrorHandler: ((error: ErrorEvent) => void) | null = null;

  beforeEach(() => {
    capturedErrorHandler = null;
    mockClient = {
      on: vi.fn((event: string, handler: (error: ErrorEvent) => void) => {
        if (event === 'error') {
          capturedErrorHandler = handler;
        }
      }),
      off: vi.fn(),
    };
    (useLiveAPIContext as Mock).mockReturnValue({
      client: mockClient,
    });
  });

  it('renders nothing when there is no error', () => {
    render(<ErrorScreen />);

    // Component returns an empty AnimatePresence when no error
    // Error content should not be visible
    expect(screen.queryByText(':(')).not.toBeInTheDocument();
    expect(screen.queryByText('Something went wrong. Please try again.')).not.toBeInTheDocument();
  });

  it('registers error listener on mount', () => {
    render(<ErrorScreen />);

    expect(mockClient.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('unregisters error listener on unmount', () => {
    const { unmount } = render(<ErrorScreen />);

    unmount();

    expect(mockClient.off).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('displays error message when error event is triggered', () => {
    render(<ErrorScreen />);

    expect(capturedErrorHandler).toBeDefined();

    // Simulate an error event wrapped in act
    act(() => {
      if (capturedErrorHandler) {
        capturedErrorHandler({ message: 'Test error message' } as ErrorEvent);
      }
    });

    expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('displays quota exhausted message for RESOURCE_EXHAUSTED error', () => {
    render(<ErrorScreen />);

    expect(capturedErrorHandler).toBeDefined();

    // Simulate a quota error
    act(() => {
      if (capturedErrorHandler) {
        capturedErrorHandler({ message: 'RESOURCE_EXHAUSTED: Quota exceeded' } as ErrorEvent);
      }
    });

    expect(
      screen.getByText(
        'Gemini Live API in AI Studio has a limited free quota each day. Come back tomorrow to continue.'
      )
    ).toBeInTheDocument();
    // Should not show raw message for quota errors
    expect(screen.queryByText('RESOURCE_EXHAUSTED: Quota exceeded')).not.toBeInTheDocument();
  });

  it('shows close button for regular errors', () => {
    render(<ErrorScreen />);

    expect(capturedErrorHandler).toBeDefined();

    // Simulate an error
    act(() => {
      if (capturedErrorHandler) {
        capturedErrorHandler({ message: 'Regular error' } as ErrorEvent);
      }
    });

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('does not show close button for quota exhausted errors', () => {
    render(<ErrorScreen />);

    expect(capturedErrorHandler).toBeDefined();

    // Simulate a quota error
    act(() => {
      if (capturedErrorHandler) {
        capturedErrorHandler({ message: 'RESOURCE_EXHAUSTED: Quota exceeded' } as ErrorEvent);
      }
    });

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });

  it('clears error when close button is clicked', async () => {
    render(<ErrorScreen />);

    expect(capturedErrorHandler).toBeDefined();

    // Simulate an error
    act(() => {
      if (capturedErrorHandler) {
        capturedErrorHandler({ message: 'Test error' } as ErrorEvent);
      }
    });

    // Error should be visible
    expect(screen.getByText('Test error')).toBeInTheDocument();

    // Click close button
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    });

    // Wait for AnimatePresence exit animation to complete
    await waitFor(() => {
      expect(screen.queryByText('Something went wrong. Please try again.')).not.toBeInTheDocument();
    });
  });

  it('displays sad face emoticon', () => {
    render(<ErrorScreen />);

    expect(capturedErrorHandler).toBeDefined();

    // Simulate an error
    act(() => {
      if (capturedErrorHandler) {
        capturedErrorHandler({ message: 'Error' } as ErrorEvent);
      }
    });

    expect(screen.getByText(':(')).toBeInTheDocument();
  });
});
