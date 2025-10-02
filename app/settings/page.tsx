'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CacheStats from '@/app/components/features/cache-stats';

/**
 * Settings Page
 * Manage application settings, API configuration, and cache
 *
 * Features:
 * - API key management
 * - Environment configuration display
 * - Cache statistics and management
 * - User preferences
 *
 * @returns Settings page component
 */
const SettingsPage = (): React.ReactElement => {
  const [apiKey, setApiKey] = useState<string>('');
  const [savedApiKey, setSavedApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Get API configuration from environment
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

  /**
   * Load saved API key from localStorage on mount
   */
  useEffect(() => {
    const storedApiKey = localStorage.getItem('api_key');
    if (storedApiKey) {
      setSavedApiKey(storedApiKey);
      setApiKey(storedApiKey);
    }
  }, []);

  /**
   * Save API key to localStorage
   */
  const handleSaveApiKey = useCallback((): void => {
    localStorage.setItem('api_key', apiKey);
    setSavedApiKey(apiKey);
    setSaveSuccess(true);

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  }, [apiKey]);

  /**
   * Clear API key from localStorage
   */
  const handleClearApiKey = useCallback((): void => {
    localStorage.removeItem('api_key');
    setApiKey('');
    setSavedApiKey('');
  }, []);

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
                    onChange={e => setApiKey(e.target.value)}
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
                is stored in your browser's localStorage.
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
                    API key saved successfully!
                  </span>
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
              apiKey={savedApiKey}
              refreshInterval={15000}
              onInvalidate={count => {
                console.log(`Invalidated ${count} cache entries`);
              }}
            />
          </div>

          {/* User Preferences Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              User Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Auto-refresh Jobs
                  </h3>
                  <p className="text-sm text-gray-500">
                    Automatically refresh job status every 10 seconds
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Show Notifications
                  </h3>
                  <p className="text-sm text-gray-500">
                    Display browser notifications for job completion
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Dark Mode
                  </h3>
                  <p className="text-sm text-gray-500">
                    Enable dark mode theme (Coming soon)
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-not-allowed opacity-50">
                  <input type="checkbox" className="sr-only peer" disabled />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
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
