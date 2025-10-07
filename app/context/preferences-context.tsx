/**
 * Preferences Context
 * Global state management for user preferences
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import type {
  UserPreferences,
  NotificationPreferences,
  FilterPreset,
  DisplayPreferences,
} from '@/types/preferences';
import { DEFAULT_PREFERENCES } from '@/types/preferences';

interface PreferencesContextType {
  preferences: UserPreferences;
  updateNotificationPreferences: (
    prefs: Partial<NotificationPreferences>
  ) => void;
  addFilterPreset: (preset: Omit<FilterPreset, 'id'>) => void;
  removeFilterPreset: (id: string) => void;
  updateDisplayPreferences: (prefs: Partial<DisplayPreferences>) => void;
  resetPreferences: () => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined
);

const STORAGE_KEY = 'user_preferences';

export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
        }
      } catch (err) {
        console.error('Failed to load preferences:', err);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (err) {
      console.error('Failed to save preferences:', err);
    }
  }, [preferences]);

  const updateNotificationPreferences = useCallback(
    (prefs: Partial<NotificationPreferences>) => {
      setPreferences(prev => ({
        ...prev,
        notifications: { ...prev.notifications, ...prefs },
      }));
    },
    []
  );

  const addFilterPreset = useCallback((preset: Omit<FilterPreset, 'id'>) => {
    const newPreset: FilterPreset = {
      ...preset,
      id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    setPreferences(prev => ({
      ...prev,
      filterPresets: [...prev.filterPresets, newPreset],
    }));
  }, []);

  const removeFilterPreset = useCallback((id: string) => {
    setPreferences(prev => ({
      ...prev,
      filterPresets: prev.filterPresets.filter(p => p.id !== id),
    }));
  }, []);

  const updateDisplayPreferences = useCallback(
    (prefs: Partial<DisplayPreferences>) => {
      setPreferences(prev => ({
        ...prev,
        display: { ...prev.display, ...prefs },
      }));
    },
    []
  );

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value: PreferencesContextType = {
    preferences,
    updateNotificationPreferences,
    addFilterPreset,
    removeFilterPreset,
    updateDisplayPreferences,
    resetPreferences,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};

export default PreferencesContext;
