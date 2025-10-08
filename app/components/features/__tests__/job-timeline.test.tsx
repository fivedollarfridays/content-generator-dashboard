/**
 * JobTimeline Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { JobTimeline } from '../job-timeline';
import type { SyncJob } from '@/types/content-generator';

// Mock date-fns functions
jest.mock('date-fns', () => ({
  isToday: jest.fn((date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }),
  isYesterday: jest.fn((date: Date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  }),
  isThisWeek: jest.fn((date: Date) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date > weekAgo && !jest.requireActual('date-fns').isToday(date) && !jest.requireActual('date-fns').isYesterday(date);
  }),
  isThisMonth: jest.fn((date: Date) => {
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }),
  format: jest.fn((date: Date, formatStr: string) => 'January 2025'),
}));

// Mock job-analytics
jest.mock('@/lib/utils/job-analytics', () => ({
  formatTimeAgo: jest.fn((dateStr: string) => '2 hours ago'),
}));

const createMockJob = (overrides?: Partial<SyncJob>): SyncJob => ({
  job_id: 'job-123',
  document_id: 'doc-456',
  status: 'completed',
  channels: ['email'],
  content_type: 'update',
  template_style: 'modern',
  created_at: new Date().toISOString(),
  ...overrides,
});

describe('JobTimeline', () => {
  const mockOnPageChange = jest.fn();
  const mockOnJobClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Empty State', () => {
    it('should render empty state when no jobs', () => {
      render(
        <JobTimeline
          jobs={[]}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('No job history')).toBeInTheDocument();
      expect(screen.getByText(/Jobs will appear here once you start generating content/)).toBeInTheDocument();
    });

    it('should render empty state icon', () => {
      render(
        <JobTimeline
          jobs={[]}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      const svg = screen.getByText('No job history').previousElementSibling;
      expect(svg).toHaveClass('text-gray-400');
    });
  });

  describe('Job Rendering', () => {
    it('should render single job', () => {
      const job = createMockJob();

      render(
        <JobTimeline
          jobs={[job]}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
      expect(screen.getByText('doc-456')).toBeInTheDocument();
      expect(screen.getByText('email')).toBeInTheDocument();
    });

    it('should render multiple jobs', () => {
      const jobs = [
        createMockJob({ job_id: 'job-1', document_id: 'doc-1' }),
        createMockJob({ job_id: 'job-2', document_id: 'doc-2' }),
      ];

      render(
        <JobTimeline
          jobs={jobs}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('doc-1')).toBeInTheDocument();
      expect(screen.getByText('doc-2')).toBeInTheDocument();
    });

    it('should display time ago', () => {
      const job = createMockJob();

      render(
        <JobTimeline
          jobs={[job]}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    });

    it('should display truncated job ID', () => {
      const job = createMockJob({ job_id: 'very-long-job-id-12345' });

      render(
        <JobTimeline
          jobs={[job]}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText(/very-lon.../)).toBeInTheDocument();
    });
  });

  describe('Status Indicators', () => {
    it('should render completed status with green styling', () => {
      const job = createMockJob({ status: 'completed' });

      render(
        <JobTimeline
          jobs={[job]}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
      const statusIcon = screen.getByText('✓');
      expect(statusIcon).toHaveClass('text-green-600');
    });

    it('should render failed status with red styling', () => {
      const job = createMockJob({ status: 'failed' });

      render(
        <JobTimeline
          jobs={[job]}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('FAILED')).toBeInTheDocument();
      const statusIcon = screen.getByText('✕');
      expect(statusIcon).toHaveClass('text-red-600');
    });

    it('should render in_progress status with blue styling', () => {
      const job = createMockJob({ status: 'in_progress' });

      render(
        <JobTimeline
          jobs={[job]}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
      const statusIcon = screen.getByText('⟳');
      expect(statusIcon).toHaveClass('text-blue-600');
    });

    it('should render pending status with yellow styling', () => {
      const job = createMockJob({ status: 'pending' });

      render(
        <JobTimeline
          jobs={[job]}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('PENDING')).toBeInTheDocument();
      const statusIcon = screen.getByText('⏱');
      expect(statusIcon).toHaveClass('text-yellow-600');
    });

    it('should render partial status with orange styling', () => {
      const job = createMockJob({ status: 'partial' });

      render(
        <JobTimeline
          jobs={[job]}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('PARTIAL')).toBeInTheDocument();
      const statusIcon = screen.getByText('⚠');
      expect(statusIcon).toHaveClass('text-orange-600');
    });

    it('should render cancelled status with gray styling', () => {
      const job = createMockJob({ status: 'cancelled' });

      render(
        <JobTimeline
          jobs={[job]}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('CANCELLED')).toBeInTheDocument();
      const statusIcon = screen.getByText('⊘');
      expect(statusIcon).toHaveClass('text-gray-600');
    });
  });

  describe('Date Grouping', () => {
    it('should group jobs by date', () => {
      const today = new Date();
      const jobs = [
        createMockJob({ created_at: today.toISOString() }),
      ];

      render(
        <JobTimeline
          jobs={jobs}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('should show date group header', () => {
      const job = createMockJob();

      render(
        <JobTimeline
          jobs={[job]}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      const header = screen.getByText('Today').closest('span');
      expect(header).toHaveClass('bg-gray-100');
    });
  });

  describe('Channels and Results', () => {
    it('should display multiple channels', () => {
      const job = createMockJob({ channels: ['email', 'social', 'blog'] });

      render(
        <JobTimeline
          jobs={[job]}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('email, social, blog')).toBeInTheDocument();
    });

    it('should display channel results with success indicators', () => {
      const job = createMockJob({
        results: {
          email: { status: 'success' as const, content: '' },
          social: { status: 'success' as const, content: '' },
        },
      });

      const { container } = render(
        <JobTimeline
          jobs={[job]}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      // Check for channel result indicators (small rounded circles)
      const resultIndicators = container.querySelectorAll('.w-6.h-6.rounded-full');
      expect(resultIndicators.length).toBe(2);
    });

    it('should display channel results with failure indicators', () => {
      const job = createMockJob({
        results: {
          email: { status: 'failed' as const, content: '', error: 'Error' },
        },
      });

      const { container } = render(
        <JobTimeline
          jobs={[job]}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      // Check for channel result indicators (small rounded circles)
      const resultIndicators = container.querySelectorAll('.w-6.h-6.rounded-full.bg-red-100');
      expect(resultIndicators.length).toBe(1);
    });
  });

  describe('Error Display', () => {
    it('should display error message for failed jobs', () => {
      const job = createMockJob({
        status: 'failed',
        errors: ['API timeout error'],
      });

      render(
        <JobTimeline
          jobs={[job]}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('Error: API timeout error')).toBeInTheDocument();
    });

    it('should not display errors section when no errors', () => {
      const job = createMockJob({ errors: [] });

      render(
        <JobTimeline
          jobs={[job]}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
    });
  });

  describe('Job Click Handler', () => {
    it('should call onJobClick when job is clicked', () => {
      const job = createMockJob();

      render(
        <JobTimeline
          jobs={[job]}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
          onJobClick={mockOnJobClick}
        />
      );

      const jobCard = screen.getByText('COMPLETED').closest('div[class*="cursor-pointer"]');
      if (jobCard) {
        fireEvent.click(jobCard);
        expect(mockOnJobClick).toHaveBeenCalledWith(job);
      }
    });

    it('should not add cursor pointer when onJobClick not provided', () => {
      const job = createMockJob();

      render(
        <JobTimeline
          jobs={[job]}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      const jobCard = screen.getByText('COMPLETED').closest('div');
      expect(jobCard?.className).not.toContain('cursor-pointer');
    });
  });

  describe('Pagination', () => {
    it('should not show pagination for single page', () => {
      const jobs = [createMockJob()];

      render(
        <JobTimeline
          jobs={jobs}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.queryByText('Previous')).not.toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });

    it('should show pagination for multiple pages', () => {
      const jobs = Array.from({ length: 25 }, (_, i) =>
        createMockJob({ job_id: `job-${i}` })
      );

      render(
        <JobTimeline
          jobs={jobs}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('Showing 1 to 10 of 25 jobs')).toBeInTheDocument();
    });

    it('should disable Previous button on first page', () => {
      const jobs = Array.from({ length: 25 }, (_, i) =>
        createMockJob({ job_id: `job-${i}` })
      );

      render(
        <JobTimeline
          jobs={jobs}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      const prevButton = screen.getByText('Previous');
      expect(prevButton).toBeDisabled();
    });

    it('should disable Next button on last page', () => {
      const jobs = Array.from({ length: 25 }, (_, i) =>
        createMockJob({ job_id: `job-${i}` })
      );

      render(
        <JobTimeline
          jobs={jobs}
          currentPage={3}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeDisabled();
    });

    it('should call onPageChange when Previous clicked', () => {
      const jobs = Array.from({ length: 25 }, (_, i) =>
        createMockJob({ job_id: `job-${i}` })
      );

      render(
        <JobTimeline
          jobs={jobs}
          currentPage={2}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      fireEvent.click(screen.getByText('Previous'));
      expect(mockOnPageChange).toHaveBeenCalledWith(1);
    });

    it('should call onPageChange when Next clicked', () => {
      const jobs = Array.from({ length: 25 }, (_, i) =>
        createMockJob({ job_id: `job-${i}` })
      );

      render(
        <JobTimeline
          jobs={jobs}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      fireEvent.click(screen.getByText('Next'));
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('should highlight current page', () => {
      const jobs = Array.from({ length: 25 }, (_, i) =>
        createMockJob({ job_id: `job-${i}` })
      );

      render(
        <JobTimeline
          jobs={jobs}
          currentPage={2}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      const page2Button = screen.getByText('2');
      expect(page2Button).toHaveClass('bg-blue-600');
    });

    it('should render page number buttons', () => {
      const jobs = Array.from({ length: 25 }, (_, i) =>
        createMockJob({ job_id: `job-${i}` })
      );

      render(
        <JobTimeline
          jobs={jobs}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should call onPageChange when page number clicked', () => {
      const jobs = Array.from({ length: 25 }, (_, i) =>
        createMockJob({ job_id: `job-${i}` })
      );

      render(
        <JobTimeline
          jobs={jobs}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      fireEvent.click(screen.getByText('2'));
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });
  });

  describe('Job Sorting', () => {
    it('should sort jobs by date within groups', () => {
      const older = new Date();
      older.setHours(older.getHours() - 2);
      const newer = new Date();

      const jobs = [
        createMockJob({ job_id: 'older', created_at: older.toISOString() }),
        createMockJob({ job_id: 'newer', created_at: newer.toISOString() }),
      ];

      const { container } = render(
        <JobTimeline
          jobs={jobs}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      const jobCards = container.querySelectorAll('.font-mono');
      const firstJobId = jobCards[0].textContent;

      // Newer job should appear first
      expect(firstJobId).toContain('newer');
    });
  });

  describe('Edge Cases', () => {
    it('should handle job with no channels', () => {
      const job = createMockJob({ channels: [] });

      render(
        <JobTimeline
          jobs={[job]}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    });

    it('should handle job with no results', () => {
      const job = createMockJob({ results: undefined });

      render(
        <JobTimeline
          jobs={[job]}
          currentPage={1}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    });

    it('should paginate correctly on page boundary', () => {
      const jobs = Array.from({ length: 20 }, (_, i) =>
        createMockJob({ job_id: `job-${i}` })
      );

      render(
        <JobTimeline
          jobs={jobs}
          currentPage={2}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('Showing 11 to 20 of 20 jobs')).toBeInTheDocument();
    });
  });
});
