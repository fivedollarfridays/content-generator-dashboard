/**
 * PreferencesContext Tests
 *
 * Comprehensive test suite for user preferences management
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { PreferencesProvider, usePreferences } from '../preferences-context';
import { DEFAULT_PREFERENCES } from '@/types/preferences';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Test component that uses the usePreferences hook
const TestComponent: React.FC = () => {
  const {
    preferences,
    updateNotificationPreferences,
    addFilterPreset,
    removeFilterPreset,
    updateDisplayPreferences,
    resetPreferences,
  } = usePreferences();

  return (
    <div>
      <div data-testid="theme">{preferences.display.theme}</div>
      <div data-testid="enable-notifications">
        {preferences.notifications.enabled.toString()}
      </div>
      <div data-testid="filter-presets-count">{preferences.filterPresets.length}</div>
      <div data-testid="items-per-page">{preferences.display.itemsPerPage}</div>

      <button onClick={() => updateNotificationPreferences({ enabled: false })}>
        Disable Notifications
      </button>
      <button
        onClick={() =>
          addFilterPreset({
            name: 'Test Preset',
            filters: { status: ['completed'] },
          })
        }
      >
        Add Preset
      </button>
      <button onClick={() => updateDisplayPreferences({ theme: 'dark' })}>
        Set Dark Theme
      </button>
      <button onClick={resetPreferences}>Reset Preferences</button>
      {preferences.filterPresets.length > 0 && (
        <button onClick={() => removeFilterPreset(preferences.filterPresets[0].id)}>
          Remove First Preset
        </button>
      )}
    </div>
  );
};

describe('PreferencesContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  // ========== Provider Tests ==========

  describe('PreferencesProvider', () => {
    it('should render children', () => {
      render(
        <PreferencesProvider>
          <div data-testid="child">Child Content</div>
        </PreferencesProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('should provide preferences context to children', () => {
      render(
        <PreferencesProvider>
          <TestComponent />
        </PreferencesProvider>
      );

      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(screen.getByTestId('enable-notifications')).toHaveTextContent('true');
    });

    it('should initialize with default preferences', () => {
      render(
        <PreferencesProvider>
          <TestComponent />
        </PreferencesProvider>
      );

      expect(screen.getByTestId('theme')).toHaveTextContent(DEFAULT_PREFERENCES.display.theme);
      expect(screen.getByTestId('items-per-page')).toHaveTextContent(
        DEFAULT_PREFERENCES.display.itemsPerPage.toString()
      );
    });

    it('should load preferences from localStorage on mount', () => {
      const storedPrefs = {
        display: { theme: 'dark', itemsPerPage: 50 },
        notifications: { enabled: false },
        filterPresets: [],
      };
      localStorageMock.setItem('user_preferences', JSON.stringify(storedPrefs));

      render(
        <PreferencesProvider>
          <TestComponent />
        </PreferencesProvider>
      );

      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('enable-notifications')).toHaveTextContent('false');
      expect(screen.getByTestId('items-per-page')).toHaveTextContent('50');
    });

    it('should handle corrupted localStorage data gracefully', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      localStorageMock.setItem('user_preferences', 'invalid json{{{');

      render(
        <PreferencesProvider>
          <TestComponent />
        </PreferencesProvider>
      );

      // Should fall back to default preferences
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });

  // ========== usePreferences Hook Tests ==========

  describe('usePreferences', () => {
    it('should throw error when used outside PreferencesProvider', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('usePreferences must be used within a PreferencesProvider');

      consoleError.mockRestore();
    });

    it('should return preferences context value', () => {
      render(
        <PreferencesProvider>
          <TestComponent />
        </PreferencesProvider>
      );

      expect(screen.getByTestId('theme')).toBeInTheDocument();
      expect(screen.getByTestId('enable-notifications')).toBeInTheDocument();
    });
  });

  // ========== updateNotificationPreferences Tests ==========

  describe('updateNotificationPreferences', () => {
    it('should update notification preferences', async () => {
      const user = userEvent.setup();

      render(
        <PreferencesProvider>
          <TestComponent />
        </PreferencesProvider>
      );

      expect(screen.getByTestId('enable-notifications')).toHaveTextContent('true');

      await user.click(screen.getByText('Disable Notifications'));

      await waitFor(() => {
        expect(screen.getByTestId('enable-notifications')).toHaveTextContent('false');
      });
    });

    it('should save updated preferences to localStorage', async () => {
      const user = userEvent.setup();

      render(
        <PreferencesProvider>
          <TestComponent />
        </PreferencesProvider>
      );

      await user.click(screen.getByText('Disable Notifications'));

      await waitFor(() => {
        const stored = localStorageMock.getItem('user_preferences');
        expect(stored).toBeTruthy();
        const parsed = JSON.parse(stored!);
        expect(parsed.notifications.enabled).toBe(false);
      });
    });

    it('should preserve other preferences when updating notifications', async () => {
      const user = userEvent.setup();

      render(
        <PreferencesProvider>
          <TestComponent />
        </PreferencesProvider>
      );

      const initialTheme = screen.getByTestId('theme').textContent;

      await user.click(screen.getByText('Disable Notifications'));

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent(initialTheme!);
      });
    });
  });

  // ========== addFilterPreset Tests ==========

  describe('addFilterPreset', () => {
    it('should add a new filter preset', async () => {
      const user = userEvent.setup();

      render(
        <PreferencesProvider>
          <TestComponent />
        </PreferencesProvider>
      );

      expect(screen.getByTestId('filter-presets-count')).toHaveTextContent('0');

      await user.click(screen.getByText('Add Preset'));

      await waitFor(() => {
        expect(screen.getByTestId('filter-presets-count')).toHaveTextContent('1');
      });
    });

    it('should generate unique ID for new preset', async () => {
      const user = userEvent.setup();

      render(
        <PreferencesProvider>
          <TestComponent />
        </PreferencesProvider>
      );

      await user.click(screen.getByText('Add Preset'));
      await user.click(screen.getByText('Add Preset'));

      await waitFor(() => {
        const stored = localStorageMock.getItem('user_preferences');
        const parsed = JSON.parse(stored!);
        expect(parsed.filterPresets).toHaveLength(2);
        expect(parsed.filterPresets[0].id).not.toBe(parsed.filterPresets[1].id);
      });
    });

    it('should save preset to localStorage', async () => {
      const user = userEvent.setup();

      render(
        <PreferencesProvider>
          <TestComponent />
        </PreferencesProvider>
      );

      await user.click(screen.getByText('Add Preset'));

      await waitFor(() => {
        const stored = localStorageMock.getItem('user_preferences');
        const parsed = JSON.parse(stored!);
        expect(parsed.filterPresets[0].name).toBe('Test Preset');
        expect(parsed.filterPresets[0].filters.status).toEqual(['completed']);
      });
    });
  });

  // ========== removeFilterPreset Tests ==========

  describe('removeFilterPreset', () => {
    it('should remove a filter preset', async () => {
      const user = userEvent.setup();

      render(
        <PreferencesProvider>
          <TestComponent />
        </PreferencesProvider>
      );

      await user.click(screen.getByText('Add Preset'));

      await waitFor(() => {
        expect(screen.getByTestId('filter-presets-count')).toHaveTextContent('1');
      });

      await user.click(screen.getByText('Remove First Preset'));

      await waitFor(() => {
        expect(screen.getByTestId('filter-presets-count')).toHaveTextContent('0');
      });
    });

    it('should update localStorage when preset is removed', async () => {
      const user = userEvent.setup();

      render(
        <PreferencesProvider>
          <TestComponent />
        </PreferencesProvider>
      );

      await user.click(screen.getByText('Add Preset'));
      await user.click(screen.getByText('Remove First Preset'));

      await waitFor(() => {
        const stored = localStorageMock.getItem('user_preferences');
        const parsed = JSON.parse(stored!);
        expect(parsed.filterPresets).toHaveLength(0);
      });
    });

    it('should not affect other presets when removing one', async () => {
      const user = userEvent.setup();

      render(
        <PreferencesProvider>
          <TestComponent />
        </PreferencesProvider>
      );

      // Add two presets
      await user.click(screen.getByText('Add Preset'));
      await user.click(screen.getByText('Add Preset'));

      await waitFor(() => {
        expect(screen.getByTestId('filter-presets-count')).toHaveTextContent('2');
      });

      await user.click(screen.getByText('Remove First Preset'));

      await waitFor(() => {
        expect(screen.getByTestId('filter-presets-count')).toHaveTextContent('1');
      });
    });
  });

  // ========== updateDisplayPreferences Tests ==========

  describe('updateDisplayPreferences', () => {
    it('should update display preferences', async () => {
      const user = userEvent.setup();

      render(
        <PreferencesProvider>
          <TestComponent />
        </PreferencesProvider>
      );

      expect(screen.getByTestId('theme')).toHaveTextContent('light');

      await user.click(screen.getByText('Set Dark Theme'));

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      });
    });

    it('should save display preferences to localStorage', async () => {
      const user = userEvent.setup();

      render(
        <PreferencesProvider>
          <TestComponent />
        </PreferencesProvider>
      );

      await user.click(screen.getByText('Set Dark Theme'));

      await waitFor(() => {
        const stored = localStorageMock.getItem('user_preferences');
        const parsed = JSON.parse(stored!);
        expect(parsed.display.theme).toBe('dark');
      });
    });

    it('should preserve other display settings when updating theme', async () => {
      const user = userEvent.setup();

      render(
        <PreferencesProvider>
          <TestComponent />
        </PreferencesProvider>
      );

      const initialItemsPerPage = screen.getByTestId('items-per-page').textContent;

      await user.click(screen.getByText('Set Dark Theme'));

      await waitFor(() => {
        expect(screen.getByTestId('items-per-page')).toHaveTextContent(initialItemsPerPage!);
      });
    });
  });

  // ========== resetPreferences Tests ==========

  describe('resetPreferences', () => {
    it('should reset preferences to defaults', async () => {
      const user = userEvent.setup();

      render(
        <PreferencesProvider>
          <TestComponent />
        </PreferencesProvider>
      );

      // Make some changes
      await user.click(screen.getByText('Disable Notifications'));
      await user.click(screen.getByText('Set Dark Theme'));
      await user.click(screen.getByText('Add Preset'));

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      });

      // Reset
      await user.click(screen.getByText('Reset Preferences'));

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light');
        expect(screen.getByTestId('enable-notifications')).toHaveTextContent('true');
        expect(screen.getByTestId('filter-presets-count')).toHaveTextContent('0');
      });
    });

    it('should remove preferences from localStorage', async () => {
      const user = userEvent.setup();

      render(
        <PreferencesProvider>
          <TestComponent />
        </PreferencesProvider>
      );

      await user.click(screen.getByText('Set Dark Theme'));
      await user.click(screen.getByText('Reset Preferences'));

      await waitFor(() => {
        const stored = localStorageMock.getItem('user_preferences');
        expect(stored).toBeNull();
      });
    });
  });

  // ========== Edge Cases ==========

  describe('Edge Cases', () => {
    it('should handle localStorage errors when saving', async () => {
      const user = userEvent.setup();
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock setItem to throw error
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = jest.fn(() => {
        throw new Error('Storage full');
      });

      render(
        <PreferencesProvider>
          <TestComponent />
        </PreferencesProvider>
      );

      await user.click(screen.getByText('Set Dark Theme'));

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          'Failed to save preferences:',
          expect.any(Error)
        );
      });

      // Restore
      localStorageMock.setItem = originalSetItem;
      consoleError.mockRestore();
    });

    it('should handle multiple rapid updates', async () => {
      const user = userEvent.setup();

      render(
        <PreferencesProvider>
          <TestComponent />
        </PreferencesProvider>
      );

      // Rapid clicks
      await user.click(screen.getByText('Add Preset'));
      await user.click(screen.getByText('Add Preset'));
      await user.click(screen.getByText('Add Preset'));

      await waitFor(() => {
        expect(screen.getByTestId('filter-presets-count')).toHaveTextContent('3');
      });
    });

    it('should handle preset removal with non-existent ID', async () => {
      const user = userEvent.setup();

      render(
        <PreferencesProvider>
          <TestComponent />
        </PreferencesProvider>
      );

      await user.click(screen.getByText('Add Preset'));

      const TestRemoveComponent: React.FC = () => {
        const { removeFilterPreset } = usePreferences();
        return <button onClick={() => removeFilterPreset('non-existent')}>Remove Fake</button>;
      };

      const { rerender } = render(
        <PreferencesProvider>
          <TestRemoveComponent />
        </PreferencesProvider>
      );

      await user.click(screen.getByText('Remove Fake'));

      // Should not throw error
      expect(screen.getByText('Remove Fake')).toBeInTheDocument();
    });
  });

  // ========== LocalStorage Persistence ==========

  describe('LocalStorage Persistence', () => {
    it('should persist preferences across provider remounts', async () => {
      const user = userEvent.setup();

      const { rerender, unmount } = render(
        <PreferencesProvider>
          <TestComponent />
        </PreferencesProvider>
      );

      await user.click(screen.getByText('Set Dark Theme'));

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      });

      unmount();

      rerender(
        <PreferencesProvider>
          <TestComponent />
        </PreferencesProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      });
    });

    it('should merge stored preferences with defaults', () => {
      // Store partial preferences
      localStorageMock.setItem(
        'user_preferences',
        JSON.stringify({
          display: { theme: 'dark' },
        })
      );

      render(
        <PreferencesProvider>
          <TestComponent />
        </PreferencesProvider>
      );

      // Should have custom theme and default notifications
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('enable-notifications')).toHaveTextContent('true');
    });
  });
});
