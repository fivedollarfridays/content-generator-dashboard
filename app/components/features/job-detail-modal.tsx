/**
 * JobDetailModal Component
 * Modal dialog displaying comprehensive job details
 */

'use client';

import React from 'react';
import type { SyncJob, JobStatus } from '@/types/content-generator';
import { formatTimeAgo } from '@/lib/utils/job-analytics';

export interface JobDetailModalProps {
  job: SyncJob | null;
  isOpen: boolean;
  onClose: () => void;
  onRetry?: (jobId: string) => void;
  onCancel?: (jobId: string) => void;
}

const getStatusColor = (status: JobStatus): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'partial':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Job Detail Modal Component
 *
 * Displays comprehensive job information in a modal dialog:
 * - Job status and metadata
 * - Document information
 * - Channel results
 * - Timestamps
 * - Errors
 * - Actions (retry, cancel)
 *
 * @param props - Component props
 * @returns Modal dialog with job details
 *
 * @example
 * ```tsx
 * <JobDetailModal
 *   job={selectedJob}
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   onRetry={handleRetry}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  isOpen,
  onClose,
  onRetry,
  onCancel,
}) => {
  if (!isOpen || !job) return null;

  const canRetry = job.status === 'failed';
  const canCancel = job.status === 'pending' || job.status === 'in_progress';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Job Details</h2>
              <p className="text-sm text-gray-600 mt-1 font-mono">
                {job.job_id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
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
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Status */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Status
              </h3>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                  job.status
                )}`}
              >
                {job.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {/* Document */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Document
              </h3>
              <p className="text-sm text-gray-900 font-mono bg-gray-50 p-3 rounded">
                {job.document_id}
              </p>
            </div>

            {/* Channels */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Channels
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.channels.map(channel => (
                  <span
                    key={channel}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {channel}
                  </span>
                ))}
              </div>
            </div>

            {/* Channel Results */}
            {job.results && Object.keys(job.results).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Channel Results
                </h3>
                <div className="space-y-3">
                  {Object.entries(job.results).map(([channel, result]) => (
                    <div
                      key={channel}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {channel}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            result.status === 'success'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {result.status}
                        </span>
                      </div>

                      {result.sent !== undefined && (
                        <p className="text-sm text-gray-600">
                          Sent: {result.sent}
                        </p>
                      )}

                      {result.content_id && (
                        <p className="text-sm text-gray-600">
                          Content ID: {result.content_id}
                        </p>
                      )}

                      {result.url && (
                        <p className="text-sm text-gray-600">
                          URL:{' '}
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {result.url}
                          </a>
                        </p>
                      )}

                      {result.error && (
                        <p className="text-sm text-red-600 mt-1">
                          Error: {result.error}
                        </p>
                      )}

                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(result.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Timeline
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="text-gray-900">
                    {new Date(job.created_at).toLocaleString()}
                  </span>
                </div>

                {job.started_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Started:</span>
                    <span className="text-gray-900">
                      {new Date(job.started_at).toLocaleString()}
                    </span>
                  </div>
                )}

                {job.completed_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Completed:</span>
                    <span className="text-gray-900">
                      {new Date(job.completed_at).toLocaleString()}
                    </span>
                  </div>
                )}

                {job.scheduled_for && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Scheduled For:</span>
                    <span className="text-gray-900">
                      {new Date(job.scheduled_for).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Errors */}
            {job.errors && job.errors.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Errors
                </h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <ul className="list-disc list-inside space-y-1">
                    {job.errors.map((error, idx) => (
                      <li key={idx} className="text-sm text-red-700">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Metadata */}
            {job.metadata && Object.keys(job.metadata).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Metadata
                </h3>
                <pre className="text-xs text-gray-900 bg-gray-50 p-3 rounded overflow-x-auto">
                  {JSON.stringify(job.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            {canRetry && onRetry && (
              <button
                onClick={() => {
                  onRetry(job.job_id);
                  onClose();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Retry Job
              </button>
            )}

            {canCancel && onCancel && (
              <button
                onClick={() => {
                  onCancel(job.job_id);
                  onClose();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Cancel Job
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;
