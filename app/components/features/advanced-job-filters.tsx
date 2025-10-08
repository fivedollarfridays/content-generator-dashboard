/**
 * AdvancedJobFilters Component
 * Advanced filtering interface for job management
 */

'use client';

import React, { useState, useCallback } from 'react';
import type { JobStatus, Channel } from '@/types/content-generator';

export interface JobFilterState {
  search: string;
  status: JobStatus | 'all';
  channels: Channel[];
  dateRange: {
    from: string;
    to: string;
  };
}

export interface AdvancedJobFiltersProps {
  filters: JobFilterState;
  onFiltersChange: (filters: JobFilterState) => void;
  onReset: () => void;
}

/**
 * Advanced Job Filters Component
 *
 * Provides comprehensive filtering options for job management including:
 * - Text search (job ID, document ID)
 * - Status filtering
 * - Channel filtering
 * - Date range filtering
 *
 * @param props - Component props
 * @returns Advanced filters component
 *
 * @example
 * ```tsx
 * const [filters, setFilters] = useState<JobFilterState>({
 *   search: '',
 *   status: 'all',
 *   channels: [],
 *   dateRange: { from: '', to: '' }
 * });
 *
 * <AdvancedJobFilters
 *   filters={filters}
 *   onFiltersChange={setFilters}
 *   onReset={() => setFilters(initialFilters)}
 * />
 * ```
 */
export const AdvancedJobFilters: React.FC<AdvancedJobFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const availableChannels: { value: Channel; label: string; icon: string }[] = [
    { value: 'email', label: 'Email', icon: '📧' },
    { value: 'website', label: 'Website', icon: '🌐' },
    { value: 'social_twitter', label: 'Twitter', icon: '🐦' },
    { value: 'social_linkedin', label: 'LinkedIn', icon: '💼' },
    { value: 'social_facebook', label: 'Facebook', icon: '👥' },
  ];

  const statuses: Array<{ value: JobStatus | 'all'; label: string }> = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'partial', label: 'Partial' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const handleSearchChange = useCallback(
    (search: string): void => {
      onFiltersChange({ ...filters, search });
    },
    [filters, onFiltersChange]
  );

  const handleStatusChange = useCallback(
    (status: JobStatus | 'all'): void => {
      onFiltersChange({ ...filters, status });
    },
    [filters, onFiltersChange]
  );

  const handleChannelToggle = useCallback(
    (channel: Channel): void => {
      const channels = filters.channels.includes(channel)
        ? filters.channels.filter(c => c !== channel)
        : [...filters.channels, channel];
      onFiltersChange({ ...filters, channels });
    },
    [filters, onFiltersChange]
  );

  const handleDateRangeChange = useCallback(
    (field: 'from' | 'to', value: string): void => {
      onFiltersChange({
        ...filters,
        dateRange: { ...filters.dateRange, [field]: value },
      });
    },
    [filters, onFiltersChange]
  );

  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.channels.length > 0 ||
    filters.dateRange.from !== '' ||
    filters.dateRange.to !== '';

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
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
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Reset
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
          >
            <span>{isExpanded ? 'Less' : 'More'}</span>
            <svg
              className={`w-4 h-4 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
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
        </div>
      </div>

      {/* Search Input - Always Visible */}
      <div className="mb-4">
        <input
          type="text"
          value={filters.search}
          onChange={e => handleSearchChange(e.target.value)}
          placeholder="Search by job ID or document ID..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Status Filter - Always Visible */}
      <div className="flex flex-wrap gap-2 mb-4">
        {statuses.map(status => (
          <button
            key={status.value}
            onClick={() => handleStatusChange(status.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filters.status === status.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Channel Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Channels
            </label>
            <div className="flex flex-wrap gap-2">
              {availableChannels.map(channel => (
                <button
                  key={channel.value}
                  onClick={() => handleChannelToggle(channel.value)}
                  className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors flex items-center space-x-2 ${
                    filters.channels.includes(channel.value)
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <span>{channel.icon}</span>
                  <span>{channel.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">From</label>
                <input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={e => handleDateRangeChange('from', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">To</label>
                <input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={e => handleDateRangeChange('to', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Active Filters:
              </p>
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    Search: &ldquo;{filters.search}&rdquo;
                  </span>
                )}
                {filters.status !== 'all' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded capitalize">
                    Status: {filters.status}
                  </span>
                )}
                {filters.channels.map(channel => (
                  <span
                    key={channel}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                  >
                    {availableChannels.find(c => c.value === channel)?.label}
                  </span>
                ))}
                {filters.dateRange.from && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    From: {filters.dateRange.from}
                  </span>
                )}
                {filters.dateRange.to && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    To: {filters.dateRange.to}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedJobFilters;
