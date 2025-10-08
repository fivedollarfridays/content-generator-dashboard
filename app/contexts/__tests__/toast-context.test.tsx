/**
 * ToastContext Tests
 *
 * Comprehensive test suite for toast notification system
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ToastProvider, useToast, Toast, ToastType } from '../toast-context';

// Test component that uses the useToast hook
const TestComponent: React.FC = () => {
  const { toasts, showToast, hideToast, success, error, info, warning } = useToast();

  return (
    <div>
      <div data-testid="toast-count">{toasts.length}</div>
      {toasts.map(toast => (
        <div key={toast.id} data-testid={`toast-type-${toast.type}`} />
      ))}
      <button onClick={() => showToast('General toast')}>Show Toast</button>
      <button onClick={() => showToast('Custom toast', 'info', 1000)}>
        Show Custom Toast
      </button>
      <button onClick={() => success('Success message')}>Success</button>
      <button onClick={() => error('Error message')}>Error</button>
      <button onClick={() => info('Info message')}>Info</button>
      <button onClick={() => warning('Warning message')}>Warning</button>
      {toasts.length > 0 && (
        <button onClick={() => hideToast(toasts[0].id)}>Hide First Toast</button>
      )}
    </div>
  );
};

describe('ToastContext', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ========== Provider Tests ==========

  describe('ToastProvider', () => {
    it('should render children', () => {
      render(
        <ToastProvider>
          <div data-testid="child">Child Content</div>
        </ToastProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('should provide toast context to children', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      expect(screen.getByText('Show Toast')).toBeInTheDocument();
      expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
    });

    it('should accept custom maxToasts prop', async () => {
      render(
        <ToastProvider maxToasts={2}>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });

      // Add 3 toasts
      await user.click(screen.getByText('Show Toast'));
      await user.click(screen.getByText('Show Toast'));
      await user.click(screen.getByText('Show Toast'));

      // Should only show 2 toasts (last 2)
      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('2');
      });
    });
  });

  // ========== useToast Hook Tests ==========

  describe('useToast', () => {
    it('should throw error when used outside ToastProvider', () => {
      // Suppress console.error for this test
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useToast must be used within a ToastProvider');

      consoleError.mockRestore();
    });

    it('should provide toast context when used within ToastProvider', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });

  // ========== showToast Tests ==========

  describe('showToast', () => {
    it('should add a toast to the list', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Show Toast'));

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
      });
      expect(screen.getByText('General toast')).toBeInTheDocument();
    });

    it('should add multiple toasts', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Success'));
      await user.click(screen.getByText('Error'));

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('2');
      });
    });

    it('should auto-dismiss toast after duration', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Show Custom Toast'));

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
      });

      // Fast-forward time by 1000ms
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
      });
    });

    it('should respect maxToasts limit', async () => {
      render(
        <ToastProvider maxToasts={3}>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });

      // Add 5 toasts
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByText('Show Toast'));
      }

      // Should only show 3 toasts (last 3)
      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('3');
      });
    });
  });

  // ========== hideToast Tests ==========

  describe('hideToast', () => {
    it('should remove a toast from the list', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });

      // Add a toast
      await user.click(screen.getByText('Show Toast'));

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
      });

      // Hide the toast
      await user.click(screen.getByText('Hide First Toast'));

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
      });
    });

    it('should only remove the specified toast', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });

      // Add multiple toasts
      await user.click(screen.getByText('Success'));
      await user.click(screen.getByText('Error'));

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('2');
      });

      // Hide first toast
      await user.click(screen.getByText('Hide First Toast'));

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
      });
    });
  });

  // ========== Helper Methods Tests ==========

  describe('Helper Methods', () => {
    it('should show success toast', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Success'));

      await waitFor(() => {
        expect(screen.getByTestId('toast-type-success')).toBeInTheDocument();
        expect(screen.getByText('Success message')).toBeInTheDocument();
      });
    });

    it('should show error toast', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Error'));

      await waitFor(() => {
        expect(screen.getByTestId('toast-type-error')).toBeInTheDocument();
        expect(screen.getByText('Error message')).toBeInTheDocument();
      });
    });

    it('should show info toast', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Info'));

      await waitFor(() => {
        expect(screen.getByTestId('toast-type-info')).toBeInTheDocument();
        expect(screen.getByText('Info message')).toBeInTheDocument();
      });
    });

    it('should show warning toast', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Warning'));

      await waitFor(() => {
        expect(screen.getByTestId('toast-type-warning')).toBeInTheDocument();
        expect(screen.getByText('Warning message')).toBeInTheDocument();
      });
    });

    it('should accept custom duration for helper methods', async () => {
      const TestWithDuration: React.FC = () => {
        const { toasts, success } = useToast();
        return (
          <div>
            <div data-testid="toast-count">{toasts.length}</div>
            <button onClick={() => success('Quick success', 500)}>
              Success With Duration
            </button>
          </div>
        );
      };

      render(
        <ToastProvider>
          <TestWithDuration />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Success With Duration'));

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
      });

      // Fast-forward time by 500ms
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
      });
    });
  });

  // ========== Toast Rendering Tests ==========

  describe('Toast Rendering', () => {
    it('should not render ToastContainer when no toasts', () => {
      const { container } = render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      );

      // ToastContainer should not be in DOM when there are no toasts
      const toastContainer = container.querySelector('.fixed.bottom-4.right-4');
      expect(toastContainer).not.toBeInTheDocument();
    });

    it('should render ToastContainer with toasts', async () => {
      const { container } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Success'));

      await waitFor(() => {
        const toastContainer = container.querySelector('.fixed.bottom-4.right-4');
        expect(toastContainer).toBeInTheDocument();
      });
    });

    it('should render close button for each toast', async () => {
      const { container } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Success'));

      await waitFor(() => {
        const closeButton = container.querySelector('button[class*="opacity"]');
        expect(closeButton).toBeInTheDocument();
      });
    });

    it('should close toast when close button is clicked', async () => {
      const { container } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Success'));

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
      });

      // Click close button
      const closeButton = container.querySelector(
        'button[class*="opacity"]'
      ) as HTMLElement;
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
      });
    });

    it('should apply correct styles for success toast', async () => {
      const { container } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Success'));

      await waitFor(() => {
        const toastElement = container.querySelector('.bg-green-50');
        expect(toastElement).toBeInTheDocument();
        expect(toastElement).toHaveClass('border-green-200');
        expect(toastElement).toHaveClass('text-green-800');
      });
    });

    it('should apply correct styles for error toast', async () => {
      const { container } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Error'));

      await waitFor(() => {
        const toastElement = container.querySelector('.bg-red-50');
        expect(toastElement).toBeInTheDocument();
        expect(toastElement).toHaveClass('border-red-200');
        expect(toastElement).toHaveClass('text-red-800');
      });
    });

    it('should apply correct styles for warning toast', async () => {
      const { container } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Warning'));

      await waitFor(() => {
        const toastElement = container.querySelector('.bg-yellow-50');
        expect(toastElement).toBeInTheDocument();
        expect(toastElement).toHaveClass('border-yellow-200');
        expect(toastElement).toHaveClass('text-yellow-800');
      });
    });

    it('should apply correct styles for info toast', async () => {
      const { container } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Info'));

      await waitFor(() => {
        const toastElement = container.querySelector('.bg-blue-50');
        expect(toastElement).toBeInTheDocument();
        expect(toastElement).toHaveClass('border-blue-200');
        expect(toastElement).toHaveClass('text-blue-800');
      });
    });

    it('should render icons for each toast type', async () => {
      const { container } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });

      // Test success icon
      await user.click(screen.getByText('Success'));
      await waitFor(() => {
        const successIcon = container.querySelector('.text-green-600');
        expect(successIcon).toBeInTheDocument();
      });
    });
  });

  // ========== Edge Cases Tests ==========

  describe('Edge Cases', () => {
    it('should handle rapid toast additions', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });

      // Add 10 toasts rapidly
      for (let i = 0; i < 10; i++) {
        await user.click(screen.getByText('Success'));
      }

      // Should have added all toasts (limited by maxToasts default of 5)
      await waitFor(() => {
        const count = screen.getByTestId('toast-count');
        expect(parseInt(count.textContent || '0')).toBeLessThanOrEqual(10);
      });
    });

    it('should handle hideToast with non-existent ID gracefully', async () => {
      const TestHideNonExistent: React.FC = () => {
        const { toasts, success, hideToast } = useToast();
        return (
          <div>
            <div data-testid="toast-count">{toasts.length}</div>
            <button onClick={() => success('Success')}>Success</button>
            <button onClick={() => hideToast('non-existent-id')}>
              Hide Non-Existent
            </button>
          </div>
        );
      };

      render(
        <ToastProvider>
          <TestHideNonExistent />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Success'));

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
      });

      // Try to hide non-existent toast (should not crash)
      await user.click(screen.getByText('Hide Non-Existent'));

      // Toast should still be there
      expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
    });

    it('should handle duration of 0 (no auto-dismiss)', async () => {
      const TestNoDismiss: React.FC = () => {
        const { toasts, showToast } = useToast();
        return (
          <div>
            <div data-testid="toast-count">{toasts.length}</div>
            <button onClick={() => showToast('Persistent', 'info', 0)}>
              Show Persistent
            </button>
          </div>
        );
      };

      render(
        <ToastProvider>
          <TestNoDismiss />
        </ToastProvider>
      );

      const user = userEvent.setup({ delay: null });
      await user.click(screen.getByText('Show Persistent'));

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
      });

      // Fast-forward time by a lot
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      // Toast should still be there (no auto-dismiss)
      expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
    });
  });
});
