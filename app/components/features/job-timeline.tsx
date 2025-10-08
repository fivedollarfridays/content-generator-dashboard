/**
 * JobTimeline Component
 * Display jobs in a chronological timeline with pagination
 */

'use client';

import React, { useMemo } from 'react';
import type { SyncJob, JobStatus } from '@/types/content-generator';
import { formatTimeAgo } from '@/lib/utils/job-analytics';
import {
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  format,
} from 'date-fns';

export interface JobTimelineProps {
  jobs: SyncJob[];
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onJobClick?: (job: SyncJob) => void;
}

interface JobGroup {
  label: string;
  jobs: SyncJob[];
}

const getStatusIcon = (status: JobStatus): string => {
  switch (status) {
    case 'completed':
      return '✓';
    case 'in_progress':
      return '⟳';
    case 'pending':
      return '⏱';
    case 'failed':
      return '✕';
    case 'partial':
      return '⚠';
    case 'cancelled':
      return '⊘';
    default:
      return '•';
  }
};

const getStatusColor = (status: JobStatus): string => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-100 border-green-200';
    case 'in_progress':
      return 'text-blue-600 bg-blue-100 border-blue-200';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    case 'failed':
      return 'text-red-600 bg-red-100 border-red-200';
    case 'partial':
      return 'text-orange-600 bg-orange-100 border-orange-200';
    case 'cancelled':
      return 'text-gray-600 bg-gray-100 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
};

const getDateGroupLabel = (date: Date): string => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return 'This Week';
  if (isThisMonth(date)) return 'This Month';
  return format(date, 'MMMM yyyy');
};

/**
 * Job Timeline Component
 *
 * Displays jobs in a chronological timeline view with:
 * - Date grouping (Today, Yesterday, This Week, etc.)
 * - Pagination support
 * - Job status indicators
 * - Click handlers for job details
 *
 * @param props - Component props
 * @returns Timeline view of jobs
 *
 * @example
 * ```tsx
 * <JobTimeline
 *   jobs={jobs}
 *   currentPage={1}
 *   pageSize={20}
 *   onPageChange={setCurrentPage}
 *   onJobClick={handleJobClick}
 * />
 * ```
 */
export const JobTimeline: React.FC<JobTimelineProps> = ({
  jobs,
  currentPage,
  pageSize,
  onPageChange,
  onJobClick,
}) => {
  // Paginate jobs
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return jobs.slice(startIndex, endIndex);
  }, [jobs, currentPage, pageSize]);

  // Group jobs by date
  const groupedJobs = useMemo(() => {
    const groups: Record<string, SyncJob[]> = {};

    paginatedJobs.forEach(job => {
      const date = new Date(job.created_at);
      const label = getDateGroupLabel(date);

      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(job);
    });

    return Object.entries(groups).map(([label, jobs]) => ({
      label,
      jobs: jobs.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    }));
  }, [paginatedJobs]);

  const totalPages = Math.ceil(jobs.length / pageSize);

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-lg font-medium text-gray-900">No job history</p>
        <p className="text-sm text-gray-500 mt-1">
          Jobs will appear here once you start generating content
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeline */}
      {groupedJobs.map(group => (
        <div key={group.label}>
          {/* Date Group Header */}
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {group.label}
              </span>
            </div>
            <div className="ml-4 flex-1 border-t border-gray-300"></div>
          </div>

          {/* Jobs in Group */}
          <div className="ml-6 space-y-4">
            {group.jobs.map((job, index) => (
              <div key={job.job_id} className="relative">
                {/* Timeline Line */}
                {index < group.jobs.length - 1 && (
                  <div className="absolute left-4 top-10 w-0.5 h-full bg-gray-300"></div>
                )}

                {/* Job Card */}
                <div
                  className={`flex items-start space-x-4 ${
                    onJobClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onJobClick?.(job)}
                >
                  {/* Status Indicator */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold ${getStatusColor(
                      job.status
                    )}`}
                  >
                    {getStatusIcon(job.status)}
                  </div>

                  {/* Job Details */}
                  <div className="flex-1 bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {job.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(job.created_at)}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 mb-2">
                          <span className="font-medium">Document:</span>{' '}
                          {job.document_id}
                        </p>

                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                          <div className="flex items-center space-x-1">
                            <span>📍</span>
                            <span>{job.channels.join(', ')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>🆔</span>
                            <span className="font-mono">
                              {job.job_id.substring(0, 8)}...
                            </span>
                          </div>
                        </div>

                        {/* Errors */}
                        {job.errors && job.errors.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-xs text-red-600 font-medium">
                              Error: {job.errors[0]}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Channel Results */}
                      {job.results && (
                        <div className="flex space-x-1 ml-4">
                          {Object.entries(job.results).map(
                            ([channel, result]) => (
                              <div
                                key={channel}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                  result.status === 'success'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                                title={`${channel}: ${result.status}`}
                              >
                                {result.status === 'success' ? '✓' : '✕'}
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, jobs.length)} of {jobs.length}{' '}
            jobs
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Previous
            </button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
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

export default JobTimeline;
