/**
 * BatchJobOperations Component
 * Batch operations interface for managing multiple jobs
 */

'use client';

import React, { useCallback, useState } from 'react';
import type { SyncJob } from '@/types/content-generator';

export type ExportFormat = 'csv' | 'json';

export interface BatchJobOperationsProps {
  selectedJobs: SyncJob[];
  onClearSelection: () => void;
  onBatchRetry: (jobIds: string[]) => Promise<void>;
  onBatchCancel: (jobIds: string[]) => Promise<void>;
  onBatchExport: (jobs: SyncJob[], format: ExportFormat) => void;
}

/**
 * Batch Job Operations Component
 *
 * Provides bulk actions for selected jobs including:
 * - Batch retry for failed jobs
 * - Batch cancel for pending/in-progress jobs
 * - Batch export to CSV/JSON
 *
 * @param props - Component props
 * @returns Batch operations toolbar
 *
 * @example
 * ```tsx
 * <BatchJobOperations
 *   selectedJobs={selectedJobs}
 *   onClearSelection={() => setSelectedJobs([])}
 *   onBatchRetry={handleBatchRetry}
 *   onBatchCancel={handleBatchCancel}
 *   onBatchExport={handleBatchExport}
 * />
 * ```
 */
export const BatchJobOperations: React.FC<BatchJobOperationsProps> = ({
  selectedJobs,
  onClearSelection,
  onBatchRetry,
  onBatchCancel,
  onBatchExport,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const retryableJobs = selectedJobs.filter(job => job.status === 'failed');
  const cancellableJobs = selectedJobs.filter(
    job => job.status === 'pending' || job.status === 'in_progress'
  );

  const handleBatchRetry = useCallback(async (): Promise<void> => {
    if (retryableJobs.length === 0) return;
    const jobIds = retryableJobs.map(job => job.job_id);
    await onBatchRetry(jobIds);
  }, [retryableJobs, onBatchRetry]);

  const handleBatchCancel = useCallback(async (): Promise<void> => {
    if (cancellableJobs.length === 0) return;
    const jobIds = cancellableJobs.map(job => job.job_id);
    await onBatchCancel(jobIds);
  }, [cancellableJobs, onBatchCancel]);

  const handleBatchExport = useCallback(
    (format: ExportFormat): void => {
      if (selectedJobs.length === 0) return;
      onBatchExport(selectedJobs, format);
      setShowExportMenu(false);
    },
    [selectedJobs, onBatchExport]
  );

  if (selectedJobs.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-500 shadow-2xl z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Selection Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-gray-900">
                {selectedJobs.length}{' '}
                {selectedJobs.length === 1 ? 'job' : 'jobs'} selected
              </span>
            </div>

            {retryableJobs.length > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                {retryableJobs.length} failed
              </span>
            )}

            {cancellableJobs.length > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                {cancellableJobs.length} active
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Batch Retry */}
            {retryableJobs.length > 0 && (
              <button
                onClick={handleBatchRetry}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center space-x-2"
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Retry ({retryableJobs.length})</span>
              </button>
            )}

            {/* Batch Cancel */}
            {cancellableJobs.length > 0 && (
              <button
                onClick={handleBatchCancel}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center space-x-2"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>Cancel ({cancellableJobs.length})</span>
              </button>
            )}

            {/* Batch Export */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                <span>Export</span>
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Export Format Dropdown */}
              {showExportMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                  <button
                    onClick={() => handleBatchExport('csv')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center space-x-2"
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>Export as CSV</span>
                  </button>
                  <button
                    onClick={() => handleBatchExport('json')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center space-x-2"
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
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
                    <span>Export as JSON</span>
                  </button>
                </div>
              )}
            </div>

            {/* Clear Selection */}
            <button
              onClick={onClearSelection}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchJobOperations;
