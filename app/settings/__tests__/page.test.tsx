/**
 * Settings Page Tests
 *
 * Test suite for settings and configuration page
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SettingsPage from '../page';

// Mock dependencies
jest.mock('@/app/contexts', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/app/context/preferences-context', () => ({
  usePreferences: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  toast: jest.fn(),
}));

jest.mock('@/app/components/features/cache-stats', () => {
  return function MockCacheStats() {
    return <div data-testid="cache-stats">Cache Stats Component</div>;
  };
});

import { useAuth } from '@/app/contexts';
import { usePreferences } from '@/app/context/preferences-context';

describe('SettingsPage', () => {
  let mockSetApiKey: jest.Mock;
  let mockClearApiKey: jest.Mock;
  let mockUpdateNotificationPreferences: jest.Mock;
  let mockUpdateDisplayPreferences: jest.Mock;
  let mockResetPreferences: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock auth context
    mockSetApiKey = jest.fn().mockResolvedValue(undefined);
    mockClearApiKey = jest.fn();

    useAuth.mockReturnValue({
      apiKey: null,
      setApiKey: mockSetApiKey,
      clearApiKey: mockClearApiKey,
      isLoading: false,
      error: null,
    });

    // Mock preferences context
    mockUpdateNotificationPreferences = jest.fn();
    mockUpdateDisplayPreferences = jest.fn();
    mockResetPreferences = jest.fn();

    usePreferences.mockReturnValue({
      preferences: {
        notifications: { enabled: true },
        display: { theme: 'light', itemsPerPage: 20 },
        filterPresets: [],
      },
      updateNotificationPreferences: mockUpdateNotificationPreferences,
      updateDisplayPreferences: mockUpdateDisplayPreferences,
      resetPreferences: mockResetPreferences,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Page Rendering', () => {
    it('should render settings page', () => {
      render(<SettingsPage />);

      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should render page description', () => {
      render(<SettingsPage />);

      expect(
        screen.getByText(/Configure your application settings/i)
      ).toBeInTheDocument();
    });

    it('should render API configuration section', () => {
      render(<SettingsPage />);

      expect(screen.getByText('API Configuration')).toBeInTheDocument();
    });

    it('should render cache stats component', () => {
      render(<SettingsPage />);

      expect(screen.getByTestId('cache-stats')).toBeInTheDocument();
    });
  });

  describe('Environment Display', () => {
    it('should display API URL', () => {
      render(<SettingsPage />);

      expect(screen.getByText('API Base URL')).toBeInTheDocument();
    });

    it('should display WebSocket URL', () => {
      render(<SettingsPage />);

      expect(screen.getByText('WebSocket URL')).toBeInTheDocument();
    });

    it('should use default API URL when env var not set', () => {
      const originalUrl = process.env.NEXT_PUBLIC_API_URL;
      delete process.env.NEXT_PUBLIC_API_URL;

      render(<SettingsPage />);

      expect(screen.getByText(/localhost:8000/)).toBeInTheDocument();

      process.env.NEXT_PUBLIC_API_URL = originalUrl;
    });

    it('should use default WS URL when env var not set', () => {
      const originalUrl = process.env.NEXT_PUBLIC_WS_URL;
      delete process.env.NEXT_PUBLIC_WS_URL;

      render(<SettingsPage />);

      expect(screen.getByText(/ws:\/\/localhost:8000/)).toBeInTheDocument();

      process.env.NEXT_PUBLIC_WS_URL = originalUrl;
    });
  });

  describe('API Key Management', () => {
    it('should render API key input', () => {
      render(<SettingsPage />);

      expect(screen.getByPlaceholderText(/Enter your API key/i)).toBeInTheDocument();
    });

    it('should initialize with saved API key', () => {
      useAuth.mockReturnValue({
        apiKey: 'saved-key-123',
        setApiKey: mockSetApiKey,
        clearApiKey: mockClearApiKey,
        isLoading: false,
        error: null,
      });

      render(<SettingsPage />);

      const input = screen.getByPlaceholderText(/Enter your API key/i) as HTMLInputElement;
      expect(input.value).toBe('saved-key-123');
    });

    it('should toggle API key visibility', async () => {
      const user = userEvent.setup({ delay: null });

      render(<SettingsPage />);

      const input = screen.getByPlaceholderText(/Enter your API key/i) as HTMLInputElement;
      expect(input.type).toBe('password');

      // Click toggle button (eye icon)
      const toggleButtons = screen.getAllByRole('button');
      const toggleButton = toggleButtons.find(btn => btn.className.includes('absolute'));

      if (toggleButton) {
        await user.click(toggleButton);
        expect(input.type).toBe('text');
      }
    });

    it('should update input when typing', async () => {
      const user = userEvent.setup({ delay: null });

      render(<SettingsPage />);

      const input = screen.getByPlaceholderText(/Enter your API key/i);
      await user.type(input, 'new-api-key');

      expect(input).toHaveValue('new-api-key');
    });

    it('should save API key when save button clicked', async () => {
      const user = userEvent.setup({ delay: null });

      render(<SettingsPage />);

      const input = screen.getByPlaceholderText(/Enter your API key/i);
      await user.type(input, 'test-key');

      const saveButton = screen.getByText(/Save API Key/i);
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockSetApiKey).toHaveBeenCalledWith('test-key');
      });
    });

    it('should show error for empty API key', async () => {
      const user = userEvent.setup({ delay: null });

      render(<SettingsPage />);

      const saveButton = screen.getByText(/Save API Key/i);
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/API key cannot be empty/i)).toBeInTheDocument();
      });
    });

    it('should trim whitespace from API key', async () => {
      const user = userEvent.setup({ delay: null });

      render(<SettingsPage />);

      const input = screen.getByPlaceholderText(/Enter your API key/i);
      await user.type(input, '  test-key  ');

      const saveButton = screen.getByText(/Save API Key/i);
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockSetApiKey).toHaveBeenCalledWith('test-key');
      });
    });

    it('should show success message after save', async () => {
      const user = userEvent.setup({ delay: null });

      render(<SettingsPage />);

      const input = screen.getByPlaceholderText(/Enter your API key/i);
      await user.type(input, 'test-key');

      const saveButton = screen.getByText(/Save API Key/i);
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/API key saved successfully/i)).toBeInTheDocument();
      });
    });

    it('should clear success message after timeout', async () => {
      const user = userEvent.setup({ delay: null });

      render(<SettingsPage />);

      const input = screen.getByPlaceholderText(/Enter your API key/i);
      await user.type(input, 'test-key');

      const saveButton = screen.getByText(/Save API Key/i);
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/API key saved successfully/i)).toBeInTheDocument();
      });

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByText(/API key saved successfully/i)).not.toBeInTheDocument();
      });
    });

    it('should handle save error', async () => {
      const user = userEvent.setup({ delay: null });
      mockSetApiKey.mockRejectedValue(new Error('Invalid key'));

      render(<SettingsPage />);

      const input = screen.getByPlaceholderText(/Enter your API key/i);
      await user.type(input, 'invalid-key');

      const saveButton = screen.getByText(/Save API Key/i);
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid key/i)).toBeInTheDocument();
      });
    });

    it('should clear API key when clear button clicked', async () => {
      const user = userEvent.setup({ delay: null });

      useAuth.mockReturnValue({
        apiKey: 'saved-key',
        setApiKey: mockSetApiKey,
        clearApiKey: mockClearApiKey,
        isLoading: false,
        error: null,
      });

      render(<SettingsPage />);

      const clearButton = screen.getByText(/Clear API Key/i);
      await user.click(clearButton);

      await waitFor(() => {
        expect(mockClearApiKey).toHaveBeenCalled();
      });
    });

    it('should reset input after clearing', async () => {
      const user = userEvent.setup({ delay: null });

      render(<SettingsPage />);

      const input = screen.getByPlaceholderText(/Enter your API key/i) as HTMLInputElement;
      await user.type(input, 'test');

      const clearButton = screen.getByText(/Clear API Key/i);
      await user.click(clearButton);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading state', () => {
      useAuth.mockReturnValue({
        apiKey: null,
        setApiKey: mockSetApiKey,
        clearApiKey: mockClearApiKey,
        isLoading: true,
        error: null,
      });

      render(<SettingsPage />);

      expect(screen.getByText(/Validating/i)).toBeInTheDocument();
    });

    it('should disable save button when loading', () => {
      useAuth.mockReturnValue({
        apiKey: null,
        setApiKey: mockSetApiKey,
        clearApiKey: mockClearApiKey,
        isLoading: true,
        error: null,
      });

      render(<SettingsPage />);

      const saveButton = screen.getByText(/Validating/i);
      expect(saveButton).toBeDisabled();
    });
  });

  describe('Error Display', () => {
    it('should display auth error', () => {
      useAuth.mockReturnValue({
        apiKey: null,
        setApiKey: mockSetApiKey,
        clearApiKey: mockClearApiKey,
        isLoading: false,
        error: 'Authentication failed',
      });

      render(<SettingsPage />);

      expect(screen.getByText(/Authentication failed/i)).toBeInTheDocument();
    });
  });

  describe('Preferences Integration', () => {
    it('should display current preferences', () => {
      render(<SettingsPage />);

      expect(screen.getByText(/User Preferences/i)).toBeInTheDocument();
    });

    it('should show theme setting', () => {
      render(<SettingsPage />);

      expect(screen.getByText(/Theme/i)).toBeInTheDocument();
    });

    it('should show notification setting', () => {
      render(<SettingsPage />);

      expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
    });
  });

  describe('Cache Stats Integration', () => {
    it('should render cache stats component', () => {
      render(<SettingsPage />);

      expect(screen.getByTestId('cache-stats')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels', () => {
      render(<SettingsPage />);

      expect(screen.getByLabelText(/API Key/i)).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      render(<SettingsPage />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid saves', async () => {
      const user = userEvent.setup({ delay: null });

      render(<SettingsPage />);

      const input = screen.getByPlaceholderText(/Enter your API key/i);
      await user.type(input, 'test-key');

      const saveButton = screen.getByText(/Save API Key/i);
      await user.click(saveButton);
      await user.click(saveButton);
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockSetApiKey).toHaveBeenCalled();
      });
    });

    it('should handle context errors gracefully', () => {
      useAuth.mockReturnValue({});
      usePreferences.mockReturnValue({});

      expect(() => {
        render(<SettingsPage />);
      }).not.toThrow();
    });

    it('should handle missing preferences', () => {
      usePreferences.mockReturnValue({
        preferences: null,
        updateNotificationPreferences: mockUpdateNotificationPreferences,
        updateDisplayPreferences: mockUpdateDisplayPreferences,
        resetPreferences: mockResetPreferences,
      });

      expect(() => {
        render(<SettingsPage />);
      }).not.toThrow();
    });
  });
});
