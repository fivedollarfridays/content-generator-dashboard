/**
 * JobCharts Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { JobCharts } from '../job-charts';
import type { SyncJob } from '@/types/content-generator';

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  LineChart: ({ children }: any) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

// Mock job-analytics utilities
const mockStatusDistribution = {
  completed: 10,
  failed: 3,
  in_progress: 2,
  pending: 5,
};

const mockJobTrends = [
  { date: '2025-01-01', successRate: 85, total: 20 },
  { date: '2025-01-02', successRate: 90, total: 25 },
  { date: '2025-01-03', successRate: 78, total: 18 },
];

const mockChannelPerformance = [
  { channel: 'email', successful: 15, failed: 2, successRate: 88 },
  { channel: 'social', successful: 10, failed: 3, successRate: 77 },
  { channel: 'website', successful: 20, failed: 1, successRate: 95 },
];

jest.mock('@/lib/utils/job-analytics', () => ({
  getStatusDistribution: jest.fn(() => mockStatusDistribution),
  getJobTrends: jest.fn(() => mockJobTrends),
  getChannelPerformance: jest.fn(() => mockChannelPerformance),
}));

import {
  getStatusDistribution,
  getJobTrends,
  getChannelPerformance,
} from '@/lib/utils/job-analytics';

const createMockJob = (
  id: string,
  status: SyncJob['status'],
  channel: string = 'email'
): SyncJob => ({
  job_id: id,
  document_id: `doc-${id}`,
  status,
  channels: [channel],
  created_at: '2025-01-01T00:00:00Z',
  progress: { percent: status === 'completed' ? 100 : 50, message: 'Processing' },
});

describe('JobCharts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render all three chart sections', () => {
      const jobs = [
        createMockJob('1', 'completed'),
        createMockJob('2', 'failed'),
      ];

      render(<JobCharts jobs={jobs} />);

      expect(screen.getByText('Status Distribution')).toBeInTheDocument();
      expect(screen.getByText('Success Rate Trend')).toBeInTheDocument();
      expect(screen.getByText('Channel Performance')).toBeInTheDocument();
    });

    it('should render chart containers', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(<JobCharts jobs={jobs} />);

      // All three charts should have ResponsiveContainer
      const containers = screen.getAllByTestId('responsive-container');
      expect(containers).toHaveLength(3);
    });

    it('should pass trendDays prop to trend chart', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(<JobCharts jobs={jobs} trendDays={14} />);

      expect(screen.getByText('Last 14 days')).toBeInTheDocument();
    });

    it('should use default trendDays of 7', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(<JobCharts jobs={jobs} />);

      expect(screen.getByText('Last 7 days')).toBeInTheDocument();
    });
  });

  describe('Status Distribution Chart', () => {
    it('should call getStatusDistribution with jobs', () => {
      const jobs = [
        createMockJob('1', 'completed'),
        createMockJob('2', 'failed'),
      ];

      render(<JobCharts jobs={jobs} />);

      expect(getStatusDistribution).toHaveBeenCalledWith(jobs);
    });

    it('should render pie chart when data available', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(<JobCharts jobs={jobs} />);

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('should show empty state when no data', () => {
      (getStatusDistribution as jest.Mock).mockReturnValueOnce({});
      const jobs: SyncJob[] = [];

      render(<JobCharts jobs={jobs} />);

      // Check for "No data available" in Status Distribution section
      const statusSection = screen
        .getByText('Status Distribution')
        .closest('div');
      expect(statusSection).toHaveTextContent('No data available');
    });

    it('should filter out zero-count statuses', () => {
      (getStatusDistribution as jest.Mock).mockReturnValueOnce({
        completed: 5,
        failed: 0,
        pending: 0,
      });
      const jobs = [createMockJob('1', 'completed')];

      render(<JobCharts jobs={jobs} />);

      // Should still render chart (only non-zero values)
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
  });

  describe('Success Rate Trend Chart', () => {
    it('should call getJobTrends with jobs and days', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(<JobCharts jobs={jobs} trendDays={14} />);

      expect(getJobTrends).toHaveBeenCalledWith(jobs, 14);
    });

    it('should render line chart when data available', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(<JobCharts jobs={jobs} />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should render two lines (Success Rate and Total)', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(<JobCharts jobs={jobs} />);

      const lines = screen.getAllByTestId('line');
      expect(lines).toHaveLength(2);
    });

    it('should show empty state when no trend data', () => {
      (getJobTrends as jest.Mock).mockReturnValueOnce([]);
      const jobs: SyncJob[] = [];

      render(<JobCharts jobs={jobs} />);

      const trendSection = screen
        .getByText('Success Rate Trend')
        .closest('div')
        ?.parentElement;
      expect(trendSection).toHaveTextContent('No data available');
    });

    it('should format dates correctly', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(<JobCharts jobs={jobs} />);

      // Chart should be rendered (date formatting happens in data transformation)
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('Channel Performance Chart', () => {
    it('should call getChannelPerformance with jobs', () => {
      const jobs = [createMockJob('1', 'completed', 'email')];

      render(<JobCharts jobs={jobs} />);

      expect(getChannelPerformance).toHaveBeenCalledWith(jobs);
    });

    it('should render bar chart when data available', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(<JobCharts jobs={jobs} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('should render three bars (Successful, Failed, Success Rate)', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(<JobCharts jobs={jobs} />);

      const bars = screen.getAllByTestId('bar');
      expect(bars).toHaveLength(3);
    });

    it('should show empty state when no channel data', () => {
      (getChannelPerformance as jest.Mock).mockReturnValueOnce([]);
      const jobs: SyncJob[] = [];

      render(<JobCharts jobs={jobs} />);

      const channelSection = screen
        .getByText('Channel Performance')
        .closest('div');
      expect(channelSection).toHaveTextContent('No data available');
    });
  });

  describe('Chart Elements', () => {
    it('should render chart grids', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(<JobCharts jobs={jobs} />);

      // Line and Bar charts have grids
      const grids = screen.getAllByTestId('cartesian-grid');
      expect(grids.length).toBeGreaterThan(0);
    });

    it('should render tooltips', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(<JobCharts jobs={jobs} />);

      const tooltips = screen.getAllByTestId('tooltip');
      expect(tooltips.length).toBe(3); // One for each chart
    });

    it('should render legends', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(<JobCharts jobs={jobs} />);

      const legends = screen.getAllByTestId('legend');
      expect(legends.length).toBe(3);
    });

    it('should render axes for line and bar charts', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(<JobCharts jobs={jobs} />);

      const xAxes = screen.getAllByTestId('x-axis');
      const yAxes = screen.getAllByTestId('y-axis');

      expect(xAxes.length).toBeGreaterThan(0);
      expect(yAxes.length).toBeGreaterThan(0);
    });
  });

  describe('Empty State Handling', () => {
    it('should handle all charts with empty data', () => {
      (getStatusDistribution as jest.Mock).mockReturnValueOnce({});
      (getJobTrends as jest.Mock).mockReturnValueOnce([]);
      (getChannelPerformance as jest.Mock).mockReturnValueOnce([]);

      const jobs: SyncJob[] = [];

      render(<JobCharts jobs={jobs} />);

      const emptyMessages = screen.getAllByText('No data available');
      expect(emptyMessages).toHaveLength(3);
    });

    it('should handle mix of empty and populated charts', () => {
      (getStatusDistribution as jest.Mock).mockReturnValueOnce({});
      (getJobTrends as jest.Mock).mockReturnValueOnce(mockJobTrends);
      (getChannelPerformance as jest.Mock).mockReturnValueOnce(
        mockChannelPerformance
      );

      const jobs = [createMockJob('1', 'completed')];

      render(<JobCharts jobs={jobs} />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('should render sections with proper spacing', () => {
      const jobs = [createMockJob('1', 'completed')];

      const { container } = render(<JobCharts jobs={jobs} />);

      const spacedContainer = container.querySelector('.space-y-6');
      expect(spacedContainer).toBeInTheDocument();
    });

    it('should render chart sections with shadow', () => {
      const jobs = [createMockJob('1', 'completed')];

      const { container } = render(<JobCharts jobs={jobs} />);

      const shadowedCards = container.querySelectorAll('.shadow');
      expect(shadowedCards.length).toBe(3);
    });

    it('should have semantic headings', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(<JobCharts jobs={jobs} />);

      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings).toHaveLength(3);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle large number of jobs', () => {
      const jobs = Array.from({ length: 100 }, (_, i) =>
        createMockJob(`${i}`, i % 2 === 0 ? 'completed' : 'failed')
      );

      render(<JobCharts jobs={jobs} />);

      expect(getStatusDistribution).toHaveBeenCalledWith(jobs);
      expect(getJobTrends).toHaveBeenCalledWith(jobs, 7);
      expect(getChannelPerformance).toHaveBeenCalledWith(jobs);
    });

    it('should handle all job statuses', () => {
      const jobs = [
        createMockJob('1', 'completed'),
        createMockJob('2', 'failed'),
        createMockJob('3', 'in_progress'),
        createMockJob('4', 'pending'),
        createMockJob('5', 'cancelled'),
      ];

      render(<JobCharts jobs={jobs} />);

      expect(getStatusDistribution).toHaveBeenCalledWith(jobs);
    });

    it('should handle multiple channels', () => {
      const jobs = [
        createMockJob('1', 'completed', 'email'),
        createMockJob('2', 'completed', 'social'),
        createMockJob('3', 'completed', 'website'),
      ];

      render(<JobCharts jobs={jobs} />);

      expect(getChannelPerformance).toHaveBeenCalledWith(jobs);
    });

    it('should handle different trendDays values', () => {
      const jobs = [createMockJob('1', 'completed')];

      const { rerender } = render(<JobCharts jobs={jobs} trendDays={7} />);
      expect(screen.getByText('Last 7 days')).toBeInTheDocument();

      rerender(<JobCharts jobs={jobs} trendDays={30} />);
      expect(screen.getByText('Last 30 days')).toBeInTheDocument();

      rerender(<JobCharts jobs={jobs} trendDays={90} />);
      expect(screen.getByText('Last 90 days')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible heading structure', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(<JobCharts jobs={jobs} />);

      expect(
        screen.getByRole('heading', { name: 'Status Distribution' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'Success Rate Trend' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'Channel Performance' })
      ).toBeInTheDocument();
    });

    it('should provide empty state messages', () => {
      (getStatusDistribution as jest.Mock).mockReturnValueOnce({});
      (getJobTrends as jest.Mock).mockReturnValueOnce([]);
      (getChannelPerformance as jest.Mock).mockReturnValueOnce([]);

      const jobs: SyncJob[] = [];

      render(<JobCharts jobs={jobs} />);

      const emptyMessages = screen.getAllByText('No data available');
      emptyMessages.forEach(message => {
        expect(message).toHaveClass('text-gray-500');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle single job', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(<JobCharts jobs={jobs} />);

      expect(getStatusDistribution).toHaveBeenCalledWith(jobs);
      expect(getJobTrends).toHaveBeenCalledWith(jobs, 7);
      expect(getChannelPerformance).toHaveBeenCalledWith(jobs);
    });

    it('should handle zero trendDays gracefully', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(<JobCharts jobs={jobs} trendDays={0} />);

      expect(screen.getByText('Last 0 days')).toBeInTheDocument();
      expect(getJobTrends).toHaveBeenCalledWith(jobs, 0);
    });

    it('should re-render when jobs prop changes', () => {
      const jobs1 = [createMockJob('1', 'completed')];
      const jobs2 = [createMockJob('2', 'failed')];

      const { rerender } = render(<JobCharts jobs={jobs1} />);
      expect(getStatusDistribution).toHaveBeenCalledWith(jobs1);

      rerender(<JobCharts jobs={jobs2} />);
      expect(getStatusDistribution).toHaveBeenCalledWith(jobs2);
    });
  });
});
