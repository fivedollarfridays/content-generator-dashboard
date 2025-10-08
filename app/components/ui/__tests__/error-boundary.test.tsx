/**
 * ErrorBoundary Component Tests
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ErrorBoundary, SimpleErrorBoundary } from '../error-boundary';

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean; message?: string }> = ({
  shouldThrow = true,
  message = 'Test error',
}) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>No error</div>;
};

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Error Catching', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Child content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('should catch and display errors from children', () => {
      render(
        <ErrorBoundary>
          <ThrowError message="Test error message" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('should display default error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(
        screen.getByText('An unexpected error occurred in the application')
      ).toBeInTheDocument();
    });

    it('should display custom error message', () => {
      render(
        <ErrorBoundary errorMessage="Custom error description">
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error description')).toBeInTheDocument();
    });

    it('should display error details', () => {
      render(
        <ErrorBoundary>
          <ThrowError message="Detailed error" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Message:')).toBeInTheDocument();
      expect(screen.getByText('Detailed error')).toBeInTheDocument();
    });
  });

  describe('Reset Functionality', () => {
    it('should reset error state when Try Again clicked', async () => {
      const user = userEvent.setup();
      let shouldThrow = true;

      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Update to not throw error
      shouldThrow = false;

      // Rerender with updated prop BEFORE clicking Try Again
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );

      // Wait a bit for rerender to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      const tryAgainButton = screen.getByText('Try Again');
      await user.click(tryAgainButton);

      await waitFor(
        () => {
          expect(screen.getByText('No error')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should have Go to Home button', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const homeButton = screen.getByText('Go to Home');
      expect(homeButton).toBeInTheDocument();
    });

    it('should display help text', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(
        screen.getByText(/If this problem persists, please contact support/)
      ).toBeInTheDocument();
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = (error: Error, errorInfo: any, reset: () => void) => (
        <div>
          <h1>Custom Error UI</h1>
          <p>Error: {error.message}</p>
          <button onClick={reset}>Reset</button>
        </div>
      );

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError message="Custom error" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
      expect(screen.getByText('Error: Custom error')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('should call reset function in custom fallback', async () => {
      const user = userEvent.setup();
      let shouldThrow = true;

      const customFallback = (error: Error, errorInfo: any, reset: () => void) => (
        <div>
          <button onClick={reset}>Custom Reset</button>
        </div>
      );

      const { rerender } = render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );

      shouldThrow = false;

      // Rerender with updated prop BEFORE clicking
      rerender(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );

      // Wait a bit for rerender to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      const resetButton = screen.getByText('Custom Reset');
      await user.click(resetButton);

      await waitFor(
        () => {
          expect(screen.getByText('No error')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Error Callback', () => {
    it('should call onError callback when error occurs', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError message="Callback test" />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0].message).toBe('Callback test');
    });

    it('should not call onError if not provided', () => {
      expect(() => {
        render(
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        );
      }).not.toThrow();
    });
  });

  describe('Development Mode', () => {
    it('should show stack trace in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Stack Trace (Development Only)')).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('should not show stack trace in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(
        screen.queryByText('Stack Trace (Development Only)')
      ).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('UI Elements', () => {
    it('should render error icon', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const errorIcon = document.querySelector('svg.text-red-600');
      expect(errorIcon).toBeInTheDocument();
    });

    it('should have proper styling classes', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const container = screen.getByText('Something went wrong').closest('div');
      expect(container?.parentElement?.parentElement).toHaveClass('bg-white');
    });

    it('should have action buttons', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const tryAgainBtn = screen.getByText('Try Again');
      const homeBtn = screen.getByText('Go to Home');

      expect(tryAgainBtn).toHaveClass('bg-blue-600');
      expect(homeBtn).toHaveClass('bg-gray-200');
    });
  });

  describe('Error State Management', () => {
    it('should initialize with no error state', () => {
      render(
        <ErrorBoundary>
          <div>Normal content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Normal content')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('should update state when error is caught', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should clear state on reset', async () => {
      const user = userEvent.setup();
      let throwError = true;

      const TestComponent = () => {
        if (throwError) {
          throw new Error('Test');
        }
        return <div>Success</div>;
      };

      const { rerender } = render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      throwError = false;
      const tryAgainButton = screen.getByText('Try Again');
      await user.click(tryAgainButton);

      rerender(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText('Success')).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Children', () => {
    it('should handle multiple children', () => {
      render(
        <ErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });

    it('should catch error from any child', () => {
      render(
        <ErrorBoundary>
          <div>Child 1</div>
          <ThrowError />
          <div>Child 3</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
    });
  });
});

describe('SimpleErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render children when no error', () => {
      render(
        <SimpleErrorBoundary>
          <div>Simple child content</div>
        </SimpleErrorBoundary>
      );

      expect(screen.getByText('Simple child content')).toBeInTheDocument();
    });

    it('should show simple error UI on error', () => {
      render(
        <SimpleErrorBoundary>
          <ThrowError message="Simple error" />
        </SimpleErrorBoundary>
      );

      expect(screen.getByText(/Error:/)).toBeInTheDocument();
      expect(screen.getByText(/Simple error/)).toBeInTheDocument();
    });

    it('should have try again button', () => {
      render(
        <SimpleErrorBoundary>
          <ThrowError />
        </SimpleErrorBoundary>
      );

      expect(screen.getByText('Try again')).toBeInTheDocument();
    });

    it('should use compact styling', () => {
      render(
        <SimpleErrorBoundary>
          <ThrowError />
        </SimpleErrorBoundary>
      );

      const errorContainer = screen.getByText(/Error:/).closest('div');
      expect(errorContainer).toHaveClass('bg-red-50');
      expect(errorContainer).toHaveClass('border-red-200');
    });
  });

  describe('Reset Functionality', () => {
    it('should reset on try again click', async () => {
      const user = userEvent.setup();
      let shouldThrow = true;

      const { rerender } = render(
        <SimpleErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </SimpleErrorBoundary>
      );

      expect(screen.getByText(/Error:/)).toBeInTheDocument();

      shouldThrow = false;

      // Rerender with updated prop BEFORE clicking Try again
      rerender(
        <SimpleErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </SimpleErrorBoundary>
      );

      // Wait a bit for rerender to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      const tryAgainButton = screen.getByText('Try again');
      await user.click(tryAgainButton);

      await waitFor(
        () => {
          expect(screen.getByText('No error')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Error Display', () => {
    it('should display error message inline', () => {
      render(
        <SimpleErrorBoundary>
          <ThrowError message="Inline error message" />
        </SimpleErrorBoundary>
      );

      expect(screen.getByText(/Inline error message/)).toBeInTheDocument();
    });

    it('should have underlined button', () => {
      render(
        <SimpleErrorBoundary>
          <ThrowError />
        </SimpleErrorBoundary>
      );

      const button = screen.getByText('Try again');
      expect(button).toHaveClass('underline');
    });
  });
});

describe('ErrorBoundary Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle errors without error message', () => {
    const ErrorComponent = () => {
      const error = new Error();
      error.message = '';
      throw error;
    };

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should handle nested error boundaries', () => {
    render(
      <ErrorBoundary errorMessage="Outer boundary">
        <div>
          <ErrorBoundary errorMessage="Inner boundary">
            <ThrowError message="Nested error" />
          </ErrorBoundary>
        </div>
      </ErrorBoundary>
    );

    // Inner boundary should catch the error
    expect(screen.getByText('Inner boundary')).toBeInTheDocument();
    expect(screen.queryByText('Outer boundary')).not.toBeInTheDocument();
  });

  it('should handle async errors', async () => {
    const AsyncErrorComponent = () => {
      React.useEffect(() => {
        throw new Error('Async error');
      }, []);
      return <div>Component</div>;
    };

    render(
      <ErrorBoundary>
        <AsyncErrorComponent />
      </ErrorBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  it('should handle rapid error resets', async () => {
    const user = userEvent.setup({ delay: null });
    let shouldThrow = true;

    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={shouldThrow} />
      </ErrorBoundary>
    );

    shouldThrow = false;

    // Rerender with updated prop BEFORE clicking
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={shouldThrow} />
      </ErrorBoundary>
    );

    // Wait a bit for rerender to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Rapid clicks
    const tryAgainButton = screen.getByText('Try Again');
    await user.click(tryAgainButton);
    await user.click(tryAgainButton);
    await user.click(tryAgainButton);

    await waitFor(
      () => {
        expect(screen.getByText('No error')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
