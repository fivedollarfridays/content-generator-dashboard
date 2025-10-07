/**
 * Campaign Management Types
 * Type definitions for multi-channel campaign planning and execution
 */

import type { Channel, ContentType, JobStatus } from './content-generator';

// ========== Content Sources ==========

export type ContentSourceType =
  | 'google_doc'
  | 'notion'
  | 'text'
  | 'template'
  | 'file_upload';

export interface ContentSource {
  id: string;
  type: ContentSourceType;
  name: string;
  url?: string; // For google_doc, notion
  content?: string; // For text
  templateId?: string; // For template
  fileData?: {
    filename: string;
    size: number;
    uploadedAt: string;
  }; // For file_upload
  priority: number; // Lower number = higher priority
  metadata?: Record<string, any>;
}

// ========== Campaign Goals ==========

export type KPIMetric = 'reach' | 'engagement' | 'conversions' | 'clicks' | 'opens';

export interface CampaignKPI {
  metric: KPIMetric;
  target: number;
  current?: number;
  unit: string; // e.g., "users", "emails", "%"
}

export interface CampaignGoal {
  id: string;
  description: string;
  targetDate: string;
  channels: Channel[];
  kpis: CampaignKPI[];
  status: 'pending' | 'in_progress' | 'achieved' | 'missed';
  completedAt?: string;
  notes?: string;
}

// ========== Batch Scheduling ==========

export type RecurrencePattern = 'daily' | 'weekly' | 'monthly';

export interface RecurrenceConfig {
  pattern: RecurrencePattern;
  interval: number; // e.g., every 2 weeks
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, etc. (for weekly)
  dayOfMonth?: number; // For monthly (1-31)
  endDate?: string; // When to stop recurring
  endAfterOccurrences?: number; // Alternative to endDate
}

export interface BatchSchedule {
  id: string;
  name: string;
  description?: string;
  scheduledDate: string;
  channels: Channel[];
  contentType: ContentType;
  contentSources: string[]; // IDs of content sources to use
  recurrence?: RecurrenceConfig;
  status: 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled';
  jobs: string[]; // Associated job IDs
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: string;
}

// ========== Campaign Metrics ==========

export interface CampaignMetrics {
  totalBatches: number;
  completedBatches: number;
  failedBatches: number;
  successRate: number;
  goalsAchieved: number;
  totalGoals: number;
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  channelBreakdown: {
    channel: Channel;
    jobs: number;
    successRate: number;
  }[];
  lastUpdated: string;
}

// ========== Campaign Status ==========

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

// ========== Main Campaign Interface ==========

export interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: CampaignStatus;

  // Content
  sources: ContentSource[];

  // Planning
  goals: CampaignGoal[];
  batches: BatchSchedule[];

  // Tracking
  metrics?: CampaignMetrics;
  tags?: string[];

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastModifiedBy?: string;
}

// ========== Campaign List Response ==========

export interface CampaignsListResponse {
  campaigns: Campaign[];
  total: number;
  page: number;
  pageSize: number;
}

// ========== File Upload Configuration ==========

export interface FileUploadConfig {
  maxFileSize: number; // in bytes
  maxTotalSize: number; // total memory limit for all files
  allowedTypes: string[]; // MIME types
  maxFiles: number;
}

export const DEFAULT_UPLOAD_CONFIG: FileUploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB per file
  maxTotalSize: 50 * 1024 * 1024, // 50MB total
  allowedTypes: [
    'text/plain',
    'text/markdown',
    'application/pdf',
    'application/vnd.google-apps.document',
    'application/json',
  ],
  maxFiles: 10,
};

// ========== Calendar View Types ==========

export interface CalendarEvent {
  id: string;
  batchId: string;
  campaignId: string;
  campaignName: string;
  title: string;
  date: string;
  channels: Channel[];
  status: BatchSchedule['status'];
  jobs: string[];
}

export interface CalendarDay {
  date: string;
  events: CalendarEvent[];
  isToday: boolean;
  isWeekend: boolean;
  isOutsideMonth: boolean;
}

// ========== Matrix View Types ==========

export interface MatrixCell {
  campaignId: string;
  channel: Channel;
  weekNumber: number;
  batches: BatchSchedule[];
  totalJobs: number;
  successRate: number;
}

export interface MatrixRow {
  channel: Channel;
  cells: MatrixCell[];
}

// ========== Component Props ==========

export interface CampaignListProps {
  campaigns: Campaign[];
  onCampaignClick?: (campaign: Campaign) => void;
  onCreateCampaign?: () => void;
  onEditCampaign?: (campaign: Campaign) => void;
  onDeleteCampaign?: (campaignId: string) => void;
}

export interface CampaignBuilderProps {
  campaign?: Campaign; // For editing
  onSave: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export interface CalendarViewProps {
  campaigns: Campaign[];
  selectedMonth: Date;
  onMonthChange: (month: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: string) => void;
}

export interface MatrixViewProps {
  campaign: Campaign;
  weekCount: number;
  onCellClick?: (cell: MatrixCell) => void;
}

export interface BatchPlannerProps {
  campaign: Campaign;
  onBatchCreate: (batch: Omit<BatchSchedule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onBatchUpdate: (batchId: string, updates: Partial<BatchSchedule>) => void;
  onBatchDelete: (batchId: string) => void;
}

export interface CampaignAnalyticsProps {
  campaign: Campaign;
  dateRange?: {
    start: string;
    end: string;
  };
}
