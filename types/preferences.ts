/**
 * User Preferences Types
 * Type definitions for user settings and preferences
 */

import type { JobStatus, Channel, JobFilterState } from './content-generator';

export interface NotificationPreferences {
  enabled: boolean;
  onSuccess: boolean;
  onFailure: boolean;
  onPartial: boolean;
  realTimeUpdates: boolean;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: JobFilterState;
  createdAt: string;
}

export interface DisplayPreferences {
  tableDensity: 'compact' | 'comfortable' | 'spacious';
  refreshInterval: number; // in milliseconds
  pageSize: number;
  showTimestamps: boolean;
  showChannelIcons: boolean;
}

export interface UserPreferences {
  notifications: NotificationPreferences;
  filterPresets: FilterPreset[];
  display: DisplayPreferences;
  theme?: 'light' | 'dark' | 'system';
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  notifications: {
    enabled: true,
    onSuccess: true,
    onFailure: true,
    onPartial: true,
    realTimeUpdates: false,
  },
  filterPresets: [],
  display: {
    tableDensity: 'comfortable',
    refreshInterval: 30000, // 30 seconds
    pageSize: 20,
    showTimestamps: true,
    showChannelIcons: true,
  },
  theme: 'light',
};
