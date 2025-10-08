/**
 * AuthContext Tests
 *
 * Comprehensive test suite for authentication context
 * Tests API key management, validation, persistence, and state management
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth, withAuth } from '../auth-context';
import { ContentGeneratorAPI } from '@/lib/api/api-client';

// Mock dependencies
jest.mock('@/lib/api/api-client');
jest.mock('@/app/hooks', () => ({
  useLocalStorage: jest.fn(),
}));

const mockUseLocalStorage = require('@/app/hooks').useLocalStorage;

// Test component that uses the useAuth hook
const TestComponent: React.FC = () => {
  const {
    isAuthenticated,
    apiKey,
    isLoading,
    error,
    setApiKey,
    clearApiKey,
    validateApiKey,
  } = useAuth();

  return (
    <div>
      <div data-testid="is-authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="api-key">{apiKey || 'null'}</div>
      <div data-testid="is-loading">{isLoading.toString()}</div>
      <div data-testid="error">{error || 'null'}</div>
      <button onClick={() => setApiKey('test-key-123')}>Set API Key</button>
      <button onClick={clearApiKey}>Clear API Key</button>
      <button onClick={validateApiKey}>Validate API Key</button>
    </div>
  );
};

describe('AuthContext', () => {
  let mockHealthCheck: jest.Mock;
  let mockSetStoredApiKey: jest.Mock;
  let mockRemoveStoredApiKey: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useLocalStorage hook
    mockSetStoredApiKey = jest.fn();
    mockRemoveStoredApiKey = jest.fn();
    mockUseLocalStorage.mockReturnValue([
      null, // initial value
      mockSetStoredApiKey,
      mockRemoveStoredApiKey,
    ]);

    // Mock ContentGeneratorAPI
    mockHealthCheck = jest.fn().mockResolvedValue({
      success: true,
      data: { status: 'healthy' },
    });

    (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
      () =>
        ({
          healthCheck: mockHealthCheck,
        }) as any
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========== Provider Tests ==========

  describe('AuthProvider', () => {
    it('should render children', () => {
      render(
        <AuthProvider>
          <div data-testid="child">Child Content</div>
        </AuthProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('should provide auth context to children', async () => {
      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toBeInTheDocument();
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });
    });

    it('should accept custom apiUrl prop', async () => {
      const customUrl = 'https://custom-api.example.com';

      render(
        <AuthProvider apiUrl={customUrl}>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(ContentGeneratorAPI).toHaveBeenCalledWith(customUrl, undefined);
      });
    });

    it('should use default apiUrl when not provided', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(ContentGeneratorAPI).toHaveBeenCalled();
      });
    });

    it('should validate stored API key on mount', async () => {
      // Mock stored API key
      mockUseLocalStorage.mockReturnValue([
        'stored-key-123',
        mockSetStoredApiKey,
        mockRemoveStoredApiKey,
      ]);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockHealthCheck).toHaveBeenCalled();
      });
    });
  });

  // ========== useAuth Hook Tests ==========

  describe('useAuth', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleError.mockRestore();
    });

    it('should return auth context value', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('api-key')).toHaveTextContent('null');
        expect(screen.getByTestId('error')).toHaveTextContent('null');
      });
    });
  });

  // ========== setApiKey Tests ==========

  describe('setApiKey', () => {
    it('should set API key when validation succeeds', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      await act(async () => {
        await user.click(screen.getByText('Set API Key'));
      });

      await waitFor(() => {
        expect(mockHealthCheck).toHaveBeenCalled();
        expect(mockSetStoredApiKey).toHaveBeenCalledWith('test-key-123');
      });
    });

    it('should update authentication state when key is valid', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      await user.click(screen.getByText('Set API Key'));

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      });
    });

    it('should set loading state during validation', async () => {
      const user = userEvent.setup();

      // Mock slow health check
      mockHealthCheck.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      await user.click(screen.getByText('Set API Key'));

      // Should show loading immediately
      expect(screen.getByTestId('is-loading')).toHaveTextContent('true');

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });
    });

    it('should set error when validation fails', async () => {
      const user = userEvent.setup();
      mockHealthCheck.mockResolvedValue({
        success: false,
        error: { message: 'Invalid API key' },
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      await user.click(screen.getByText('Set API Key'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid API key');
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      });
    });

    it('should handle network errors during validation', async () => {
      const user = userEvent.setup();
      mockHealthCheck.mockRejectedValue(new Error('Network error'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      await user.click(screen.getByText('Set API Key'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Network error');
      });
    });

    it('should clear previous errors when setting new key', async () => {
      const user = userEvent.setup();

      // First attempt fails
      mockHealthCheck.mockResolvedValueOnce({
        success: false,
        error: { message: 'Invalid key' },
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      await user.click(screen.getByText('Set API Key'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid key');
      });

      // Second attempt succeeds
      mockHealthCheck.mockResolvedValue({ success: true });
      await user.click(screen.getByText('Set API Key'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('null');
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      });
    });
  });

  // ========== clearApiKey Tests ==========

  describe('clearApiKey', () => {
    it('should clear API key from storage', async () => {
      const user = userEvent.setup();

      mockUseLocalStorage.mockReturnValue([
        'existing-key',
        mockSetStoredApiKey,
        mockRemoveStoredApiKey,
      ]);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      await user.click(screen.getByText('Clear API Key'));

      await waitFor(() => {
        expect(mockRemoveStoredApiKey).toHaveBeenCalled();
      });
    });

    it('should update authentication state to false', async () => {
      const user = userEvent.setup();

      // Start with authenticated state
      mockUseLocalStorage.mockReturnValue([
        'existing-key',
        mockSetStoredApiKey,
        mockRemoveStoredApiKey,
      ]);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      });

      await user.click(screen.getByText('Clear API Key'));

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      });
    });

    it('should clear any existing errors', async () => {
      const user = userEvent.setup();

      // Start with error state
      mockHealthCheck.mockResolvedValue({
        success: false,
        error: { message: 'Invalid key' },
      });

      mockUseLocalStorage.mockReturnValue([
        'invalid-key',
        mockSetStoredApiKey,
        mockRemoveStoredApiKey,
      ]);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).not.toHaveTextContent('null');
      });

      await user.click(screen.getByText('Clear API Key'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('null');
      });
    });

    it('should create new API client without key', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      const initialCallCount = (ContentGeneratorAPI as jest.Mock).mock.calls.length;

      await user.click(screen.getByText('Clear API Key'));

      await waitFor(() => {
        expect(ContentGeneratorAPI).toHaveBeenCalledTimes(initialCallCount + 1);
      });
    });
  });

  // ========== validateApiKey Tests ==========

  describe('validateApiKey', () => {
    it('should return false when no API key is stored', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      await user.click(screen.getByText('Validate API Key'));

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      });
    });

    it('should return true when validation succeeds', async () => {
      const user = userEvent.setup();

      mockUseLocalStorage.mockReturnValue([
        'valid-key',
        mockSetStoredApiKey,
        mockRemoveStoredApiKey,
      ]);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      });

      await user.click(screen.getByText('Validate API Key'));

      await waitFor(() => {
        expect(mockHealthCheck).toHaveBeenCalled();
      });
    });

    it('should set loading state during validation', async () => {
      const user = userEvent.setup();

      mockUseLocalStorage.mockReturnValue([
        'test-key',
        mockSetStoredApiKey,
        mockRemoveStoredApiKey,
      ]);

      mockHealthCheck.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial validation
      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      await user.click(screen.getByText('Validate API Key'));

      expect(screen.getByTestId('is-loading')).toHaveTextContent('true');

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });
    });

    it('should handle validation errors', async () => {
      const user = userEvent.setup();

      mockUseLocalStorage.mockReturnValue([
        'test-key',
        mockSetStoredApiKey,
        mockRemoveStoredApiKey,
      ]);

      mockHealthCheck.mockRejectedValue(new Error('Validation failed'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Validation failed');
      });
    });

    it('should update API client on successful validation', async () => {
      const user = userEvent.setup();

      mockUseLocalStorage.mockReturnValue([
        'valid-key',
        mockSetStoredApiKey,
        mockRemoveStoredApiKey,
      ]);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      });

      const callCountBefore = (ContentGeneratorAPI as jest.Mock).mock.calls.length;

      await user.click(screen.getByText('Validate API Key'));

      await waitFor(() => {
        expect(ContentGeneratorAPI).toHaveBeenCalledTimes(callCountBefore + 1);
      });
    });
  });

  // ========== Initial Validation Tests ==========

  describe('Initial Validation', () => {
    it('should validate stored API key on mount', async () => {
      mockUseLocalStorage.mockReturnValue([
        'stored-key',
        mockSetStoredApiKey,
        mockRemoveStoredApiKey,
      ]);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockHealthCheck).toHaveBeenCalled();
      });
    });

    it('should set isLoading to false after initial validation', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });
    });

    it('should not validate when no key is stored', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      // Health check should not be called for null key
      expect(mockHealthCheck).not.toHaveBeenCalled();
    });
  });

  // ========== withAuth HOC Tests ==========

  describe('withAuth HOC', () => {
    const TestPage: React.FC = () => <div data-testid="protected-content">Protected Content</div>;

    it('should show loading state while authenticating', () => {
      mockUseLocalStorage.mockReturnValue([
        'test-key',
        mockSetStoredApiKey,
        mockRemoveStoredApiKey,
      ]);

      const ProtectedPage = withAuth(TestPage);

      render(
        <AuthProvider>
          <ProtectedPage />
        </AuthProvider>
      );

      expect(screen.getByText('Authenticating...')).toBeInTheDocument();
    });

    it('should show authentication required when not authenticated', async () => {
      const ProtectedPage = withAuth(TestPage);

      render(
        <AuthProvider>
          <ProtectedPage />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Authentication Required')).toBeInTheDocument();
        expect(screen.getByText('Go to Settings')).toBeInTheDocument();
      });
    });

    it('should render component when authenticated', async () => {
      mockUseLocalStorage.mockReturnValue([
        'valid-key',
        mockSetStoredApiKey,
        mockRemoveStoredApiKey,
      ]);

      const ProtectedPage = withAuth(TestPage);

      render(
        <AuthProvider>
          <ProtectedPage />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    it('should preserve component displayName', () => {
      const NamedComponent: React.FC = () => <div>Named</div>;
      NamedComponent.displayName = 'NamedComponent';

      const WrappedComponent = withAuth(NamedComponent);

      expect(WrappedComponent.displayName).toBe('withAuth(NamedComponent)');
    });

    it('should handle anonymous components', () => {
      const WrappedComponent = withAuth(() => <div>Anonymous</div>);

      expect(WrappedComponent.displayName).toContain('withAuth');
    });
  });

  // ========== Edge Cases ==========

  describe('Edge Cases', () => {
    it('should handle undefined error in health check response', async () => {
      const user = userEvent.setup();

      mockHealthCheck.mockResolvedValue({
        success: false,
        error: undefined,
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      await user.click(screen.getByText('Set API Key'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid API key');
      });
    });

    it('should handle non-Error exceptions', async () => {
      const user = userEvent.setup();

      mockHealthCheck.mockRejectedValue('String error');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      await user.click(screen.getByText('Set API Key'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Unknown error');
      });
    });

    it('should handle rapid setApiKey calls', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      // Rapid clicks
      await user.click(screen.getByText('Set API Key'));
      await user.click(screen.getByText('Set API Key'));
      await user.click(screen.getByText('Set API Key'));

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      // Should handle gracefully
      expect(mockHealthCheck).toHaveBeenCalled();
    });

    it('should handle clearApiKey when no key is set', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      await user.click(screen.getByText('Clear API Key'));

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      });
    });
  });
});
