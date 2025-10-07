/**
 * Mock Campaign Data Generator
 * Generates realistic campaign data for development and demonstration
 */

import type {
  Campaign,
  ContentSource,
  CampaignGoal,
  BatchSchedule,
  CampaignMetrics,
  CalendarEvent,
} from '@/types/campaigns';
import type { Channel } from '@/types/content-generator';

/**
 * Generate mock content sources
 */
export function generateMockContentSources(): ContentSource[] {
  return [
    {
      id: 'src-1',
      type: 'google_doc',
      name: 'Q1 Product Launch Brief',
      url: 'https://docs.google.com/document/d/abc123',
      priority: 1,
      metadata: { lastUpdated: '2025-01-15T10:00:00Z' },
    },
    {
      id: 'src-2',
      type: 'notion',
      name: 'Marketing Messages Database',
      url: 'https://notion.so/workspace/marketing-db',
      priority: 2,
      metadata: { pages: 15 },
    },
    {
      id: 'src-3',
      type: 'text',
      name: 'Key Talking Points',
      content: `- Revolutionary AI-powered features
- 50% faster than competitors
- Enterprise-ready security
- Seamless integrations`,
      priority: 3,
    },
    {
      id: 'src-4',
      type: 'file_upload',
      name: 'Customer Testimonials',
      fileData: {
        filename: 'testimonials.pdf',
        size: 2457600, // 2.4MB
        uploadedAt: '2025-01-10T14:30:00Z',
      },
      priority: 4,
    },
  ];
}

/**
 * Generate mock campaign goals
 */
export function generateMockGoals(): CampaignGoal[] {
  return [
    {
      id: 'goal-1',
      description: 'Launch announcement - reach 50,000 users',
      targetDate: '2025-01-15T00:00:00Z',
      channels: ['email', 'social_twitter', 'social_linkedin'],
      kpis: [
        { metric: 'reach', target: 50000, current: 48500, unit: 'users' },
        { metric: 'engagement', target: 15, current: 18.2, unit: '%' },
      ],
      status: 'achieved',
      completedAt: '2025-01-15T16:00:00Z',
    },
    {
      id: 'goal-2',
      description: 'Feature deep-dives - drive 1,000 demo requests',
      targetDate: '2025-02-01T00:00:00Z',
      channels: ['website', 'email'],
      kpis: [
        { metric: 'conversions', target: 1000, current: 750, unit: 'requests' },
        { metric: 'clicks', target: 5000, current: 4200, unit: 'clicks' },
      ],
      status: 'in_progress',
    },
    {
      id: 'goal-3',
      description: 'Maintain social engagement throughout Q1',
      targetDate: '2025-03-31T00:00:00Z',
      channels: ['social_twitter', 'social_linkedin', 'social_facebook'],
      kpis: [
        { metric: 'engagement', target: 20, current: 16.5, unit: '%' },
        { metric: 'reach', target: 100000, current: 65000, unit: 'users' },
      ],
      status: 'in_progress',
    },
  ];
}

/**
 * Generate mock batch schedules
 */
export function generateMockBatches(): BatchSchedule[] {
  return [
    {
      id: 'batch-1',
      name: 'Launch Day - Email Blast',
      description: 'Initial product launch announcement to all subscribers',
      scheduledDate: '2025-01-15T09:00:00Z',
      channels: ['email'],
      contentType: 'announcement',
      contentSources: ['src-1', 'src-3'],
      status: 'completed',
      jobs: ['job-launch-email-1', 'job-launch-email-2'],
      createdAt: '2025-01-10T12:00:00Z',
      updatedAt: '2025-01-15T09:30:00Z',
      completedAt: '2025-01-15T09:25:00Z',
    },
    {
      id: 'batch-2',
      name: 'Social Media - Launch Posts',
      description: 'Coordinated social media posts across all platforms',
      scheduledDate: '2025-01-15T10:00:00Z',
      channels: ['social_twitter', 'social_linkedin', 'social_facebook'],
      contentType: 'announcement',
      contentSources: ['src-1', 'src-3'],
      recurrence: {
        pattern: 'weekly',
        interval: 1,
        daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
        endDate: '2025-03-31T00:00:00Z',
      },
      status: 'running',
      jobs: ['job-social-1', 'job-social-2', 'job-social-3'],
      createdAt: '2025-01-10T12:00:00Z',
      updatedAt: '2025-01-22T10:00:00Z',
    },
    {
      id: 'batch-3',
      name: 'Weekly Feature Highlights',
      description: 'Deep-dive blog posts on key features',
      scheduledDate: '2025-01-22T14:00:00Z',
      channels: ['website'],
      contentType: 'blog',
      contentSources: ['src-2', 'src-4'],
      recurrence: {
        pattern: 'weekly',
        interval: 1,
        daysOfWeek: [2], // Tuesday
        endAfterOccurrences: 8,
      },
      status: 'scheduled',
      jobs: [],
      createdAt: '2025-01-12T10:00:00Z',
      updatedAt: '2025-01-12T10:00:00Z',
    },
    {
      id: 'batch-4',
      name: 'Monthly Newsletter',
      description: 'Comprehensive monthly update newsletter',
      scheduledDate: '2025-02-01T08:00:00Z',
      channels: ['email'],
      contentType: 'update',
      contentSources: ['src-1', 'src-2', 'src-3', 'src-4'],
      recurrence: {
        pattern: 'monthly',
        interval: 1,
        dayOfMonth: 1,
        endDate: '2025-12-31T00:00:00Z',
      },
      status: 'scheduled',
      jobs: [],
      createdAt: '2025-01-15T16:00:00Z',
      updatedAt: '2025-01-15T16:00:00Z',
    },
  ];
}

/**
 * Generate mock campaign metrics
 */
export function generateMockMetrics(batches: BatchSchedule[]): CampaignMetrics {
  const completed = batches.filter(b => b.status === 'completed').length;
  const failed = batches.filter(b => b.status === 'failed').length;
  const totalJobs = batches.reduce((sum, b) => sum + b.jobs.length, 0);

  return {
    totalBatches: batches.length,
    completedBatches: completed,
    failedBatches: failed,
    successRate: batches.length > 0 ? (completed / batches.length) * 100 : 0,
    goalsAchieved: 1,
    totalGoals: 3,
    totalJobs: totalJobs,
    successfulJobs: Math.floor(totalJobs * 0.85),
    failedJobs: Math.floor(totalJobs * 0.15),
    channelBreakdown: [
      { channel: 'email', jobs: 15, successRate: 92 },
      { channel: 'website', jobs: 8, successRate: 100 },
      { channel: 'social_twitter', jobs: 12, successRate: 78 },
      { channel: 'social_linkedin', jobs: 10, successRate: 85 },
      { channel: 'social_facebook', jobs: 8, successRate: 80 },
    ],
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Generate complete mock campaigns
 */
export function generateMockCampaigns(): Campaign[] {
  // Campaign 1: Q1 Product Launch (Active)
  const sources1 = generateMockContentSources();
  const goals1 = generateMockGoals();
  const batches1 = generateMockBatches();
  const metrics1 = generateMockMetrics(batches1);

  const campaign1: Campaign = {
    id: 'camp-1',
    name: 'Q1 Product Launch',
    description:
      'Comprehensive multi-channel campaign for new AI features launch. Targets 50K users across email, social, and web.',
    startDate: '2025-01-15T00:00:00Z',
    endDate: '2025-03-31T23:59:59Z',
    status: 'active',
    sources: sources1,
    goals: goals1,
    batches: batches1,
    metrics: metrics1,
    tags: ['product-launch', 'q1-2025', 'high-priority'],
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-22T14:30:00Z',
    createdBy: 'user@example.com',
  };

  // Campaign 2: Customer Success Stories (Paused)
  const campaign2: Campaign = {
    id: 'camp-2',
    name: 'Customer Success Stories',
    description:
      'Monthly series highlighting customer achievements and use cases. Currently paused for content refresh.',
    startDate: '2024-12-01T00:00:00Z',
    endDate: '2025-06-30T23:59:59Z',
    status: 'paused',
    sources: [
      {
        id: 'src-cs-1',
        type: 'notion',
        name: 'Customer Case Studies Database',
        url: 'https://notion.so/workspace/case-studies',
        priority: 1,
      },
      {
        id: 'src-cs-2',
        type: 'file_upload',
        name: 'Customer Interviews',
        fileData: {
          filename: 'interviews-collection.pdf',
          size: 5242880,
          uploadedAt: '2024-12-01T10:00:00Z',
        },
        priority: 2,
      },
    ],
    goals: [
      {
        id: 'goal-cs-1',
        description: 'Publish 6 customer success stories',
        targetDate: '2025-06-30T00:00:00Z',
        channels: ['website', 'email'],
        kpis: [
          { metric: 'conversions', target: 500, current: 180, unit: 'leads' },
        ],
        status: 'in_progress',
      },
    ],
    batches: [
      {
        id: 'batch-cs-1',
        name: 'Monthly Success Story - Website',
        scheduledDate: '2025-01-01T10:00:00Z',
        channels: ['website'],
        contentType: 'blog',
        contentSources: ['src-cs-1', 'src-cs-2'],
        recurrence: {
          pattern: 'monthly',
          interval: 1,
          dayOfMonth: 1,
          endAfterOccurrences: 6,
        },
        status: 'scheduled',
        jobs: [],
        createdAt: '2024-12-01T10:00:00Z',
        updatedAt: '2025-01-05T12:00:00Z',
      },
    ],
    metrics: {
      totalBatches: 1,
      completedBatches: 0,
      failedBatches: 0,
      successRate: 0,
      goalsAchieved: 0,
      totalGoals: 1,
      totalJobs: 3,
      successfulJobs: 3,
      failedJobs: 0,
      channelBreakdown: [
        { channel: 'website', jobs: 2, successRate: 100 },
        { channel: 'email', jobs: 1, successRate: 100 },
      ],
      lastUpdated: new Date().toISOString(),
    },
    tags: ['customer-success', 'ongoing'],
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2025-01-05T12:00:00Z',
  };

  // Campaign 3: Holiday Promotion (Completed)
  const campaign3: Campaign = {
    id: 'camp-3',
    name: 'Holiday Season Promotion',
    description:
      'Year-end promotion campaign with special offers. Successfully completed with 95% success rate.',
    startDate: '2024-12-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    status: 'completed',
    sources: [
      {
        id: 'src-hol-1',
        type: 'text',
        name: 'Holiday Messaging',
        content: 'Special year-end offers and holiday greetings',
        priority: 1,
      },
    ],
    goals: [
      {
        id: 'goal-hol-1',
        description: 'Drive 500 conversions during holiday period',
        targetDate: '2024-12-31T23:59:59Z',
        channels: ['email', 'social_twitter', 'social_linkedin'],
        kpis: [
          { metric: 'conversions', target: 500, current: 578, unit: 'sales' },
          { metric: 'engagement', target: 10, current: 12.5, unit: '%' },
        ],
        status: 'achieved',
        completedAt: '2024-12-28T18:00:00Z',
      },
    ],
    batches: [
      {
        id: 'batch-hol-1',
        name: 'Holiday Email Series',
        scheduledDate: '2024-12-15T10:00:00Z',
        channels: ['email'],
        contentType: 'announcement',
        contentSources: ['src-hol-1'],
        status: 'completed',
        jobs: ['job-hol-1', 'job-hol-2', 'job-hol-3'],
        createdAt: '2024-12-01T10:00:00Z',
        updatedAt: '2024-12-16T10:00:00Z',
        completedAt: '2024-12-15T11:30:00Z',
      },
    ],
    metrics: {
      totalBatches: 5,
      completedBatches: 5,
      failedBatches: 0,
      successRate: 100,
      goalsAchieved: 1,
      totalGoals: 1,
      totalJobs: 15,
      successfulJobs: 14,
      failedJobs: 1,
      channelBreakdown: [
        { channel: 'email', jobs: 8, successRate: 100 },
        { channel: 'social_twitter', jobs: 4, successRate: 100 },
        { channel: 'social_linkedin', jobs: 3, successRate: 66.7 },
      ],
      lastUpdated: '2024-12-31T23:59:59Z',
    },
    tags: ['seasonal', 'promotion', 'completed'],
    createdAt: '2024-11-15T10:00:00Z',
    updatedAt: '2024-12-31T23:59:59Z',
  };

  return [campaign1, campaign2, campaign3];
}

/**
 * Generate calendar events from campaigns
 */
export function generateCalendarEvents(campaigns: Campaign[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  campaigns.forEach(campaign => {
    campaign.batches.forEach(batch => {
      events.push({
        id: `event-${batch.id}`,
        batchId: batch.id,
        campaignId: campaign.id,
        campaignName: campaign.name,
        title: batch.name,
        date: batch.scheduledDate,
        channels: batch.channels,
        status: batch.status,
        jobs: batch.jobs,
      });
    });
  });

  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
