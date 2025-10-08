'use client';

import React, { useState, useEffect } from 'react';
import ContentGeneratorHealth from '@/app/components/features/content-generator-health';
import AnalyticsMetrics from '@/app/components/features/analytics-metrics';
import JobCharts from '@/app/components/features/job-charts';
import { ContentGeneratorAPI } from '@/lib/api/api-client';
import type { SyncJob } from '@/types/content-generator';

/**
 * Dashboard Page
 * Main dashboard view showing system health, analytics, and metrics
 */
const DashboardPage = (): React.ReactElement => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const [jobs, setJobs] = useState<SyncJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | undefined>(undefined);

  // Load API key from localStorage
  useEffect(() => {
    const storedKey = localStorage.getItem('api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  // Fetch jobs for analytics (using mock data)
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Use mock data for development/testing
        const { mockDataStore } = await import('@/lib/utils/mock-data-generator');
        const mockJobs = mockDataStore.getJobs(100);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        setJobs(mockJobs);

        /* Uncomment when backend API is ready:
        const api = new ContentGeneratorAPI(API_URL, apiKey);
        const response = await api.listJobs({ limit: 100 });

        if (response.success && response.data) {
          setJobs(response.data.jobs);
        }
        */
      } catch (err) {
        console.error('Failed to fetch jobs for analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
    const interval = setInterval(fetchJobs, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [API_URL, apiKey]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Content Generator Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Monitor system health, manage content generation, and view analytics
          </p>
        </div>

        {/* Health Status Section */}
        <div className="mb-8">
          <ContentGeneratorHealth
            apiUrl={API_URL}
            refreshInterval={30000} // Refresh every 30 seconds
            onStatusChange={() => {
              // Custom logic for status changes (e.g., show notifications)
            }}
          />
        </div>

        {/* Analytics Metrics */}
        {!loading && jobs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h2>
            <AnalyticsMetrics jobs={jobs} showTimePeriods={true} />
          </div>
        )}

        {/* Job Charts */}
        {!loading && jobs.length > 0 && (
          <div className="mb-8">
            <JobCharts jobs={jobs} trendDays={7} />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && jobs.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8 text-center">
            <p className="text-gray-600">
              No jobs found. Start by generating some content to see analytics.
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Generate Content
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Create new AI-powered content for your campaigns
              </p>
              <a
                href="/generate"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Start Generating
              </a>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                View Jobs
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Monitor active and completed content generation jobs
              </p>
              <a
                href="/jobs"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                View Jobs
              </a>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Templates
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Browse and manage content generation templates
              </p>
              <a
                href="/templates"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Browse Templates
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
