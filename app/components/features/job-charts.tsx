/**
 * JobCharts Component
 * Visualize job data with charts using Recharts
 */

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
import type { SyncJob } from '@/types/content-generator';
import {
  getStatusDistribution,
  getChannelPerformance,
  getJobTrends,
} from '@/lib/utils/job-analytics';

export interface JobChartsProps {
  jobs: SyncJob[];
  trendDays?: number;
}

const STATUS_COLORS: Record<string, string> = {
  completed: '#10b981', // green-500
  failed: '#ef4444', // red-500
  in_progress: '#3b82f6', // blue-500
  pending: '#f59e0b', // yellow-500
  partial: '#f97316', // orange-500
  cancelled: '#6b7280', // gray-500
};

const CHANNEL_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

/**
 * Status Distribution Pie Chart
 */
const StatusDistributionChart: React.FC<{ jobs: SyncJob[] }> = ({ jobs }) => {
  const distribution = getStatusDistribution(jobs);

  const data = Object.entries(distribution)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: status.replace('_', ' ').toUpperCase(),
      value: count,
      color: STATUS_COLORS[status] || '#6b7280',
    }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
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
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

/**
 * Success Rate Trend Line Chart
 */
const SuccessRateTrendChart: React.FC<{ jobs: SyncJob[]; days: number }> = ({
  jobs,
  days,
}) => {
  const trends = getJobTrends(jobs, days);

  if (trends.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    );
  }

  const data = trends.map(trend => ({
    date: new Date(trend.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    'Success Rate': trend.successRate,
    Total: trend.total,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis yAxisId="left" domain={[0, 100]} />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="Success Rate"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="Total"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

/**
 * Channel Performance Bar Chart
 */
const ChannelPerformanceChart: React.FC<{ jobs: SyncJob[] }> = ({ jobs }) => {
  const performance = getChannelPerformance(jobs);

  if (performance.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    );
  }

  const data = performance.map(p => ({
    channel: p.channel,
    Successful: p.successful,
    Failed: p.failed,
    'Success Rate': p.successRate,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="channel" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="Successful" fill="#10b981" />
        <Bar yAxisId="left" dataKey="Failed" fill="#ef4444" />
        <Bar yAxisId="right" dataKey="Success Rate" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * Job Charts Component
 *
 * Displays multiple charts for job analytics:
 * - Status distribution pie chart
 * - Success rate trend line chart
 * - Channel performance bar chart
 *
 * @param props - Component props
 * @returns Job analytics charts
 *
 * @example
 * ```tsx
 * <JobCharts jobs={jobs} trendDays={7} />
 * ```
 */
export const JobCharts: React.FC<JobChartsProps> = ({
  jobs,
  trendDays = 7,
}) => {
  return (
    <div className="space-y-6">
      {/* Status Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Status Distribution
        </h3>
        <StatusDistributionChart jobs={jobs} />
      </div>

      {/* Success Rate Trend */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Success Rate Trend
          </h3>
          <span className="text-sm text-gray-600">Last {trendDays} days</span>
        </div>
        <SuccessRateTrendChart jobs={jobs} days={trendDays} />
      </div>

      {/* Channel Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Channel Performance
        </h3>
        <ChannelPerformanceChart jobs={jobs} />
      </div>
    </div>
  );
};

export default JobCharts;
