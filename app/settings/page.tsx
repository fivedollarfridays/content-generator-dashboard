'use client';

import React, { useState, useCallback } from 'react';
import CacheStats from '@/app/components/features/cache-stats';
import { useAuth } from '@/app/contexts';
import { usePreferences } from '@/app/context/preferences-context';
import { toast } from 'react-hot-toast';

/**
 * Settings Page
 * Manage application settings, API configuration, and cache
 *
 * Features:
 * - API key management with authentication
 * - Environment configuration display
 * - Cache statistics and management
 * - User preferences
 *
 * @returns Settings page component
 */
const SettingsPage = (): React.ReactElement => {
  const {
    apiKey: savedApiKey,
    setApiKey,
    clearApiKey,
    isLoading,
    error,
  } = useAuth();
  const {
    preferences,
    updateNotificationPreferences,
    updateDisplayPreferences,
    resetPreferences,
  } = usePreferences();
  const [apiKey, setApiKeyInput] = useState<string>(savedApiKey || '');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Get API configuration from environment
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

  /**
   * Save and validate API key
   */
  const handleSaveApiKey = useCallback(async (): Promise<void> => {
    if (!apiKey.trim()) {
      setSaveError('API key cannot be empty');
      return;
    }

    try {
      await setApiKey(apiKey.trim());
      setSaveSuccess(true);
      setSaveError(null);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Failed to save API key'
      );
      setSaveSuccess(false);
    }
  }, [apiKey, setApiKey]);

  /**
   * Clear API key and log out
   */
  const handleClearApiKey = useCallback((): void => {
    clearApiKey();
    setApiKeyInput('');
    setSaveSuccess(false);
    setSaveError(null);
  }, [clearApiKey]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Configure your application settings and manage cache
          </p>
        </div>

        <div className="space-y-8">
          {/* API Configuration Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              API Configuration
            </h2>

            {/* Environment Display */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-600">
                  API Base URL
                </span>
                <code className="text-sm bg-gray-100 px-3 py-1 rounded font-mono">
                  {API_URL}
                </code>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-600">
                  WebSocket URL
                </span>
                <code className="text-sm bg-gray-100 px-3 py-1 rounded font-mono">
                  {WS_URL}
                </code>
              </div>
            </div>

            {/* API Key Management */}
            <div className="mt-6">
              <label
                htmlFor="apiKey"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                API Key (Optional)
              </label>
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    id="apiKey"
                    value={apiKey}
                    onChange={e => setApiKeyInput(e.target.value)}
                    placeholder="Enter your API key..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showApiKey ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                <button
                  onClick={handleSaveApiKey}
                  disabled={apiKey === savedApiKey}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save
                </button>
                {savedApiKey && (
                  <button
                    onClick={handleClearApiKey}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Store your API key locally for authenticated requests. This key
                is stored in your browser&apos;s localStorage.
              </p>

              {/* Success Message */}
              {saveSuccess && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-green-800">
                    API key saved and validated successfully!
                  </span>
                </div>
              )}

              {/* Error Message */}
              {saveError && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                  <svg
                    className="w-5 h-5 text-red-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-red-800">{saveError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Cache Management Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Cache Management
            </h2>
            <CacheStats
              apiUrl={API_URL}
              apiKey={savedApiKey || undefined}
              refreshInterval={15000}
              onInvalidate={() => {
                // Cache invalidated successfully
              }}
            />
          </div>

          {/* User Preferences Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                User Preferences
              </h2>
              <button
                onClick={() => {
                  resetPreferences();
                  toast.success('Preferences reset to defaults');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Reset to Defaults
              </button>
            </div>

            {/* Notification Preferences */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Notifications
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Enable Notifications
                    </h4>
                    <p className="text-xs text-gray-500">
                      Master toggle for all notifications
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.notifications.enabled}
                      onChange={e =>
                        updateNotificationPreferences({
                          enabled: e.target.checked,
                        })
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Success Notifications
                    </h4>
                    <p className="text-xs text-gray-500">
                      Notify when jobs complete successfully
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.notifications.onSuccess}
                      onChange={e =>
                        updateNotificationPreferences({
                          onSuccess: e.target.checked,
                        })
                      }
                      disabled={!preferences.notifications.enabled}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Failure Notifications
                    </h4>
                    <p className="text-xs text-gray-500">
                      Notify when jobs fail
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.notifications.onFailure}
                      onChange={e =>
                        updateNotificationPreferences({
                          onFailure: e.target.checked,
                        })
                      }
                      disabled={!preferences.notifications.enabled}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Partial Success Notifications
                    </h4>
                    <p className="text-xs text-gray-500">
                      Notify when jobs partially succeed
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.notifications.onPartial}
                      onChange={e =>
                        updateNotificationPreferences({
                          onPartial: e.target.checked,
                        })
                      }
                      disabled={!preferences.notifications.enabled}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Real-time Updates
                    </h4>
                    <p className="text-xs text-gray-500">
                      Show live notifications as jobs progress
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.notifications.realTimeUpdates}
                      onChange={e =>
                        updateNotificationPreferences({
                          realTimeUpdates: e.target.checked,
                        })
                      }
                      disabled={!preferences.notifications.enabled}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Display Preferences */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Display
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Table Density
                  </label>
                  <select
                    value={preferences.display.tableDensity}
                    onChange={e =>
                      updateDisplayPreferences({
                        tableDensity: e.target.value as
                          | 'compact'
                          | 'comfortable'
                          | 'spacious',
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="compact">Compact</option>
                    <option value="comfortable">Comfortable</option>
                    <option value="spacious">Spacious</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Refresh Interval (seconds)
                  </label>
                  <select
                    value={preferences.display.refreshInterval / 1000}
                    onChange={e =>
                      updateDisplayPreferences({
                        refreshInterval: parseInt(e.target.value) * 1000,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="10">10 seconds</option>
                    <option value="30">30 seconds</option>
                    <option value="60">1 minute</option>
                    <option value="300">5 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Page Size
                  </label>
                  <select
                    value={preferences.display.pageSize}
                    onChange={e =>
                      updateDisplayPreferences({
                        pageSize: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="10">10 items</option>
                    <option value="20">20 items</option>
                    <option value="50">50 items</option>
                    <option value="100">100 items</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Show Timestamps
                    </h4>
                    <p className="text-xs text-gray-500">
                      Display creation and completion times
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.display.showTimestamps}
                      onChange={e =>
                        updateDisplayPreferences({
                          showTimestamps: e.target.checked,
                        })
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              System Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Dashboard Version
                </h3>
                <p className="text-lg font-semibold text-gray-900">0.1.0</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Framework
                </h3>
                <p className="text-lg font-semibold text-gray-900">
                  Next.js 15.5
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  TypeScript
                </h3>
                <p className="text-lg font-semibold text-gray-900">5.7.3</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Build Mode
                </h3>
                <p className="text-lg font-semibold text-gray-900">
                  {process.env.NODE_ENV || 'development'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
