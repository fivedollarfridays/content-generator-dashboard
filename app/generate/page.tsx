'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ContentGenerationForm from '@/app/components/features/content-generation-form';
import type { SyncJob, APIError } from '@/types/content-generator';
import { useAuth } from '@/app/contexts';

/**
 * Content Generation Page
 * Allows users to create and publish content across multiple channels
 *
 * Features:
 * - Multi-channel content generation
 * - Template style selection
 * - Content type configuration
 * - Schedule publishing
 * - Dry run mode for preview
 *
 * @returns Content generation page component
 */
const GeneratePage = (): React.ReactElement => {
  const router = useRouter();
  const { apiKey } = useAuth();
  const [submittedJob, setSubmittedJob] = useState<SyncJob | null>(null);
  const [error, setError] = useState<APIError | null>(null);

  // Get API configuration from environment
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  /**
   * Handle successful content generation submission
   * Stores the job and navigates to jobs page to track progress
   */
  const handleSubmit = useCallback(
    (job: SyncJob): void => {
      setSubmittedJob(job);
      setError(null);

      // Navigate to jobs page after a short delay to show success state
      setTimeout(() => {
        router.push(`/jobs?highlight=${job.job_id}`);
      }, 1500);
    },
    [router]
  );

  /**
   * Handle content generation errors
   * Displays error message to user
   */
  const handleError = useCallback((err: APIError): void => {
    setError(err);
    setSubmittedJob(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Generate Content</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create AI-powered content and publish it across multiple channels
          </p>
        </div>

        {/* Success Message */}
        {submittedJob && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800">
                  Content generation started successfully!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Job ID: {submittedJob.job_id}</p>
                  <p>Status: {submittedJob.status}</p>
                  <p className="mt-1">
                    Redirecting to jobs page to track progress...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Content generation failed
                </h3>
                <p className="mt-1 text-sm text-red-700">{error.message}</p>
                {error.details && (
                  <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto">
                    {JSON.stringify(error.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content Generation Form */}
        <ContentGenerationForm
          apiUrl={API_URL}
          apiKey={apiKey || undefined}
          onSubmit={handleSubmit}
          onError={handleError}
          defaultChannels={[]}
          defaultTemplate="modern"
        />

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 How to use
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">1.</span>
              <span>
                Enter your document ID (Google Docs or Notion format: gdocs:xxx
                or notion:xxx)
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              <span>
                Select one or more channels where you want to publish (Email,
                Website, Social Media)
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              <span>
                Choose content type (Update, Blog Post, or Announcement) and
                template style
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">4.</span>
              <span>
                Optionally schedule for later or use dry run mode to preview
                without publishing
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">5.</span>
              <span>
                Click "Generate & Publish" - you'll be redirected to the jobs
                page to monitor progress
              </span>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="mt-6 flex justify-between items-center text-sm">
          <a
            href="/templates"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Browse Templates
          </a>
          <a
            href="/jobs"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View All Jobs →
          </a>
        </div>
      </div>
    </div>
  );
};

export default GeneratePage;
