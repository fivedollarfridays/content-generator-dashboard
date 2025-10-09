/**
 * JobsList Component
 * Displays list of sync jobs with filtering and pagination
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Check, RefreshCw, Clock, X, AlertTriangle, Ban, MapPin } from 'lucide-react';
import type {
  JobsListProps,
  SyncJob,
  JobStatus,
  JobsListResponse,
} from '@/types/content-generator';
import { ContentGeneratorAPI } from '@/lib/api/api-client';

export const JobsList: React.FC<JobsListProps> = ({
  apiUrl,
  apiKey,
  refreshInterval = 10000, // 10 seconds
  pageSize = 20,
  statusFilter,
  onJobClick,
  refreshTrigger,
  filters,
  selectedJobs = [],
  onToggleSelection,
}) => {
  const [jobs, setJobs] = useState<SyncJob[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<JobStatus | 'all'>(
    'all'
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const api = new ContentGeneratorAPI(apiUrl, apiKey);

  /**
   * Apply advanced filters to jobs
   */
  const applyFilters = useCallback(
    (jobsList: SyncJob[]): SyncJob[] => {
      if (!filters) return jobsList;

      return jobsList.filter(job => {
        // Search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const matchesJobId = job.job_id.toLowerCase().includes(searchLower);
          const matchesDocId = job.document_id
            .toLowerCase()
            .includes(searchLower);
          if (!matchesJobId && !matchesDocId) return false;
        }

        // Status filter (handled by selectedStatus, but also check filters.status)
        if (filters.status !== 'all' && job.status !== filters.status) {
          return false;
        }

        // Channel filter
        if (filters.channels.length > 0) {
          const hasMatchingChannel = filters.channels.some(channel =>
            job.channels.includes(channel)
          );
          if (!hasMatchingChannel) return false;
        }

        // Date range filter
        if (filters.dateRange.from || filters.dateRange.to) {
          const jobDate = new Date(job.created_at).getTime();

          if (filters.dateRange.from) {
            const fromDate = new Date(filters.dateRange.from).getTime();
            if (jobDate < fromDate) return false;
          }

          if (filters.dateRange.to) {
            const toDate = new Date(filters.dateRange.to).getTime();
            if (jobDate > toDate) return false;
          }
        }

        return true;
      });
    },
    [filters]
  );

  const fetchJobs = useCallback(async () => {
    try {
      const params: any = {
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
      };

      // Use filters.status if available, otherwise use selectedStatus
      const statusToUse = filters?.status || selectedStatus;
      if (statusToUse !== 'all') {
        params.status = statusToUse;
      }

      const response = await api.listJobs(params);

      if (response.success && response.data) {
        // Apply additional client-side filters
        const filteredJobs = applyFilters(response.data.jobs);
        setJobs(filteredJobs);
        setTotal(filteredJobs.length);
        setError(null);
      } else {
        setError(response.error?.message || 'Failed to fetch jobs');
      }

      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [api, currentPage, pageSize, selectedStatus, filters, applyFilters]);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchJobs, refreshInterval, refreshTrigger]);

  const getStatusColor = (status: JobStatus): string => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'partial':
        return 'text-orange-600 bg-orange-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: JobStatus): React.ReactElement => {
    const iconClass = "w-4 h-4";
    switch (status) {
      case 'completed':
        return <Check className={iconClass} />;
      case 'in_progress':
        return <RefreshCw className={iconClass} />;
      case 'pending':
        return <Clock className={iconClass} />;
      case 'failed':
        return <X className={iconClass} />;
      case 'partial':
        return <AlertTriangle className={iconClass} />;
      case 'cancelled':
        return <Ban className={iconClass} />;
      default:
        return <span className="w-4 h-4 flex items-center justify-center">•</span>;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const totalPages = Math.ceil(total / pageSize);

  const statuses: Array<{ value: JobStatus | 'all'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'partial', label: 'Partial' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  if (loading && jobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
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
          <span className="text-red-800 font-medium">Failed to load jobs</span>
        </div>
        <p className="text-red-700 text-sm mt-2">{error}</p>
        <button
          onClick={fetchJobs}
          className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sync Jobs</h2>
          <p className="text-sm text-gray-600 mt-1">
            {total} total jobs
            {lastUpdate && (
              <span className="ml-2">
                • Updated {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchJobs}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Status Filter - Hidden when advanced filters are used */}
      {!filters && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {statuses.map(status => (
              <button
                key={status.value}
                onClick={() => {
                  setSelectedStatus(status.value);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === status.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-lg font-medium">No jobs found</p>
          <p className="text-sm mt-1">
            {selectedStatus !== 'all'
              ? `No ${selectedStatus} jobs`
              : 'Start by generating some content'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => {
            const isSelected = selectedJobs.some(j => j.job_id === job.job_id);

            return (
              <div
                key={job.job_id}
                className={`job-card border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${
                  isSelected ? 'border-blue-500 bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  {/* Checkbox for batch selection */}
                  {onToggleSelection && (
                    <div className="flex items-center mr-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={e => {
                          e.stopPropagation();
                          onToggleSelection(job);
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => onJobClick?.(job)}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          job.status
                        )}`}
                      >
                        {getStatusIcon(job.status)} {job.status}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        {job.job_id}
                      </span>
                    </div>

                    <div className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Document:</span>{' '}
                      {job.document_id}
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{job.channels.join(', ')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(job.created_at)}</span>
                      </div>
                      {job.completed_at && (
                        <div className="flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>{formatDate(job.completed_at)}</span>
                        </div>
                      )}
                    </div>

                    {/* Channel Results Indicator */}
                    {job.results && (
                      <div className="flex space-x-1 ml-4">
                        {Object.entries(job.results).map(
                          ([channel, result]) => (
                            <div
                              key={channel}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                                result.status === 'success'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                              title={`${channel}: ${result.status}`}
                            >
                              {result.status === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {/* Errors */}
                  {job.errors && job.errors.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs text-red-600">
                        <span className="font-medium">Errors:</span>
                        <ul className="list-disc list-inside mt-1">
                          {job.errors.slice(0, 2).map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                          {job.errors.length > 2 && (
                            <li>+{job.errors.length - 2} more...</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsList;
