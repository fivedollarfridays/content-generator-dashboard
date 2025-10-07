/**
 * Job Analytics Utilities
 * Calculate success rates, metrics, and statistics from job data
 */

import type { SyncJob, JobStatus, Channel } from '@/types/content-generator';
import { formatDistanceToNow, isAfter, isBefore, subDays, subHours } from 'date-fns';

export interface SuccessRateMetrics {
  overall: number;
  byChannel: Record<Channel, number>;
  byTimePeriod: {
    last24Hours: number;
    last7Days: number;
    last30Days: number;
  };
}

export interface StatusDistribution {
  completed: number;
  failed: number;
  in_progress: number;
  pending: number;
  partial: number;
  cancelled: number;
}

export interface ChannelPerformance {
  channel: Channel;
  total: number;
  successful: number;
  failed: number;
  successRate: number;
}

export interface JobTrend {
  date: string;
  total: number;
  successful: number;
  failed: number;
  successRate: number;
}

/**
 * Calculate overall success rate from jobs
 */
export function calculateSuccessRate(jobs: SyncJob[]): number {
  if (jobs.length === 0) return 0;

  const completedJobs = jobs.filter(
    job => job.status === 'completed' || job.status === 'partial'
  );

  return Math.round((completedJobs.length / jobs.length) * 100);
}

/**
 * Calculate success rate by channel
 */
export function calculateSuccessRateByChannel(
  jobs: SyncJob[]
): Record<string, number> {
  const channelStats: Record<string, { total: number; successful: number }> = {};

  jobs.forEach(job => {
    job.channels.forEach(channel => {
      if (!channelStats[channel]) {
        channelStats[channel] = { total: 0, successful: 0 };
      }

      channelStats[channel].total++;

      if (job.status === 'completed' || job.status === 'partial') {
        channelStats[channel].successful++;
      }
    });
  });

  const successRates: Record<string, number> = {};
  Object.entries(channelStats).forEach(([channel, stats]) => {
    successRates[channel] =
      stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0;
  });

  return successRates;
}

/**
 * Calculate success rate by time period
 */
export function calculateSuccessRateByTimePeriod(jobs: SyncJob[]): {
  last24Hours: number;
  last7Days: number;
  last30Days: number;
} {
  const now = new Date();

  const last24Hours = jobs.filter(job =>
    isAfter(new Date(job.created_at), subHours(now, 24))
  );

  const last7Days = jobs.filter(job =>
    isAfter(new Date(job.created_at), subDays(now, 7))
  );

  const last30Days = jobs.filter(job =>
    isAfter(new Date(job.created_at), subDays(now, 30))
  );

  return {
    last24Hours: calculateSuccessRate(last24Hours),
    last7Days: calculateSuccessRate(last7Days),
    last30Days: calculateSuccessRate(last30Days),
  };
}

/**
 * Get job status distribution
 */
export function getStatusDistribution(jobs: SyncJob[]): StatusDistribution {
  const distribution: StatusDistribution = {
    completed: 0,
    failed: 0,
    in_progress: 0,
    pending: 0,
    partial: 0,
    cancelled: 0,
  };

  jobs.forEach(job => {
    distribution[job.status]++;
  });

  return distribution;
}

/**
 * Get channel performance metrics
 */
export function getChannelPerformance(jobs: SyncJob[]): ChannelPerformance[] {
  const channelStats: Record<
    string,
    { total: number; successful: number; failed: number }
  > = {};

  jobs.forEach(job => {
    job.channels.forEach(channel => {
      if (!channelStats[channel]) {
        channelStats[channel] = { total: 0, successful: 0, failed: 0 };
      }

      channelStats[channel].total++;

      if (job.status === 'completed' || job.status === 'partial') {
        channelStats[channel].successful++;
      } else if (job.status === 'failed') {
        channelStats[channel].failed++;
      }
    });
  });

  return Object.entries(channelStats).map(([channel, stats]) => ({
    channel: channel as Channel,
    total: stats.total,
    successful: stats.successful,
    failed: stats.failed,
    successRate:
      stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0,
  }));
}

/**
 * Get job trends over time (daily)
 */
export function getJobTrends(jobs: SyncJob[], days: number = 7): JobTrend[] {
  const now = new Date();
  const trends: Record<string, { total: number; successful: number; failed: number }> =
    {};

  // Initialize all dates
  for (let i = 0; i < days; i++) {
    const date = subDays(now, i);
    const dateKey = date.toISOString().split('T')[0];
    trends[dateKey] = { total: 0, successful: 0, failed: 0 };
  }

  // Aggregate jobs by date
  jobs.forEach(job => {
    const jobDate = new Date(job.created_at);
    const dateKey = jobDate.toISOString().split('T')[0];

    if (trends[dateKey]) {
      trends[dateKey].total++;

      if (job.status === 'completed' || job.status === 'partial') {
        trends[dateKey].successful++;
      } else if (job.status === 'failed') {
        trends[dateKey].failed++;
      }
    }
  });

  // Convert to array and calculate success rate
  return Object.entries(trends)
    .map(([date, stats]) => ({
      date,
      total: stats.total,
      successful: stats.successful,
      failed: stats.failed,
      successRate:
        stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get total metrics summary
 */
export function getTotalMetrics(jobs: SyncJob[]) {
  const statusDist = getStatusDistribution(jobs);
  const successRate = calculateSuccessRate(jobs);

  return {
    totalJobs: jobs.length,
    successfulJobs: statusDist.completed + statusDist.partial,
    failedJobs: statusDist.failed,
    activeJobs: statusDist.in_progress + statusDist.pending,
    successRate,
  };
}

/**
 * Format time ago string
 */
export function formatTimeAgo(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return 'Unknown';
  }
}

/**
 * Get jobs within date range
 */
export function getJobsInDateRange(
  jobs: SyncJob[],
  startDate: Date,
  endDate: Date
): SyncJob[] {
  return jobs.filter(job => {
    const jobDate = new Date(job.created_at);
    return isAfter(jobDate, startDate) && isBefore(jobDate, endDate);
  });
}
