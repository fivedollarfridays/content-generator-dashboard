'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import JobsList from '@/app/components/features/jobs-list';
import JobStatusCard from '@/app/components/features/job-status-card';
import type { SyncJob } from '@/types/content-generator';

/**
 * Jobs Content Component
 * Internal component that uses useSearchParams
 */
const JobsContent = (): React.ReactElement => {
  const searchParams = useSearchParams();
  const [selectedJob, setSelectedJob] = useState<SyncJob | null>(null);
  const [highlightJobId, setHighlightJobId] = useState<string | null>(null);

  // Get API configuration from environment
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
   * Handle job retry action
   * TODO: Implement retry API call
   */
  const handleRetry = useCallback((jobId: string): void => {
    console.log('Retry job:', jobId);
    // TODO: Implement retry logic with API
  }, []);

  /**
   * Handle job cancel action
   * TODO: Implement cancel API call
   */
  const handleCancel = useCallback((jobId: string): void => {
    console.log('Cancel job:', jobId);
    // TODO: Implement cancel logic with API
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Content Jobs</h1>
          <p className="mt-2 text-sm text-gray-600">
            Monitor and manage your content generation jobs
          </p>
        </div>

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

        {/* Jobs List */}
        <div className="mb-6">
          <JobsList
            apiUrl={API_URL}
            refreshInterval={10000}
            pageSize={20}
            onJobClick={handleJobClick}
          />
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Real-time Updates
            </h3>
            <p className="text-sm text-gray-500">
              Jobs refresh automatically every 10 seconds to show the latest
              status
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              WebSocket Support
            </h3>
            <p className="text-sm text-gray-500">
              Future enhancement: Real-time WebSocket updates for instant job
              status changes
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Job Actions
            </h3>
            <p className="text-sm text-gray-500">
              Click on any job to view details, retry failed jobs, or cancel
              pending ones
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex justify-center">
          <a
            href="/generate"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition-colors"
          >
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
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Job Details</h2>
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
                onViewDetails={jobId => console.log('View details:', jobId)}
                compact={false}
              />
            </div>
          </div>
        </div>
      )}
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
        <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading jobs...</p>
          </div>
        </div>
      }
    >
      <JobsContent />
    </Suspense>
  );
};

export default JobsPage;
