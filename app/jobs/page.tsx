'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import JobsList from '@/app/components/features/jobs-list';
import JobStatusCard from '@/app/components/features/job-status-card';
import AdvancedJobFilters, {
  type JobFilterState,
} from '@/app/components/features/advanced-job-filters';
import BatchJobOperations from '@/app/components/features/batch-job-operations';
import FilterPresets from '@/app/components/features/filter-presets';
import type { SyncJob } from '@/types/content-generator';
import { useAuth, useToast } from '@/app/contexts';
import { useWebSocket, WebSocketState } from '@/app/hooks';

/**
 * Jobs Content Component
 * Internal component that uses useSearchParams
 */
const JobsContent = (): React.ReactElement => {
  const searchParams = useSearchParams();
  const { apiKey } = useAuth();
  const toast = useToast();
  const [selectedJob, setSelectedJob] = useState<SyncJob | null>(null);
  const [highlightJobId, setHighlightJobId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [actionInProgress, setActionInProgress] = useState<{
    jobId: string;
    action: 'retry' | 'cancel';
  } | null>(null);

  // Advanced filters state
  const [filters, setFilters] = useState<JobFilterState>({
    search: '',
    status: 'all',
    channels: [],
    dateRange: { from: '', to: '' },
  });

  // Batch operations state
  const [selectedJobs, setSelectedJobs] = useState<SyncJob[]>([]);

  const handleResetFilters = useCallback((): void => {
    setFilters({
      search: '',
      status: 'all',
      channels: [],
      dateRange: { from: '', to: '' },
    });
  }, []);

  const handleToggleJobSelection = useCallback((job: SyncJob): void => {
    setSelectedJobs(prev => {
      const isSelected = prev.some(j => j.job_id === job.job_id);
      if (isSelected) {
        return prev.filter(j => j.job_id !== job.job_id);
      } else {
        return [...prev, job];
      }
    });
  }, []);

  const handleClearSelection = useCallback((): void => {
    setSelectedJobs([]);
  }, []);

  // Get API configuration from environment
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

  /**
   * Batch retry jobs
   */
  const handleBatchRetry = useCallback(
    async (jobIds: string[]): Promise<void> => {
      if (!apiKey) {
        toast.error('No API key available for batch retry');
        return;
      }

      toast.info(`Retrying ${jobIds.length} jobs...`);

      try {
        const { ContentGeneratorAPI } = await import('@/lib/api/api-client');
        const api = new ContentGeneratorAPI(API_URL, apiKey);

        const results = await Promise.allSettled(
          jobIds.map(jobId => api.retryJob(jobId))
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        if (successful > 0) {
          toast.success(`Successfully retried ${successful} jobs`);
          setRefreshTrigger(prev => prev + 1);
        }

        if (failed > 0) {
          toast.warning(`Failed to retry ${failed} jobs`);
        }

        setSelectedJobs([]);
      } catch (err) {
        toast.error(
          `Batch retry error: ${err instanceof Error ? err.message : 'Unknown error'}`
        );
      }
    },
    [apiKey, API_URL, toast]
  );

  /**
   * Batch cancel jobs
   */
  const handleBatchCancel = useCallback(
    async (jobIds: string[]): Promise<void> => {
      if (!apiKey) {
        toast.error('No API key available for batch cancel');
        return;
      }

      toast.info(`Cancelling ${jobIds.length} jobs...`);

      try {
        const { ContentGeneratorAPI } = await import('@/lib/api/api-client');
        const api = new ContentGeneratorAPI(API_URL, apiKey);

        const results = await Promise.allSettled(
          jobIds.map(jobId => api.cancelJob(jobId))
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        if (successful > 0) {
          toast.success(`Successfully cancelled ${successful} jobs`);
          setRefreshTrigger(prev => prev + 1);
        }

        if (failed > 0) {
          toast.warning(`Failed to cancel ${failed} jobs`);
        }

        setSelectedJobs([]);
      } catch (err) {
        toast.error(
          `Batch cancel error: ${err instanceof Error ? err.message : 'Unknown error'}`
        );
      }
    },
    [apiKey, API_URL, toast]
  );

  /**
   * Export jobs to CSV or JSON
   */
  const handleBatchExport = useCallback(
    (jobs: SyncJob[], format: 'csv' | 'json'): void => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      let blob: Blob;
      let filename: string;

      if (format === 'csv') {
        // CSV export
        const csvHeaders = [
          'Job ID',
          'Document ID',
          'Status',
          'Channels',
          'Created At',
          'Completed At',
        ];
        const csvRows = jobs.map(job => [
          job.job_id,
          job.document_id,
          job.status,
          job.channels.join('; '),
          job.created_at,
          job.completed_at || 'N/A',
        ]);

        const csvContent = [
          csvHeaders.join(','),
          ...csvRows.map(row => row.map(cell => `"${cell}"`).join(',')),
        ].join('\n');

        blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        filename = `jobs_export_${timestamp}.csv`;
      } else {
        // JSON export
        const jsonContent = JSON.stringify(jobs, null, 2);
        blob = new Blob([jsonContent], {
          type: 'application/json;charset=utf-8;',
        });
        filename = `jobs_export_${timestamp}.json`;
      }

      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${jobs.length} jobs to ${format.toUpperCase()}`);
      setSelectedJobs([]);
    },
    [toast]
  );

  /**
   * WebSocket connection for real-time job updates
   */
  const { state: wsState, lastMessage } = useWebSocket(`${WS_URL}/ws/jobs`, {
    autoConnect: true,
    autoReconnect: true,
    reconnectDelay: 3000,
    maxReconnectAttempts: 5,
    onMessage: event => {
      try {
        const data = JSON.parse(event.data);

        // Trigger refresh when job updates are received
        if (data.type === 'job_update' || data.type === 'job_status_change') {
          setRefreshTrigger(prev => prev + 1);
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    },
    onOpen: () => {
      // WebSocket connected - real-time job updates enabled
    },
    onClose: () => {
      // WebSocket disconnected - falling back to polling
    },
    onError: event => {
      console.error('WebSocket error:', event);
    },
  });

  // Check for highlight parameter on mount
  useEffect(() => {
    const highlightId = searchParams.get('highlight');
    if (highlightId) {
      setHighlightJobId(highlightId);
      // Clear highlight after 5 seconds
      setTimeout(() => {
        setHighlightJobId(null);
      }, 5000);
    }
  }, [searchParams]);

  /**
   * Handle job click - opens detailed view
   */
  const handleJobClick = useCallback((job: SyncJob): void => {
    setSelectedJob(job);
  }, []);

  /**
   * Close job details modal
   */
  const closeJobDetails = useCallback((): void => {
    setSelectedJob(null);
  }, []);

  /**
   * Handle job retry action with optimistic UI
   */
  const handleRetry = useCallback(
    async (jobId: string): Promise<void> => {
      if (!apiKey) {
        toast.error('No API key available for retry');
        return;
      }

      // Show optimistic state
      setActionInProgress({ jobId, action: 'retry' });
      toast.info('Retrying job...');

      try {
        const { ContentGeneratorAPI } = await import('@/lib/api/api-client');
        const api = new ContentGeneratorAPI(API_URL, apiKey);

        const response = await api.retryJob(jobId);

        if (response.success && response.data) {
          // Trigger refresh to show the new job
          setRefreshTrigger(prev => prev + 1);
          toast.success(
            `Job retried successfully! New job: ${response.data.job_id.substring(0, 8)}...`
          );

          // Close modal if the selected job was retried
          if (selectedJob?.job_id === jobId) {
            setSelectedJob(null);
          }
        } else {
          toast.error(
            `Retry failed: ${response.error?.message || 'Unknown error'}`
          );
        }
      } catch (err) {
        toast.error(
          `Retry error: ${err instanceof Error ? err.message : 'Unknown error'}`
        );
      } finally {
        setActionInProgress(null);
      }
    },
    [apiKey, API_URL, selectedJob, toast]
  );

  /**
   * Handle job cancel action with optimistic UI
   */
  const handleCancel = useCallback(
    async (jobId: string): Promise<void> => {
      if (!apiKey) {
        toast.error('No API key available for cancel');
        return;
      }

      // Show optimistic state
      setActionInProgress({ jobId, action: 'cancel' });
      toast.info('Cancelling job...');

      try {
        const { ContentGeneratorAPI } = await import('@/lib/api/api-client');
        const api = new ContentGeneratorAPI(API_URL, apiKey);

        const response = await api.cancelJob(jobId);

        if (response.success && response.data?.cancelled) {
          // Trigger refresh to show updated status
          setRefreshTrigger(prev => prev + 1);
          toast.success('Job cancelled successfully!');

          // Close modal if the selected job was cancelled
          if (selectedJob?.job_id === jobId) {
            setSelectedJob(null);
          }
        } else {
          toast.error(
            `Cancel failed: ${response.error?.message || 'Unknown error'}`
          );
        }
      } catch (err) {
        toast.error(
          `Cancel error: ${err instanceof Error ? err.message : 'Unknown error'}`
        );
      } finally {
        setActionInProgress(null);
      }
    },
    [apiKey, API_URL, selectedJob, toast]
  );

  return (
    <div className="min-h-screen py-8">
      <div className="tb-container">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="h1">Content Jobs</h1>
          <p className="mt-2 text-sm subtle">
            Monitor and manage your content generation jobs
          </p>
        </div>

        {/* Action In Progress Notice */}
        {actionInProgress && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-yellow-600 mr-3 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-sm text-yellow-800">
                {actionInProgress.action === 'retry'
                  ? 'Retrying job...'
                  : 'Cancelling job...'}{' '}
                <span className="font-mono">
                  {actionInProgress.jobId.substring(0, 12)}...
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Highlight Notice */}
        {highlightJobId && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-blue-600 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-blue-800">
                Looking for job:{' '}
                <span className="font-mono">{highlightJobId}</span>
              </p>
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        {/* Filter Presets */}
        <div className="mb-6">
          <FilterPresets currentFilters={filters} onApplyPreset={setFilters} />
        </div>

        {/* Advanced Filters */}
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={setFilters}
          onReset={handleResetFilters}
        />

        {/* Jobs List */}
        <div className="mb-6">
          <JobsList
            apiUrl={API_URL}
            apiKey={apiKey || undefined}
            refreshInterval={10000}
            pageSize={20}
            onJobClick={handleJobClick}
            refreshTrigger={refreshTrigger}
            filters={filters}
            selectedJobs={selectedJobs}
            onToggleSelection={handleToggleJobSelection}
          />
        </div>

        {/* Info Cards */}
        <div className="tb-grid cols-3">
          <div className="tb-card pad">
            <h3 className="title text-sm mb-2">
              Real-time Updates
            </h3>
            <p className="text-sm subtle">
              Jobs refresh automatically every 10 seconds to show the latest
              status
            </p>
          </div>

          <div className="tb-card pad">
            <h3 className="title text-sm mb-2 flex items-center">
              WebSocket Status
              <span
                className={`ml-2 inline-block w-2 h-2 rounded-full ${
                  wsState === WebSocketState.CONNECTED
                    ? 'bg-green-500'
                    : wsState === WebSocketState.CONNECTING
                      ? 'bg-yellow-500'
                      : wsState === WebSocketState.ERROR
                        ? 'bg-red-500'
                        : 'bg-gray-400'
                }`}
              ></span>
            </h3>
            <p className="text-sm subtle">
              {wsState === WebSocketState.CONNECTED
                ? 'Real-time updates active - job changes appear instantly'
                : wsState === WebSocketState.CONNECTING
                  ? 'Connecting to real-time updates...'
                  : wsState === WebSocketState.ERROR
                    ? 'Connection error - using polling fallback'
                    : 'Disconnected - using polling fallback'}
            </p>
          </div>

          <div className="tb-card pad">
            <h3 className="title text-sm mb-2">
              Job Actions
            </h3>
            <p className="text-sm subtle">
              Click on any job to view details, retry failed jobs, or cancel
              pending ones
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex justify-center">
          <a href="/generate" className="tb-btn primary">
            + Generate New Content
          </a>
        </div>
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeJobDetails}
        >
          <div
            className="tb-card max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="h2">Job Details</h2>
              <button
                onClick={closeJobDetails}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <JobStatusCard
                job={selectedJob}
                onRetry={handleRetry}
                onCancel={handleCancel}
                onViewDetails={() => {
                  // View details handler
                }}
                compact={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Batch Operations Toolbar */}
      <BatchJobOperations
        selectedJobs={selectedJobs}
        onClearSelection={handleClearSelection}
        onBatchRetry={handleBatchRetry}
        onBatchCancel={handleBatchCancel}
        onBatchExport={handleBatchExport}
      />
    </div>
  );
};

/**
 * Jobs Management Page
 * Displays and manages content generation jobs
 *
 * Features:
 * - Real-time job status updates
 * - Job filtering by status
 * - Pagination support
 * - Job detail view modal
 * - Highlight specific job from URL params
 *
 * URL Parameters:
 * - highlight: Job ID to highlight and show details for
 *
 * @returns Jobs management page component
 */
const JobsPage = (): React.ReactElement => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--accent)' }}></div>
            <p className="mt-4 subtle">Loading jobs...</p>
          </div>
        </div>
      }
    >
      <JobsContent />
    </Suspense>
  );
};

export default JobsPage;
