/**
 * Mock Data Generator
 * Generates realistic simulated data for testing and development
 */

import type {
  SyncJob,
  JobStatus,
  Channel,
  AnalyticsOverview,
  JobAnalytics,
} from '@/types/content-generator';

/**
 * Generate random date within range
 */
const randomDate = (start: Date, end: Date): Date => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

/**
 * Generate random job ID
 */
const generateJobId = (): string => {
  return `job_${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Generate random document ID
 */
const generateDocId = (): string => {
  return `doc_${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Get random item from array
 */
const randomItem = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * Get random items from array
 */
const randomItems = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

/**
 * Generate mock sync job
 */
export const generateMockJob = (overrides?: Partial<SyncJob>): SyncJob => {
  const statuses: JobStatus[] = [
    'pending',
    'in_progress',
    'completed',
    'failed',
    'partial',
    'cancelled',
  ];
  const channels: Channel[] = [
    'email',
    'website',
    'social_twitter',
    'social_linkedin',
    'social_facebook',
  ];

  const status = randomItem(statuses);
  const createdAt = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());
  const startedAt = new Date(createdAt.getTime() + Math.random() * 5000);
  const completedAt =
    status === 'completed' || status === 'failed' || status === 'partial'
      ? new Date(startedAt.getTime() + Math.random() * 60000)
      : undefined;

  const updatedAt = completedAt || startedAt;

  const resultTimestamp = completedAt?.toISOString() || new Date().toISOString();

  const job: SyncJob = {
    job_id: generateJobId(),
    document_id: generateDocId(),
    channels: randomItems(channels, Math.floor(Math.random() * 3) + 1),
    status,
    created_at: createdAt.toISOString(),
    updated_at: updatedAt.toISOString(),
    started_at: startedAt.toISOString(),
    completed_at: completedAt?.toISOString(),
    results:
      status === 'completed' || status === 'partial'
        ? {
            email: {
              status: 'success',
              content_id: 'email_123',
              timestamp: resultTimestamp
            },
            website: {
              status: 'success',
              content_id: 'web_456',
              timestamp: resultTimestamp
            },
          }
        : undefined,
    errors:
      status === 'failed'
        ? ['API rate limit exceeded', 'Failed to generate content']
        : status === 'partial'
          ? ['Failed to publish to Twitter']
          : undefined,
    ...overrides,
  };

  return job;
};

/**
 * Generate multiple mock jobs
 */
export const generateMockJobs = (count: number): SyncJob[] => {
  const jobs: SyncJob[] = [];

  // Ensure good distribution of statuses
  const statusCounts = {
    completed: Math.floor(count * 0.6),
    failed: Math.floor(count * 0.1),
    in_progress: Math.floor(count * 0.15),
    pending: Math.floor(count * 0.05),
    partial: Math.floor(count * 0.05),
    cancelled: Math.floor(count * 0.05),
  };

  Object.entries(statusCounts).forEach(([status, statusCount]) => {
    for (let i = 0; i < statusCount; i++) {
      jobs.push(generateMockJob({ status: status as JobStatus }));
    }
  });

  // Fill remaining
  while (jobs.length < count) {
    jobs.push(generateMockJob());
  }

  // Sort by created_at descending
  jobs.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return jobs;
};

/**
 * Generate mock analytics from jobs
 */
export const generateMockAnalytics = (jobs: SyncJob[]): JobAnalytics => {
  const now = new Date();
  const last24h = jobs.filter(
    j => new Date(j.created_at) > new Date(now.getTime() - 24 * 60 * 60 * 1000)
  );
  const last7d = jobs.filter(
    j => new Date(j.created_at) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  );
  const last30d = jobs;

  const calculateStats = (jobList: SyncJob[]) => {
    const byStatus = jobList.reduce(
      (acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      },
      {} as Record<JobStatus, number>
    );

    const byChannel = jobList.reduce(
      (acc, job) => {
        job.channels.forEach(channel => {
          acc[channel] = (acc[channel] || 0) + 1;
        });
        return acc;
      },
      {} as Record<Channel, number>
    );

    const completed = byStatus.completed || 0;
    const failed = byStatus.failed || 0;
    const total = jobList.length;
    const successRate = total > 0 ? (completed / total) * 100 : 0;

    const durations = jobList
      .filter(j => j.started_at && j.completed_at)
      .map(
        j =>
          new Date(j.completed_at!).getTime() -
          new Date(j.started_at!).getTime()
      );

    const avgDuration =
      durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0;

    return {
      byStatus,
      byChannel,
      successRate,
      avgDuration: Math.floor(avgDuration / 1000), // Convert to seconds
      total,
    };
  };

  const stats24h = calculateStats(last24h);
  const stats7d = calculateStats(last7d);
  const stats30d = calculateStats(last30d);

  // Generate daily data for charts
  const jobsOverTime: Array<{ timestamp: string; count: number }> = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    const count = jobs.filter(j => {
      const jobDate = new Date(j.created_at).toISOString().split('T')[0];
      return jobDate === dateKey;
    }).length;

    jobsOverTime.push({
      timestamp: date.toISOString(),
      count,
    });
  }

  return {
    total_jobs: jobs.length,
    completed_jobs: stats30d.byStatus.completed || 0,
    failed_jobs: stats30d.byStatus.failed || 0,
    pending_jobs: stats30d.byStatus.pending || 0,
    in_progress_jobs: stats30d.byStatus.in_progress || 0,
    cancelled_jobs: stats30d.byStatus.cancelled || 0,
    jobs_by_status: stats30d.byStatus,
    jobs_by_channel: stats30d.byChannel,
    success_rate: stats30d.successRate,
    avg_processing_time_seconds: stats30d.avgDuration,
    jobs_over_time: jobsOverTime,
  };
};

/**
 * Generate mock analytics overview
 */
export const generateMockAnalyticsOverview = (): AnalyticsOverview => {
  const jobs = generateMockJobs(150);
  const jobAnalytics = generateMockAnalytics(jobs);

  const now = new Date();
  const last24h = jobs.filter(
    j => new Date(j.created_at) > new Date(now.getTime() - 24 * 60 * 60 * 1000)
  );
  const last7d = jobs.filter(
    j => new Date(j.created_at) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  );
  const last30d = jobs;

  const channels: Channel[] = [
    'email',
    'website',
    'social_twitter',
    'social_linkedin',
    'social_facebook',
  ];

  const channelPerformance: Record<
    string,
    {
      total_jobs: number;
      success_rate: number;
      avg_processing_time_seconds: number;
    }
  > = {};

  channels.forEach(channel => {
    const channelJobs = jobs.filter(j => j.channels.includes(channel));
    const completedJobs = channelJobs.filter(j => j.status === 'completed');
    const successRate =
      channelJobs.length > 0 ? (completedJobs.length / channelJobs.length) * 100 : 0;

    channelPerformance[channel] = {
      total_jobs: channelJobs.length,
      success_rate: successRate,
      avg_processing_time_seconds: Math.floor(Math.random() * 120) + 30, // 30-150 seconds
    };
  });

  return {
    job_analytics: jobAnalytics,
    performance_metrics: {
      avg_response_time_ms: 245.3,
      p95_response_time_ms: 567.8,
      p99_response_time_ms: 892.1,
      error_rate: 3.2,
      success_rate: 96.8,
    },
    channel_performance: channelPerformance,
    recent_activity: {
      last_24h: last24h.length,
      last_7d: last7d.length,
      last_30d: last30d.length,
    },
  };
};

/**
 * Store for mock data (singleton)
 */
class MockDataStore {
  private jobs: SyncJob[] = [];
  private initialized = false;

  initialize(): void {
    if (!this.initialized) {
      this.jobs = generateMockJobs(150);
      this.initialized = true;
    }
  }

  getJobs(limit?: number): SyncJob[] {
    this.initialize();
    return limit ? this.jobs.slice(0, limit) : this.jobs;
  }

  getJob(jobId: string): SyncJob | undefined {
    this.initialize();
    return this.jobs.find(j => j.job_id === jobId);
  }

  getAnalytics(): JobAnalytics {
    this.initialize();
    return generateMockAnalytics(this.jobs);
  }

  getAnalyticsOverview(): AnalyticsOverview {
    this.initialize();
    return generateMockAnalyticsOverview();
  }

  addJob(job: SyncJob): void {
    this.initialize();
    this.jobs.unshift(job);
  }

  updateJob(jobId: string, updates: Partial<SyncJob>): void {
    this.initialize();
    const index = this.jobs.findIndex(j => j.job_id === jobId);
    if (index !== -1) {
      this.jobs[index] = { ...this.jobs[index], ...updates };
    }
  }

  clear(): void {
    this.jobs = [];
    this.initialized = false;
  }
}

export const mockDataStore = new MockDataStore();
