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

  // Fetch jobs for analytics from toombos-backend API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const api = new ContentGeneratorAPI(API_URL, apiKey);
        const response = await api.listJobs({ limit: 100 });

        if (response.success && response.data) {
          setJobs(response.data.jobs);
        } else {
          console.error('Failed to fetch jobs:', response.error?.message);
        }
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
    <div className="min-h-screen py-8">
      <div className="tb-container">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="h1">
            Content Generator Dashboard
          </h1>
          <p className="mt-2 text-sm subtle">
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
            <h2 className="h2 mb-4">Analytics</h2>
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
          <div className="tb-card pad mb-8">
            <div className="animate-pulse">
              <div className="h-8 rounded w-1/4 mb-4" style={{ backgroundColor: 'var(--surface-muted)' }}></div>
              <div className="tb-grid cols-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 rounded" style={{ backgroundColor: 'var(--surface-muted)' }}></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && jobs.length === 0 && (
          <div className="tb-card pad mb-8 text-center">
            <p className="subtle">
              No jobs found. Start by generating some content to see analytics.
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="h2 mb-4">
            Quick Actions
          </h2>
          <div className="tb-grid cols-3">
            <div className="tb-action">
              <h3 className="title text-lg">
                Generate Content
              </h3>
              <p className="text-sm subtle">
                Create new AI-powered content for your campaigns
              </p>
              <a
                href="/generate"
                className="tb-btn primary mt-3"
              >
                Start Generating
              </a>
            </div>

            <div className="tb-action">
              <h3 className="title text-lg">
                View Jobs
              </h3>
              <p className="text-sm subtle">
                Monitor active and completed content generation jobs
              </p>
              <a
                href="/jobs"
                className="tb-btn primary mt-3"
              >
                View Jobs
              </a>
            </div>

            <div className="tb-action">
              <h3 className="title text-lg">
                Templates
              </h3>
              <p className="text-sm subtle">
                Browse and manage content generation templates
              </p>
              <a
                href="/templates"
                className="tb-btn primary mt-3"
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
