/**
 * Job Analytics Utilities Tests
 */

import {
  calculateSuccessRate,
  calculateSuccessRateByChannel,
  calculateSuccessRateByTimePeriod,
  getStatusDistribution,
  getChannelPerformance,
  getJobTrends,
  getTotalMetrics,
  formatTimeAgo,
  getJobsInDateRange,
} from '../job-analytics';
import type { SyncJob } from '@/types/content-generator';
import { subDays, subHours } from 'date-fns';

describe('Job Analytics Utilities', () => {
  const mockJobs: SyncJob[] = [
    {
      job_id: 'job-1',
      document_id: 'doc-1',
      status: 'completed',
      channels: ['email', 'website'],
      content_type: 'update',
      template_style: 'modern',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      job_id: 'job-2',
      document_id: 'doc-2',
      status: 'failed',
      channels: ['social'],
      content_type: 'blog',
      template_style: 'classic',
      created_at: subHours(new Date(), 12).toISOString(),
      updated_at: subHours(new Date(), 12).toISOString(),
    },
    {
      job_id: 'job-3',
      document_id: 'doc-3',
      status: 'partial',
      channels: ['email'],
      content_type: 'update',
      template_style: 'modern',
      created_at: subDays(new Date(), 2).toISOString(),
      updated_at: subDays(new Date(), 2).toISOString(),
    },
    {
      job_id: 'job-4',
      document_id: 'doc-4',
      status: 'in_progress',
      channels: ['website', 'social'],
      content_type: 'update',
      template_style: 'modern',
      created_at: subDays(new Date(), 10).toISOString(),
      updated_at: subDays(new Date(), 10).toISOString(),
    },
    {
      job_id: 'job-5',
      document_id: 'doc-5',
      status: 'pending',
      channels: ['email'],
      content_type: 'blog',
      template_style: 'classic',
      created_at: subDays(new Date(), 35).toISOString(),
      updated_at: subDays(new Date(), 35).toISOString(),
    },
  ];

  describe('calculateSuccessRate', () => {
    it('should return 0 for empty job array', () => {
      expect(calculateSuccessRate([])).toBe(0);
    });

    it('should calculate success rate correctly', () => {
      const result = calculateSuccessRate(mockJobs);
      // 2 successful (completed + partial) out of 5 = 40%
      expect(result).toBe(40);
    });

    it('should count both completed and partial as successful', () => {
      const jobs: SyncJob[] = [
        { ...mockJobs[0], status: 'completed' },
        { ...mockJobs[1], status: 'partial' },
        { ...mockJobs[2], status: 'failed' },
      ];
      // 2 out of 3 = 67%
      expect(calculateSuccessRate(jobs)).toBe(67);
    });

    it('should return 100 for all successful jobs', () => {
      const jobs: SyncJob[] = [
        { ...mockJobs[0], status: 'completed' },
        { ...mockJobs[1], status: 'completed' },
      ];
      expect(calculateSuccessRate(jobs)).toBe(100);
    });

    it('should return 0 for all failed jobs', () => {
      const jobs: SyncJob[] = [
        { ...mockJobs[0], status: 'failed' },
        { ...mockJobs[1], status: 'failed' },
      ];
      expect(calculateSuccessRate(jobs)).toBe(0);
    });
  });

  describe('calculateSuccessRateByChannel', () => {
    it('should return empty object for empty job array', () => {
      expect(calculateSuccessRateByChannel([])).toEqual({});
    });

    it('should calculate success rate for each channel', () => {
      const result = calculateSuccessRateByChannel(mockJobs);

      // email: 3 jobs (1 completed, 1 partial, 1 pending) = 67%
      expect(result['email']).toBe(67);

      // social: 2 jobs (1 failed, 1 in_progress) = 0%
      expect(result['social']).toBe(0);

      // website: 2 jobs (1 completed, 1 in_progress) = 50%
      expect(result['website']).toBe(50);
    });

    it('should handle jobs with multiple channels', () => {
      const jobs: SyncJob[] = [
        { ...mockJobs[0], status: 'completed', channels: ['email', 'website'] },
      ];
      const result = calculateSuccessRateByChannel(jobs);

      expect(result['email']).toBe(100);
      expect(result['website']).toBe(100);
    });

    it('should return 0 for channels with no successful jobs', () => {
      const jobs: SyncJob[] = [
        { ...mockJobs[0], status: 'failed', channels: ['email'] },
      ];
      const result = calculateSuccessRateByChannel(jobs);

      expect(result['email']).toBe(0);
    });
  });

  describe('calculateSuccessRateByTimePeriod', () => {
    it('should calculate success rates for different time periods', () => {
      const result = calculateSuccessRateByTimePeriod(mockJobs);

      expect(result).toHaveProperty('last24Hours');
      expect(result).toHaveProperty('last7Days');
      expect(result).toHaveProperty('last30Days');

      expect(typeof result.last24Hours).toBe('number');
      expect(typeof result.last7Days).toBe('number');
      expect(typeof result.last30Days).toBe('number');
    });

    it('should return 0 for all periods when no jobs', () => {
      const result = calculateSuccessRateByTimePeriod([]);

      expect(result.last24Hours).toBe(0);
      expect(result.last7Days).toBe(0);
      expect(result.last30Days).toBe(0);
    });

    it('should only count recent jobs in last24Hours', () => {
      const recentJobs: SyncJob[] = [
        { ...mockJobs[0], status: 'completed', created_at: new Date().toISOString() },
        { ...mockJobs[1], status: 'failed', created_at: subHours(new Date(), 12).toISOString() },
      ];
      const result = calculateSuccessRateByTimePeriod(recentJobs);

      // 1 successful out of 2 = 50%
      expect(result.last24Hours).toBe(50);
    });
  });

  describe('getStatusDistribution', () => {
    it('should return all zeros for empty job array', () => {
      const result = getStatusDistribution([]);

      expect(result).toEqual({
        completed: 0,
        failed: 0,
        in_progress: 0,
        pending: 0,
        partial: 0,
        cancelled: 0,
      });
    });

    it('should count each status correctly', () => {
      const result = getStatusDistribution(mockJobs);

      expect(result.completed).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.partial).toBe(1);
      expect(result.in_progress).toBe(1);
      expect(result.pending).toBe(1);
      expect(result.cancelled).toBe(0);
    });

    it('should handle multiple jobs with same status', () => {
      const jobs: SyncJob[] = [
        { ...mockJobs[0], status: 'completed' },
        { ...mockJobs[1], status: 'completed' },
        { ...mockJobs[2], status: 'completed' },
      ];
      const result = getStatusDistribution(jobs);

      expect(result.completed).toBe(3);
      expect(result.failed).toBe(0);
    });
  });

  describe('getChannelPerformance', () => {
    it('should return empty array for empty job array', () => {
      expect(getChannelPerformance([])).toEqual([]);
    });

    it('should calculate performance metrics for each channel', () => {
      const result = getChannelPerformance(mockJobs);

      const emailPerf = result.find(p => p.channel === 'email');
      expect(emailPerf).toBeDefined();
      expect(emailPerf!.total).toBeGreaterThan(0);
      expect(emailPerf!.successRate).toBeGreaterThanOrEqual(0);
      expect(emailPerf!.successRate).toBeLessThanOrEqual(100);
    });

    it('should track successful and failed jobs separately', () => {
      const jobs: SyncJob[] = [
        { ...mockJobs[0], status: 'completed', channels: ['email'] },
        { ...mockJobs[1], status: 'failed', channels: ['email'] },
        { ...mockJobs[2], status: 'in_progress', channels: ['email'] },
      ];
      const result = getChannelPerformance(jobs);

      const emailPerf = result.find(p => p.channel === 'email');
      expect(emailPerf!.total).toBe(3);
      expect(emailPerf!.successful).toBe(1);
      expect(emailPerf!.failed).toBe(1);
      expect(emailPerf!.successRate).toBe(33); // 1/3 = 33%
    });

    it('should calculate 100% success rate when all jobs successful', () => {
      const jobs: SyncJob[] = [
        { ...mockJobs[0], status: 'completed', channels: ['email'] },
        { ...mockJobs[1], status: 'partial', channels: ['email'] },
      ];
      const result = getChannelPerformance(jobs);

      const emailPerf = result.find(p => p.channel === 'email');
      expect(emailPerf!.successRate).toBe(100);
    });
  });

  describe('getJobTrends', () => {
    it('should return trends for default 7 days', () => {
      const result = getJobTrends(mockJobs);

      expect(result.length).toBe(7);
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('total');
      expect(result[0]).toHaveProperty('successful');
      expect(result[0]).toHaveProperty('failed');
      expect(result[0]).toHaveProperty('successRate');
    });

    it('should return trends for custom number of days', () => {
      const result = getJobTrends(mockJobs, 14);

      expect(result.length).toBe(14);
    });

    it('should calculate success rate for each day', () => {
      const result = getJobTrends(mockJobs, 7);

      result.forEach(trend => {
        expect(trend.successRate).toBeGreaterThanOrEqual(0);
        expect(trend.successRate).toBeLessThanOrEqual(100);
      });
    });

    it('should sort trends by date ascending', () => {
      const result = getJobTrends(mockJobs, 7);

      for (let i = 1; i < result.length; i++) {
        expect(result[i].date >= result[i - 1].date).toBe(true);
      }
    });

    it('should initialize all days even with no jobs', () => {
      const result = getJobTrends([], 3);

      expect(result.length).toBe(3);
      result.forEach(trend => {
        expect(trend.total).toBe(0);
        expect(trend.successful).toBe(0);
        expect(trend.failed).toBe(0);
        expect(trend.successRate).toBe(0);
      });
    });
  });

  describe('getTotalMetrics', () => {
    it('should calculate all total metrics correctly', () => {
      const result = getTotalMetrics(mockJobs);

      expect(result.totalJobs).toBe(5);
      expect(result.successfulJobs).toBe(2); // completed + partial
      expect(result.failedJobs).toBe(1);
      expect(result.activeJobs).toBe(2); // in_progress + pending
      expect(result.successRate).toBe(40); // 2/5 = 40%
    });

    it('should return zeros for empty job array', () => {
      const result = getTotalMetrics([]);

      expect(result.totalJobs).toBe(0);
      expect(result.successfulJobs).toBe(0);
      expect(result.failedJobs).toBe(0);
      expect(result.activeJobs).toBe(0);
      expect(result.successRate).toBe(0);
    });

    it('should count partial jobs as successful', () => {
      const jobs: SyncJob[] = [
        { ...mockJobs[0], status: 'partial' },
        { ...mockJobs[1], status: 'completed' },
      ];
      const result = getTotalMetrics(jobs);

      expect(result.successfulJobs).toBe(2);
    });
  });

  describe('formatTimeAgo', () => {
    it('should format recent time correctly', () => {
      const now = new Date().toISOString();
      const result = formatTimeAgo(now);

      expect(result).toContain('ago');
    });

    it('should return "Unknown" for invalid date', () => {
      const result = formatTimeAgo('invalid-date');

      expect(result).toBe('Unknown');
    });

    it('should handle past dates', () => {
      const pastDate = subDays(new Date(), 3).toISOString();
      const result = formatTimeAgo(pastDate);

      expect(result).toContain('ago');
      expect(result).toContain('day');
    });
  });

  describe('getJobsInDateRange', () => {
    it('should return jobs within date range', () => {
      const startDate = subDays(new Date(), 5);
      const endDate = new Date();

      const result = getJobsInDateRange(mockJobs, startDate, endDate);

      expect(result.length).toBeGreaterThan(0);
      result.forEach(job => {
        const jobDate = new Date(job.created_at);
        expect(jobDate > startDate).toBe(true);
        expect(jobDate < endDate).toBe(true);
      });
    });

    it('should return empty array for range with no jobs', () => {
      const startDate = subDays(new Date(), 100);
      const endDate = subDays(new Date(), 90);

      const result = getJobsInDateRange(mockJobs, startDate, endDate);

      expect(result).toEqual([]);
    });

    it('should exclude jobs outside the range', () => {
      const startDate = subDays(new Date(), 1);
      const endDate = new Date();

      const result = getJobsInDateRange(mockJobs, startDate, endDate);

      // Should only include jobs from last 24 hours
      result.forEach(job => {
        const jobDate = new Date(job.created_at);
        expect(jobDate > startDate).toBe(true);
      });
    });

    it('should handle empty job array', () => {
      const startDate = subDays(new Date(), 7);
      const endDate = new Date();

      const result = getJobsInDateRange([], startDate, endDate);

      expect(result).toEqual([]);
    });
  });
});
