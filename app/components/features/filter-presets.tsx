'use client';

import React, { useState, useCallback } from 'react';
import { usePreferences } from '@/app/context/preferences-context';
import type { JobFilterState } from '@/types/content-generator';
import type { FilterPreset } from '@/types/preferences';

/**
 * Props for FilterPresets component
 */
export interface FilterPresetsProps {
  currentFilters: JobFilterState;
  onApplyPreset: (filters: JobFilterState) => void;
  className?: string;
}

/**
 * FilterPresets Component
 *
 * Manages filter presets for jobs page allowing users to save,
 * load, delete, and rename filter configurations.
 *
 * @example
 * ```tsx
 * <FilterPresets
 *   currentFilters={filters}
 *   onApplyPreset={(filters) => setFilters(filters)}
 * />
 * ```
 */
export const FilterPresets: React.FC<FilterPresetsProps> = ({
  currentFilters,
  onApplyPreset,
  className = '',
}): JSX.Element => {
  const { preferences, addFilterPreset, removeFilterPreset } = usePreferences();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  /**
   * Check if current filters match a preset
   */
  const getCurrentPresetMatch = useCallback((): string | null => {
    const presets = preferences.filterPresets;
    for (const preset of presets) {
      if (JSON.stringify(preset.filters) === JSON.stringify(currentFilters)) {
        return preset.id;
      }
    }
    return null;
  }, [preferences.filterPresets, currentFilters]);

  /**
   * Handle saving current filters as a new preset
   */
  const handleSavePreset = useCallback((): void => {
    if (!newPresetName.trim()) return;

    // Check for duplicate names
    const isDuplicate = preferences.filterPresets.some(
      p => p.name.toLowerCase() === newPresetName.trim().toLowerCase()
    );

    if (isDuplicate) {
      alert('A preset with this name already exists');
      return;
    }

    addFilterPreset({
      name: newPresetName.trim(),
      filters: currentFilters,
      createdAt: new Date().toISOString(),
    });

    setNewPresetName('');
    setShowSaveDialog(false);
  }, [
    newPresetName,
    currentFilters,
    addFilterPreset,
    preferences.filterPresets,
  ]);

  /**
   * Handle applying a preset
   */
  const handleApplyPreset = useCallback(
    (preset: FilterPreset): void => {
      onApplyPreset(preset.filters);
    },
    [onApplyPreset]
  );

  /**
   * Handle deleting a preset
   */
  const handleDeletePreset = useCallback(
    (presetId: string): void => {
      removeFilterPreset(presetId);
      setDeleteConfirmId(null);
    },
    [removeFilterPreset]
  );

  /**
   * Handle renaming a preset
   */
  const handleRenamePreset = useCallback(
    (presetId: string): void => {
      if (!editingName.trim()) return;

      // Check for duplicate names (excluding current)
      const isDuplicate = preferences.filterPresets.some(
        p =>
          p.id !== presetId &&
          p.name.toLowerCase() === editingName.trim().toLowerCase()
      );

      if (isDuplicate) {
        alert('A preset with this name already exists');
        return;
      }

      // Find and update the preset
      const preset = preferences.filterPresets.find(p => p.id === presetId);
      if (preset) {
        // Remove old preset and add with new name
        removeFilterPreset(presetId);
        addFilterPreset({
          name: editingName.trim(),
          filters: preset.filters,
          createdAt: preset.createdAt,
        });
      }

      setEditingPresetId(null);
      setEditingName('');
    },
    [
      editingName,
      preferences.filterPresets,
      removeFilterPreset,
      addFilterPreset,
    ]
  );

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const currentPresetId = getCurrentPresetMatch();
  const hasPresets = preferences.filterPresets.length > 0;

  return (
    <div
      className={`bg-white rounded-lg shadow border border-gray-200 ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          <h3 className="text-sm font-semibold text-gray-900">
            Filter Presets
          </h3>
          {hasPresets && (
            <span className="text-xs text-gray-500">
              ({preferences.filterPresets.length})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSaveDialog(true)}
            className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Save current filters as preset"
          >
            Save Current
          </button>
          {hasPresets && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={isExpanded ? 'Collapse presets' : 'Expand presets'}
            >
              <svg
                className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Presets List */}
      {isExpanded && hasPresets && (
        <div className="p-4 space-y-2">
          {preferences.filterPresets.map(preset => (
            <div
              key={preset.id}
              className={`p-3 rounded-lg border transition-colors ${
                currentPresetId === preset.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {editingPresetId === preset.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRenamePreset(preset.id);
                        if (e.key === 'Escape') {
                          setEditingPresetId(null);
                          setEditingName('');
                        }
                      }}
                      onBlur={() => handleRenamePreset(preset.id)}
                      className="w-full px-2 py-1 text-sm font-medium border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {preset.name}
                      {currentPresetId === preset.id && (
                        <span className="ml-2 text-xs text-blue-600">
                          (active)
                        </span>
                      )}
                    </h4>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Created {formatDate(preset.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-1 ml-2">
                  {currentPresetId !== preset.id && (
                    <button
                      onClick={() => handleApplyPreset(preset)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      title="Apply this preset"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingPresetId(preset.id);
                      setEditingName(preset.name);
                    }}
                    className="p-1 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                    title="Rename preset"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  {deleteConfirmId === preset.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDeletePreset(preset.id)}
                        className="px-2 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(preset.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                      title="Delete preset"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {isExpanded && !hasPresets && (
        <div className="p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No presets saved
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Save your current filter configuration to quickly access it later.
          </p>
          <button
            onClick={() => setShowSaveDialog(true)}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Save Current Filters
          </button>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Save Filter Preset
            </h3>
            <div className="mb-4">
              <label
                htmlFor="preset-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Preset Name
              </label>
              <input
                id="preset-name"
                type="text"
                value={newPresetName}
                onChange={e => setNewPresetName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSavePreset();
                  if (e.key === 'Escape') {
                    setShowSaveDialog(false);
                    setNewPresetName('');
                  }
                }}
                placeholder="e.g., Failed Jobs Last Week"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setNewPresetName('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreset}
                disabled={!newPresetName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
              >
                Save Preset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPresets;
