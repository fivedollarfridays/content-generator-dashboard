'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { JobAnalytics, Channel } from '@/types/content-generator';

/**
 * Props for AnalyticsCharts component
 */
export interface AnalyticsChartsProps {
  jobAnalytics: JobAnalytics;
  loading?: boolean;
}

/**
 * AnalyticsCharts Component
 *
 * Displays various charts for job analytics including time series,
 * status distribution, and channel performance.
 *
 * @example
 * ```tsx
 * <AnalyticsCharts jobAnalytics={analyticsData} />
 * ```
 */
export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  jobAnalytics,
  loading = false,
}): JSX.Element => {
  /**
   * Color palette for charts
   */
  const COLORS = {
    completed: '#10B981', // green
    failed: '#EF4444', // red
    pending: '#F59E0B', // yellow
    in_progress: '#3B82F6', // blue
    cancelled: '#6B7280', // gray
    partial: '#8B5CF6', // purple
  };

  /**
   * Prepare status distribution data for pie chart
   */
  const statusData = React.useMemo((): Array<{
    name: string;
    value: number;
    color: string;
  }> => {
    return Object.entries(jobAnalytics.jobs_by_status)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        name: status.replace('_', ' '),
        value: count,
        color: COLORS[status as keyof typeof COLORS] || '#6B7280',
      }));
  }, [jobAnalytics.jobs_by_status]);

  /**
   * Prepare channel distribution data for bar chart
   */
  const channelData = React.useMemo((): Array<{
    channel: string;
    jobs: number;
  }> => {
    return Object.entries(jobAnalytics.jobs_by_channel).map(
      ([channel, count]) => ({
        channel: channel.replace('_', ' ').replace('social ', ''),
        jobs: count,
      })
    );
  }, [jobAnalytics.jobs_by_channel]);

  /**
   * Prepare time series data for line chart
   */
  const timeSeriesData = React.useMemo(() => {
    return jobAnalytics.jobs_over_time.map(point => ({
      timestamp: new Date(point.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      count: point.count,
    }));
  }, [jobAnalytics.jobs_over_time]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="bg-white rounded-lg shadow p-6 border border-gray-200"
          >
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Jobs Over Time - Line Chart */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Jobs Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="timestamp"
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Jobs"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution - Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Distribution - Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Jobs by Channel
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={channelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="channel"
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              <Bar dataKey="jobs" fill="#3B82F6" name="Jobs" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
