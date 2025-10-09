'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MetricsCard } from '@/app/components/features/metrics-card';
import type { AnalyticsOverview } from '@/types/content-generator';

// Code splitting: Dynamically import heavy chart component
const AnalyticsCharts = dynamic(
  () =>
    import('@/app/components/features/analytics-charts').then(
      mod => mod.AnalyticsCharts
    ),
  {
    loading: () => (
      <div className="tb-card pad animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    ),
    ssr: false,
  }
);

/**
 * Analytics Page
 *
 * Displays comprehensive analytics dashboard with key metrics,
 * charts, and performance indicators for content generation jobs.
 */
const AnalyticsPage: React.FC = (): JSX.Element => {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  /**
   * Fetch analytics data from toombos-backend API
   */
  const fetchAnalytics = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const apiKey = localStorage.getItem('api_key') || '';
      const { ContentGeneratorAPI } = await import('@/lib/api/api-client');
      const api = new ContentGeneratorAPI(API_URL, apiKey);

      const endDate = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
      }

      const response = await api.getAnalytics({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        granularity: timeRange === '24h' ? 'hour' : 'day',
      });

      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        setError(response.error?.message || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [API_URL, timeRange]);

  /**
   * Fetch analytics on mount and when time range changes
   */
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  /**
   * Calculate trend compared to previous period
   */
  const calculateTrend = (
    current: number,
    total: number
  ): { value: number; direction: 'up' | 'down' | 'neutral' } => {
    // For demo purposes, calculate a simple trend
    // In production, this would compare to previous period data
    const change = (current / total) * 100 - 50;
    return {
      value: Math.abs(change),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    };
  };

  /**
   * Format processing time for display
   */
  const formatProcessingTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

  if (error) {
    return (
      <div className="tb-container py-8">
        <div className="tb-card pad" style={{ borderColor: 'var(--accent)' }}>
          <h3 className="title text-lg mb-2">
            Error Loading Analytics
          </h3>
          <p className="subtle">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 tb-btn primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tb-container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="h1 mb-2">
          Analytics Dashboard
        </h1>
        <p className="subtle">
          Insights and performance metrics for your content generation jobs
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6 flex gap-2">
        {(['24h', '7d', '30d'] as const).map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={timeRange === range ? 'tb-btn primary' : 'tb-btn ghost'}
          >
            {range === '24h'
              ? 'Last 24 Hours'
              : range === '7d'
                ? 'Last 7 Days'
                : 'Last 30 Days'}
          </button>
        ))}
        <button
          onClick={fetchAnalytics}
          className="ml-auto tb-btn ghost"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricsCard
          title="Total Jobs"
          value={analytics?.job_analytics.total_jobs || 0}
          subtitle={`Last ${timeRange === '24h' ? '24 hours' : timeRange === '7d' ? '7 days' : '30 days'}`}
          trend={
            analytics
              ? calculateTrend(
                  analytics.job_analytics.completed_jobs,
                  analytics.job_analytics.total_jobs
                )
              : undefined
          }
          loading={loading}
        />
        <MetricsCard
          title="Success Rate"
          value={
            analytics
              ? `${analytics.job_analytics.success_rate.toFixed(1)}%`
              : '0%'
          }
          subtitle="Completed successfully"
          trend={
            analytics
              ? {
                  value: analytics.job_analytics.success_rate - 50,
                  direction:
                    analytics.job_analytics.success_rate > 80
                      ? 'up'
                      : analytics.job_analytics.success_rate < 50
                        ? 'down'
                        : 'neutral',
                }
              : undefined
          }
          loading={loading}
        />
        <MetricsCard
          title="Avg Processing Time"
          value={
            analytics
              ? formatProcessingTime(
                  analytics.job_analytics.avg_processing_time_seconds
                )
              : '0s'
          }
          subtitle="Per job"
          loading={loading}
        />
        <MetricsCard
          title="Active Jobs"
          value={analytics?.job_analytics.in_progress_jobs || 0}
          subtitle="Currently processing"
          loading={loading}
        />
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricsCard
          title="Completed"
          value={analytics?.job_analytics.completed_jobs || 0}
          subtitle="Successfully finished"
          loading={loading}
        />
        <MetricsCard
          title="Failed"
          value={analytics?.job_analytics.failed_jobs || 0}
          subtitle="Requires attention"
          loading={loading}
        />
        <MetricsCard
          title="Pending"
          value={analytics?.job_analytics.pending_jobs || 0}
          subtitle="Waiting to start"
          loading={loading}
        />
      </div>

      {/* Charts */}
      {analytics && !loading && (
        <AnalyticsCharts jobAnalytics={analytics.job_analytics} />
      )}

      {loading && !analytics && (
        <AnalyticsCharts
          jobAnalytics={{
            total_jobs: 0,
            completed_jobs: 0,
            failed_jobs: 0,
            pending_jobs: 0,
            in_progress_jobs: 0,
            cancelled_jobs: 0,
            success_rate: 0,
            avg_processing_time_seconds: 0,
            jobs_by_channel: {},
            jobs_by_status: {},
            jobs_over_time: [],
          }}
          loading={true}
        />
      )}

      {/* Recent Activity Section */}
      {analytics && !loading && (
        <div className="mt-8 tb-card pad">
          <h3 className="title text-lg mb-4">
            Recent Activity
          </h3>
          <div className="tb-grid cols-3">
            <div className="tb-stat">
              <p className="text-sm subtle mb-1">Last 24 Hours</p>
              <p className="text-2xl font-bold">
                {analytics.recent_activity.last_24h}
              </p>
            </div>
            <div className="tb-stat">
              <p className="text-sm subtle mb-1">Last 7 Days</p>
              <p className="text-2xl font-bold">
                {analytics.recent_activity.last_7d}
              </p>
            </div>
            <div className="tb-stat">
              <p className="text-sm subtle mb-1">Last 30 Days</p>
              <p className="text-2xl font-bold">
                {analytics.recent_activity.last_30d}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
