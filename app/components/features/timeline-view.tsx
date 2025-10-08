'use client';

import React from 'react';
import type { SyncJob, JobStatus } from '@/types/content-generator';

/**
 * Props for TimelineView component
 */
export interface TimelineViewProps {
  jobs: SyncJob[];
  loading?: boolean;
  onJobClick?: (job: SyncJob) => void;
}

/**
 * TimelineView Component
 *
 * Displays jobs in a timeline format showing chronological history
 * of content generation activities.
 * Memoized for performance when rendering large job lists.
 *
 * @example
 * ```tsx
 * <TimelineView
 *   jobs={jobsList}
 *   onJobClick={(job) => console.log(job)}
 * />
 * ```
 */
export const TimelineView: React.FC<TimelineViewProps> = React.memo(({
  jobs,
  loading = false,
  onJobClick,
}): JSX.Element => {
  /**
   * Get status color for timeline indicator
   */
  const getStatusColor = (status: JobStatus): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-gray-500';
      case 'partial':
        return 'bg-orange-500';
      default:
        return 'bg-gray-400';
    }
  };

  /**
   * Format date for timeline display
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Format duration between two dates
   */
  const formatDuration = (start: string, end?: string): string => {
    if (!end) return 'In progress';

    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMs = endDate.getTime() - startDate.getTime();
    const seconds = Math.floor(durationMs / 1000);

    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  /**
   * Group jobs by date
   */
  const groupedJobs = React.useMemo(() => {
    const groups: Record<string, SyncJob[]> = {};

    jobs.forEach(job => {
      const date = new Date(job.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(job);
    });

    // Sort jobs within each group by time (most recent first)
    Object.keys(groups).forEach(date => {
      groups[date].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return groups;
  }, [jobs]);

  if (loading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="ml-6 space-y-4">
              {[1, 2].map(j => (
                <div key={j} className="flex gap-4">
                  <div className="w-3 h-3 bg-gray-200 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No job history
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first content generation job.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedJobs).map(([date, dateJobs]) => (
        <div key={date}>
          {/* Date Header */}
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{date}</h3>

          {/* Timeline Items */}
          <div className="ml-6 space-y-6">
            {dateJobs.map((job, index) => (
              <div key={job.job_id} className="relative">
                {/* Timeline Line */}
                {index < dateJobs.length - 1 && (
                  <div
                    className="absolute left-1.5 top-6 w-0.5 h-full bg-gray-300"
                    style={{ height: 'calc(100% + 1.5rem)' }}
                  ></div>
                )}

                {/* Timeline Item */}
                <div className="flex gap-4">
                  {/* Status Indicator */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-3 h-3 rounded-full ${getStatusColor(job.status)} mt-2`}
                    ></div>
                  </div>

                  {/* Job Card */}
                  <div
                    className={`flex-1 bg-white rounded-lg shadow p-4 border border-gray-200 ${
                      onJobClick
                        ? 'cursor-pointer hover:shadow-md transition-shadow'
                        : ''
                    }`}
                    onClick={() => onJobClick?.(job)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Job {job.job_id.slice(0, 8)}...
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(job.created_at)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          job.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : job.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : job.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : job.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {job.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Document:</span>{' '}
                        {job.document_id}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Channels:</span>{' '}
                        {job.channels.join(', ')}
                      </p>
                      {job.started_at && (
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Duration:</span>{' '}
                          {formatDuration(job.started_at, job.completed_at)}
                        </p>
                      )}
                      {job.errors && job.errors.length > 0 && (
                        <p className="text-sm text-red-600">
                          <span className="font-medium">Error:</span>{' '}
                          {job.errors[0]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

TimelineView.displayName = 'TimelineView';

export default TimelineView;
