/**
 * AnalyticsMetrics Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AnalyticsMetrics } from '../analytics-metrics';
import type { SyncJob } from '@/types/content-generator';

// Mock job-analytics utilities
jest.mock('@/lib/utils/job-analytics', () => ({
  getTotalMetrics: jest.fn((jobs: SyncJob[]) => {
    const totalJobs = jobs.length;
    const successfulJobs = jobs.filter(j => j.status === 'completed').length;
    const failedJobs = jobs.filter(j => j.status === 'failed').length;
    const activeJobs = jobs.filter(
      j => j.status === 'pending' || j.status === 'in_progress'
    ).length;
    const successRate =
      totalJobs > 0 ? Math.round((successfulJobs / totalJobs) * 100) : 0;

    return {
      totalJobs,
      successfulJobs,
      failedJobs,
      activeJobs,
      successRate,
    };
  }),
  calculateSuccessRateByTimePeriod: jest.fn(() => ({
    last24Hours: 85,
    last7Days: 78,
    last30Days: 82,
  })),
}));

const createMockJob = (
  id: string,
  status: SyncJob['status'],
  createdAt?: string
): SyncJob => ({
  job_id: id,
  document_id: `doc-${id}`,
  status,
  channels: ['email'],
  created_at: createdAt || '2025-01-01T00:00:00Z',
  progress: { percent: status === 'completed' ? 100 : 50, message: 'Processing' },
});

describe('AnalyticsMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Primary Metrics Rendering', () => {
    it('should render all primary metric cards', () => {
      const jobs = [
        createMockJob('1', 'completed'),
        createMockJob('2', 'failed'),
        createMockJob('3', 'pending'),
      ];

      render(<AnalyticsMetrics jobs={jobs} />);

      expect(screen.getByText('Total Jobs')).toBeInTheDocument();
      expect(screen.getByText('Success Rate')).toBeInTheDocument();
      expect(screen.getByText('Successful')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should display correct total jobs count', () => {
      const jobs = [
        createMockJob('1', 'completed'),
        createMockJob('2', 'completed'),
        createMockJob('3', 'failed'),
      ];

      render(<AnalyticsMetrics jobs={jobs} />);

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should display correct success rate', () => {
      const jobs = [
        createMockJob('1', 'completed'),
        createMockJob('2', 'completed'),
        createMockJob('3', 'failed'),
      ];

      render(<AnalyticsMetrics jobs={jobs} />);

      // 2/3 = 67%
      expect(screen.getByText('67%')).toBeInTheDocument();
    });

    it('should display correct successful jobs count', () => {
      const jobs = [
        createMockJob('1', 'completed'),
        createMockJob('2', 'completed'),
        createMockJob('3', 'failed'),
      ];

      render(<AnalyticsMetrics jobs={jobs} />);

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should display correct failed jobs count', () => {
      const jobs = [
        createMockJob('1', 'completed'),
        createMockJob('2', 'failed'),
        createMockJob('3', 'failed'),
      ];

      render(<AnalyticsMetrics jobs={jobs} />);

      // Failed count appears in the card
      const failedCard = screen.getByText('Failed').closest('div');
      expect(failedCard).toHaveTextContent('2');
    });

    it('should display correct active jobs count', () => {
      const jobs = [
        createMockJob('1', 'pending'),
        createMockJob('2', 'in_progress'),
        createMockJob('3', 'completed'),
      ];

      render(<AnalyticsMetrics jobs={jobs} />);

      // Active count (pending + in_progress)
      const activeCard = screen.getByText('Active').closest('div');
      expect(activeCard).toHaveTextContent('2');
    });

    it('should show active jobs subtitle', () => {
      const jobs = [createMockJob('1', 'pending')];

      render(<AnalyticsMetrics jobs={jobs} />);

      expect(screen.getByText('In progress + Pending')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should handle empty jobs array', () => {
      render(<AnalyticsMetrics jobs={[]} />);

      expect(screen.getByText('Total Jobs')).toBeInTheDocument();
      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should not show subtitle when no jobs', () => {
      render(<AnalyticsMetrics jobs={[]} />);

      // Subtitles depend on totalJobs > 0
      expect(screen.queryByText(/% of total/)).not.toBeInTheDocument();
    });
  });

  describe('Subtitle Calculations', () => {
    it('should show successful jobs percentage subtitle', () => {
      const jobs = [
        createMockJob('1', 'completed'),
        createMockJob('2', 'completed'),
        createMockJob('3', 'failed'),
        createMockJob('4', 'pending'),
      ];

      render(<AnalyticsMetrics jobs={jobs} />);

      // 2 successful out of 4 total = 50%
      expect(screen.getByText('50% of total')).toBeInTheDocument();
    });

    it('should show failed jobs percentage subtitle', () => {
      const jobs = [
        createMockJob('1', 'failed'),
        createMockJob('2', 'completed'),
        createMockJob('3', 'completed'),
        createMockJob('4', 'completed'),
      ];

      render(<AnalyticsMetrics jobs={jobs} />);

      // 1 failed out of 4 total = 25%
      expect(screen.getByText('25% of total')).toBeInTheDocument();
    });
  });

  describe('Time Period Metrics', () => {
    it('should not show time period metrics by default', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(<AnalyticsMetrics jobs={jobs} />);

      expect(
        screen.queryByText('Success Rate by Time Period')
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Last 24 Hours')).not.toBeInTheDocument();
    });

    it('should show time period metrics when showTimePeriods is true', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(<AnalyticsMetrics jobs={jobs} showTimePeriods={true} />);

      expect(screen.getByText('Success Rate by Time Period')).toBeInTheDocument();
      expect(screen.getByText('Last 24 Hours')).toBeInTheDocument();
      expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
      expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
    });

    it('should display correct time period values', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(<AnalyticsMetrics jobs={jobs} showTimePeriods={true} />);

      // Values from mocked calculateSuccessRateByTimePeriod
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('78%')).toBeInTheDocument();
      expect(screen.getByText('82%')).toBeInTheDocument();
    });

    it('should not show time period section when showTimePeriods is false', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(<AnalyticsMetrics jobs={jobs} showTimePeriods={false} />);

      expect(
        screen.queryByText('Success Rate by Time Period')
      ).not.toBeInTheDocument();
    });
  });

  describe('Card Styling', () => {
    it('should apply hover shadow classes', () => {
      const jobs = [createMockJob('1', 'completed')];

      const { container } = render(<AnalyticsMetrics jobs={jobs} />);

      const cards = container.querySelectorAll('.hover\\:shadow-lg');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should render metric cards with proper structure', () => {
      const jobs = [createMockJob('1', 'completed')];

      const { container } = render(<AnalyticsMetrics jobs={jobs} />);

      const cards = container.querySelectorAll('.bg-white.rounded-lg.shadow');
      expect(cards.length).toBe(5); // 5 primary metrics
    });

    it('should render icons for all cards', () => {
      const jobs = [createMockJob('1', 'completed')];

      const { container } = render(<AnalyticsMetrics jobs={jobs} />);

      const icons = container.querySelectorAll('svg.w-6.h-6');
      expect(icons.length).toBe(5);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle mix of all job statuses', () => {
      const jobs = [
        createMockJob('1', 'completed'),
        createMockJob('2', 'completed'),
        createMockJob('3', 'failed'),
        createMockJob('4', 'pending'),
        createMockJob('5', 'in_progress'),
        createMockJob('6', 'cancelled'),
      ];

      render(<AnalyticsMetrics jobs={jobs} />);

      expect(screen.getByText('6')).toBeInTheDocument(); // Total
      // Success rate: 2/6 = 33%
      expect(screen.getByText('33%')).toBeInTheDocument();
    });

    it('should show 100% success rate when all jobs completed', () => {
      const jobs = [
        createMockJob('1', 'completed'),
        createMockJob('2', 'completed'),
        createMockJob('3', 'completed'),
      ];

      render(<AnalyticsMetrics jobs={jobs} />);

      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should show 0% success rate when no jobs completed', () => {
      const jobs = [
        createMockJob('1', 'failed'),
        createMockJob('2', 'failed'),
      ];

      render(<AnalyticsMetrics jobs={jobs} />);

      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should handle single job', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(<AnalyticsMetrics jobs={jobs} />);

      const totalCard = screen.getByText('Total Jobs').closest('div');
      expect(totalCard).toHaveTextContent('1');
      expect(screen.getAllByText(/100%/).length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading for time periods', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(<AnalyticsMetrics jobs={jobs} showTimePeriods={true} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Success Rate by Time Period');
    });

    it('should render all metric values as text', () => {
      const jobs = [
        createMockJob('1', 'completed'),
        createMockJob('2', 'failed'),
      ];

      render(<AnalyticsMetrics jobs={jobs} />);

      // All values should be accessible
      expect(screen.getByText('2')).toBeInTheDocument(); // Total
      expect(screen.getByText('50%')).toBeInTheDocument(); // Success rate
    });
  });

  describe('Edge Cases', () => {
    it('should handle large numbers', () => {
      const jobs = Array.from({ length: 1000 }, (_, i) =>
        createMockJob(`${i}`, i % 2 === 0 ? 'completed' : 'failed')
      );

      render(<AnalyticsMetrics jobs={jobs} />);

      const totalCard = screen.getByText('Total Jobs').closest('div');
      expect(totalCard).toHaveTextContent('1000');

      const successfulCard = screen.getByText('Successful').closest('div');
      expect(successfulCard).toHaveTextContent('500');
    });

    it('should handle all jobs in pending state', () => {
      const jobs = [
        createMockJob('1', 'pending'),
        createMockJob('2', 'pending'),
      ];

      render(<AnalyticsMetrics jobs={jobs} />);

      // Active count = 2
      const activeCard = screen.getByText('Active').closest('div');
      expect(activeCard).toHaveTextContent('2');

      // Success rate = 0 (no completed jobs)
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should handle all jobs in progress state', () => {
      const jobs = [
        createMockJob('1', 'in_progress'),
        createMockJob('2', 'in_progress'),
      ];

      render(<AnalyticsMetrics jobs={jobs} />);

      const activeCard = screen.getByText('Active').closest('div');
      expect(activeCard).toHaveTextContent('2');
    });

    it('should round percentage correctly', () => {
      const jobs = [
        createMockJob('1', 'completed'),
        createMockJob('2', 'failed'),
        createMockJob('3', 'failed'),
      ];

      render(<AnalyticsMetrics jobs={jobs} />);

      // 1/3 = 33.33% should round to 33%
      expect(screen.getByText('33%')).toBeInTheDocument();
    });
  });

  describe('Grid Layout', () => {
    it('should render primary metrics in grid', () => {
      const jobs = [createMockJob('1', 'completed')];

      const { container } = render(<AnalyticsMetrics jobs={jobs} />);

      const grid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-5');
      expect(grid).toBeInTheDocument();
    });

    it('should render time period metrics in 3-column grid', () => {
      const jobs = [createMockJob('1', 'completed')];

      const { container } = render(
        <AnalyticsMetrics jobs={jobs} showTimePeriods={true} />
      );

      const timePeriodGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-3');
      expect(timePeriodGrid).toBeInTheDocument();
    });
  });
});
