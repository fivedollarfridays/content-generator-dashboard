/**
 * TimelineView Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TimelineView } from '../timeline-view';
import type { SyncJob, JobStatus } from '@/types/content-generator';

describe('TimelineView', () => {
  const mockJobs: SyncJob[] = [
    {
      job_id: 'job-1',
      document_id: 'doc-1',
      channels: ['email', 'social_media_post'],
      status: 'completed',
      created_at: '2025-10-07T10:00:00Z',
      started_at: '2025-10-07T10:01:00Z',
      completed_at: '2025-10-07T10:05:00Z',
      updated_at: '2025-10-07T10:05:00Z',
      errors: [],
      results: {},
      metadata: {},
    },
    {
      job_id: 'job-2',
      document_id: 'doc-2',
      channels: ['blog_post'],
      status: 'failed',
      created_at: '2025-10-07T09:00:00Z',
      started_at: '2025-10-07T09:01:00Z',
      updated_at: '2025-10-07T09:02:00Z',
      errors: ['API connection failed'],
      results: {},
      metadata: {},
    },
    {
      job_id: 'job-3',
      document_id: 'doc-3',
      channels: ['video_script'],
      status: 'in_progress',
      created_at: '2025-10-06T15:00:00Z',
      started_at: '2025-10-06T15:01:00Z',
      updated_at: '2025-10-06T15:02:00Z',
      errors: [],
      results: {},
      metadata: {},
    },
  ];

  const mockOnJobClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== Rendering Tests ==========

  describe('Rendering', () => {
    it('should render jobs in timeline format', () => {
      render(<TimelineView jobs={mockJobs} />);

      expect(screen.getByText(/job-1/i)).toBeInTheDocument();
      expect(screen.getByText(/job-2/i)).toBeInTheDocument();
      expect(screen.getByText(/job-3/i)).toBeInTheDocument();
    });

    it('should render date headers for grouped jobs', () => {
      render(<TimelineView jobs={mockJobs} />);

      // Should have date headers (at least one)
      expect(screen.getByText(/October 7, 2025/i)).toBeInTheDocument();
      expect(screen.getByText(/October 6, 2025/i)).toBeInTheDocument();
    });

    it('should display job IDs (truncated)', () => {
      render(<TimelineView jobs={mockJobs} />);

      // Job IDs should be truncated to first 8 characters
      expect(screen.getByText(/Job job-1.../i)).toBeInTheDocument();
    });

    it('should display document IDs', () => {
      render(<TimelineView jobs={mockJobs} />);

      expect(screen.getByText(/doc-1/i)).toBeInTheDocument();
      expect(screen.getByText(/doc-2/i)).toBeInTheDocument();
    });

    it('should display channels for each job', () => {
      render(<TimelineView jobs={mockJobs} />);

      expect(screen.getByText(/email, social_media_post/i)).toBeInTheDocument();
      expect(screen.getByText(/blog_post/i)).toBeInTheDocument();
    });
  });

  // ========== Status Indicator Tests ==========

  describe('Status Indicators', () => {
    it('should display correct status badge for completed job', () => {
      render(<TimelineView jobs={mockJobs} />);

      const completedBadges = screen.getAllByText(/completed/i);
      expect(completedBadges.length).toBeGreaterThan(0);
    });

    it('should display correct status badge for failed job', () => {
      render(<TimelineView jobs={mockJobs} />);

      const failedElements = screen.getAllByText(/^failed$/i);
      expect(failedElements.length).toBeGreaterThan(0);
    });

    it('should display correct status badge for in_progress job', () => {
      render(<TimelineView jobs={mockJobs} />);

      const inProgressElements = screen.getAllByText(/in progress/i);
      expect(inProgressElements.length).toBeGreaterThan(0);
    });

    it('should apply correct color for completed status', () => {
      const { container } = render(<TimelineView jobs={mockJobs} />);

      const completedIndicators = container.querySelectorAll('.bg-green-500');
      expect(completedIndicators.length).toBeGreaterThan(0);
    });

    it('should apply correct color for failed status', () => {
      const { container } = render(<TimelineView jobs={mockJobs} />);

      const failedIndicators = container.querySelectorAll('.bg-red-500');
      expect(failedIndicators.length).toBeGreaterThan(0);
    });

    it('should apply correct color for in_progress status', () => {
      const { container } = render(<TimelineView jobs={mockJobs} />);

      const inProgressIndicators = container.querySelectorAll('.bg-blue-500');
      expect(inProgressIndicators.length).toBeGreaterThan(0);
    });

    it('should handle pending status', () => {
      const pendingJob: SyncJob = {
        ...mockJobs[0],
        job_id: 'job-pending',
        status: 'pending',
      };

      const { container } = render(<TimelineView jobs={[pendingJob]} />);

      expect(screen.getByText(/pending/i)).toBeInTheDocument();
      const pendingIndicators = container.querySelectorAll('.bg-yellow-500');
      expect(pendingIndicators.length).toBeGreaterThan(0);
    });

    it('should handle cancelled status', () => {
      const cancelledJob: SyncJob = {
        ...mockJobs[0],
        job_id: 'job-cancelled',
        status: 'cancelled',
      };

      const { container } = render(<TimelineView jobs={[cancelledJob]} />);

      expect(screen.getByText(/cancelled/i)).toBeInTheDocument();
      const cancelledIndicators = container.querySelectorAll('.bg-gray-500');
      expect(cancelledIndicators.length).toBeGreaterThan(0);
    });

    it('should handle partial status', () => {
      const partialJob: SyncJob = {
        ...mockJobs[0],
        job_id: 'job-partial',
        status: 'partial',
      };

      const { container } = render(<TimelineView jobs={[partialJob]} />);

      expect(screen.getByText(/partial/i)).toBeInTheDocument();
      const partialIndicators = container.querySelectorAll('.bg-orange-500');
      expect(partialIndicators.length).toBeGreaterThan(0);
    });
  });

  // ========== Date Formatting Tests ==========

  describe('Date Formatting', () => {
    it('should format dates with time', () => {
      render(<TimelineView jobs={mockJobs} />);

      // Should display formatted date with time (e.g., "Oct 7, 2025, 10:00 AM")
      const dateElements = screen.getAllByText(/Oct \d+, 2025, \d+:\d+ [AP]M/i);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it('should group jobs by date', () => {
      render(<TimelineView jobs={mockJobs} />);

      // Should have two date groups
      const oct7Elements = screen.getAllByText(/October 7, 2025/i);
      const oct6Elements = screen.getAllByText(/October 6, 2025/i);
      expect(oct7Elements.length).toBeGreaterThan(0);
      expect(oct6Elements.length).toBeGreaterThan(0);
    });

    it('should sort jobs within date groups (most recent first)', () => {
      const jobsSameDay: SyncJob[] = [
        {
          ...mockJobs[0],
          job_id: 'job-1111',
          created_at: '2025-10-07T08:00:00Z',
        },
        {
          ...mockJobs[0],
          job_id: 'job-2222',
          created_at: '2025-10-07T12:00:00Z',
        },
      ];

      render(<TimelineView jobs={jobsSameDay} />);

      // Job IDs are truncated to 8 chars with "...", so "job-1111" displays as "job-1111..."
      const jobLate = screen.getByText(/Job job-2222/);
      const jobEarly = screen.getByText(/Job job-1111/);

      // Check they both exist
      expect(jobLate).toBeInTheDocument();
      expect(jobEarly).toBeInTheDocument();

      // Later job (job-2222) should appear higher in DOM (comes first)
      const allJobElements = screen.getAllByText(/Job job-/);
      const lateIndex = Array.from(allJobElements).findIndex(el =>
        el.textContent?.includes('job-2222')
      );
      const earlyIndex = Array.from(allJobElements).findIndex(el =>
        el.textContent?.includes('job-1111')
      );
      expect(lateIndex).toBeLessThan(earlyIndex);
    });
  });

  // ========== Duration Formatting Tests ==========

  describe('Duration Formatting', () => {
    it('should display duration for completed jobs', () => {
      render(<TimelineView jobs={mockJobs} />);

      // Job-1: 4 minutes duration (10:01 to 10:05)
      const durationLabels = screen.getAllByText(/Duration:/i);
      expect(durationLabels.length).toBeGreaterThan(0);
      expect(screen.getByText(/4m/i)).toBeInTheDocument();
    });

    it('should display "In progress" for jobs without end time', () => {
      render(<TimelineView jobs={mockJobs} />);

      // Job-3 has no completed_at
      const inProgressElements = screen.getAllByText(/In progress/i);
      expect(inProgressElements.length).toBeGreaterThan(0);
    });

    it('should format seconds correctly', () => {
      const quickJob: SyncJob = {
        ...mockJobs[0],
        job_id: 'job-quick',
        started_at: '2025-10-07T10:00:00Z',
        completed_at: '2025-10-07T10:00:45Z', // 45 seconds
      };

      render(<TimelineView jobs={[quickJob]} />);

      expect(screen.getByText(/45s/i)).toBeInTheDocument();
    });

    it('should format hours and minutes correctly', () => {
      const longJob: SyncJob = {
        ...mockJobs[0],
        job_id: 'job-long',
        started_at: '2025-10-07T10:00:00Z',
        completed_at: '2025-10-07T12:30:00Z', // 2h 30m
      };

      render(<TimelineView jobs={[longJob]} />);

      expect(screen.getByText(/2h 30m/i)).toBeInTheDocument();
    });
  });

  // ========== Error Display Tests ==========

  describe('Error Display', () => {
    it('should display error message for failed jobs', () => {
      render(<TimelineView jobs={mockJobs} />);

      expect(screen.getByText(/API connection failed/i)).toBeInTheDocument();
    });

    it('should not display error section for successful jobs', () => {
      const successfulJob: SyncJob = {
        ...mockJobs[0],
        status: 'completed',
        errors: [],
      };

      render(<TimelineView jobs={[successfulJob]} />);

      // Should not have error text
      const errorElements = screen.queryByText(/Error:/i);
      expect(errorElements).not.toBeInTheDocument();
    });

    it('should display first error when multiple errors exist', () => {
      const multiErrorJob: SyncJob = {
        ...mockJobs[0],
        status: 'failed',
        errors: ['First error', 'Second error', 'Third error'],
      };

      render(<TimelineView jobs={[multiErrorJob]} />);

      expect(screen.getByText(/First error/i)).toBeInTheDocument();
      expect(screen.queryByText(/Second error/i)).not.toBeInTheDocument();
    });
  });

  // ========== Loading State Tests ==========

  describe('Loading State', () => {
    it('should display loading skeleton when loading is true', () => {
      const { container } = render(<TimelineView jobs={[]} loading={true} />);

      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBe(3);
    });

    it('should not show actual jobs when loading', () => {
      render(<TimelineView jobs={mockJobs} loading={true} />);

      expect(screen.queryByText(/job-1/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/job-2/i)).not.toBeInTheDocument();
    });

    it('should display jobs when loading is false', () => {
      render(<TimelineView jobs={mockJobs} loading={false} />);

      expect(screen.getByText(/job-1/i)).toBeInTheDocument();
      expect(screen.getByText(/job-2/i)).toBeInTheDocument();
    });
  });

  // ========== Empty State Tests ==========

  describe('Empty State', () => {
    it('should display empty state when no jobs', () => {
      render(<TimelineView jobs={[]} />);

      expect(screen.getByText(/No job history/i)).toBeInTheDocument();
      expect(
        screen.getByText(
          /Get started by creating your first content generation job/i
        )
      ).toBeInTheDocument();
    });

    it('should not display empty state when jobs exist', () => {
      render(<TimelineView jobs={mockJobs} />);

      expect(screen.queryByText(/No job history/i)).not.toBeInTheDocument();
    });

    it('should display icon in empty state', () => {
      const { container } = render(<TimelineView jobs={[]} />);

      const svgIcon = container.querySelector('svg');
      expect(svgIcon).toBeInTheDocument();
    });
  });

  // ========== Click Handler Tests ==========

  describe('Click Handlers', () => {
    it('should call onJobClick when job card is clicked', () => {
      render(<TimelineView jobs={mockJobs} onJobClick={mockOnJobClick} />);

      const jobCards = screen.getAllByText(/Job job-/i);
      fireEvent.click(jobCards[0].closest('.bg-white')!);

      expect(mockOnJobClick).toHaveBeenCalledTimes(1);
      expect(mockOnJobClick).toHaveBeenCalledWith(
        expect.objectContaining({
          job_id: expect.any(String),
        })
      );
    });

    it('should not add cursor-pointer class when onJobClick is not provided', () => {
      const { container } = render(<TimelineView jobs={mockJobs} />);

      const jobCard = container.querySelector('.cursor-pointer');
      expect(jobCard).not.toBeInTheDocument();
    });

    it('should add cursor-pointer class when onJobClick is provided', () => {
      const { container } = render(
        <TimelineView jobs={mockJobs} onJobClick={mockOnJobClick} />
      );

      const jobCards = container.querySelectorAll('.cursor-pointer');
      expect(jobCards.length).toBeGreaterThan(0);
    });

    it('should not trigger click when onJobClick is undefined', () => {
      render(<TimelineView jobs={mockJobs} />);

      const jobCards = screen.getAllByText(/Job job-/i);
      const parentCard = jobCards[0].closest('.bg-white');

      // Should not throw error
      expect(() => {
        fireEvent.click(parentCard!);
      }).not.toThrow();
    });
  });

  // ========== Timeline UI Tests ==========

  describe('Timeline UI', () => {
    it('should render timeline connectors between jobs', () => {
      render(<TimelineView jobs={mockJobs} />);

      // Timeline should have connecting lines
      const { container } = render(<TimelineView jobs={mockJobs} />);
      const connectors = container.querySelectorAll('.bg-gray-300');
      expect(connectors.length).toBeGreaterThan(0);
    });

    it('should render status indicator dots', () => {
      const { container } = render(<TimelineView jobs={mockJobs} />);

      const statusDots = container.querySelectorAll('.rounded-full');
      expect(statusDots.length).toBeGreaterThan(0);
    });

    it('should have proper spacing between timeline items', () => {
      const { container } = render(<TimelineView jobs={mockJobs} />);

      const timelineContainer = container.querySelector('.space-y-6');
      expect(timelineContainer).toBeInTheDocument();
    });
  });

  // ========== Edge Cases ==========

  describe('Edge Cases', () => {
    it('should handle job with no started_at time', () => {
      const noStartJob: SyncJob = {
        ...mockJobs[0],
        started_at: undefined,
      };

      render(<TimelineView jobs={[noStartJob]} />);

      // Should not display duration section
      expect(screen.queryByText(/Duration:/i)).not.toBeInTheDocument();
    });

    it('should handle job with very long ID', () => {
      const longIdJob: SyncJob = {
        ...mockJobs[0],
        job_id: 'very-long-job-id-that-needs-truncation-12345678901234567890',
      };

      render(<TimelineView jobs={[longIdJob]} />);

      // Should truncate to first 8 characters
      expect(screen.getByText(/Job very-lon.../i)).toBeInTheDocument();
    });

    it('should handle job with empty channels array', () => {
      const noChannelsJob: SyncJob = {
        ...mockJobs[0],
        channels: [],
      };

      render(<TimelineView jobs={[noChannelsJob]} />);

      // Should still render without error
      expect(screen.getByText(/Channels:/i)).toBeInTheDocument();
    });

    it('should handle single job', () => {
      render(<TimelineView jobs={[mockJobs[0]]} />);

      expect(screen.getByText(/job-1/i)).toBeInTheDocument();
    });

    it('should handle many jobs on same day', () => {
      const manyJobs: SyncJob[] = Array(10)
        .fill(null)
        .map((_, i) => ({
          ...mockJobs[0],
          job_id: `job-${i}`,
          created_at: '2025-10-07T10:00:00Z',
        }));

      render(<TimelineView jobs={manyJobs} />);

      // Should render all jobs
      const jobElements = screen.getAllByText(/Job job-/i);
      expect(jobElements.length).toBe(10);
    });

    it('should handle jobs spanning multiple months', () => {
      const crossMonthJobs: SyncJob[] = [
        {
          ...mockJobs[0],
          job_id: 'job-sept',
          created_at: '2025-09-15T12:00:00Z',
        },
        {
          ...mockJobs[0],
          job_id: 'job-oct',
          created_at: '2025-10-15T12:00:00Z',
        },
      ];

      render(<TimelineView jobs={crossMonthJobs} />);

      // Verify both jobs are rendered (IDs truncated to 8 chars)
      expect(screen.getByText(/Job job-sept/)).toBeInTheDocument();
      expect(screen.getByText(/Job job-oct/)).toBeInTheDocument();

      // Should have date headers for both months (check for September and October)
      const dateHeaders = screen.getAllByRole('heading', { level: 3 });
      const dateTexts = dateHeaders.map(h => h.textContent);
      expect(dateTexts.some(text => text?.includes('September'))).toBe(true);
      expect(dateTexts.some(text => text?.includes('October'))).toBe(true);
    });
  });

  // ========== Status Badge Styling Tests ==========

  describe('Status Badge Styling', () => {
    it('should apply green styling to completed jobs', () => {
      const { container } = render(<TimelineView jobs={mockJobs} />);

      const completedBadge = container.querySelector(
        '.bg-green-100.text-green-800'
      );
      expect(completedBadge).toBeInTheDocument();
    });

    it('should apply red styling to failed jobs', () => {
      const { container } = render(<TimelineView jobs={mockJobs} />);

      const failedBadge = container.querySelector('.bg-red-100.text-red-800');
      expect(failedBadge).toBeInTheDocument();
    });

    it('should apply blue styling to in_progress jobs', () => {
      const { container } = render(<TimelineView jobs={mockJobs} />);

      const inProgressBadge = container.querySelector(
        '.bg-blue-100.text-blue-800'
      );
      expect(inProgressBadge).toBeInTheDocument();
    });

    it('should replace underscores in status display', () => {
      render(<TimelineView jobs={mockJobs} />);

      // "in_progress" should be displayed as "in progress"
      const inProgressElements = screen.getAllByText(/in progress/i);
      expect(inProgressElements.length).toBeGreaterThan(0);
    });
  });
});
