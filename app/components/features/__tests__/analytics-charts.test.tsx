/**
 * AnalyticsCharts Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AnalyticsCharts } from '../analytics-charts';
import type { JobAnalytics } from '@/types/content-generator';

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({
    children,
    data,
  }: {
    children: React.ReactNode;
    data: unknown;
  }) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  BarChart: ({
    children,
    data,
  }: {
    children: React.ReactNode;
    data: unknown;
  }) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  Pie: ({ data }: { data: unknown }) => (
    <div data-testid="pie" data-pie-data={JSON.stringify(data)} />
  ),
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

describe('AnalyticsCharts', () => {
  const mockJobAnalytics: JobAnalytics = {
    total_jobs: 150,
    completed_jobs: 120,
    failed_jobs: 20,
    pending_jobs: 5,
    in_progress_jobs: 3,
    cancelled_jobs: 2,
    success_rate: 80,
    avg_processing_time_seconds: 125.5,
    jobs_by_channel: {
      social_media_post: 50,
      email: 40,
      blog_post: 30,
      video_script: 20,
      podcast_script: 10,
    },
    jobs_by_status: {
      completed: 120,
      failed: 20,
      pending: 5,
      in_progress: 3,
      cancelled: 2,
    },
    jobs_over_time: [
      { timestamp: '2025-10-01T00:00:00Z', count: 10 },
      { timestamp: '2025-10-02T00:00:00Z', count: 15 },
      { timestamp: '2025-10-03T00:00:00Z', count: 20 },
      { timestamp: '2025-10-04T00:00:00Z', count: 25 },
      { timestamp: '2025-10-05T00:00:00Z', count: 30 },
    ],
  };

  // ========== Rendering Tests ==========

  describe('Rendering', () => {
    it('should render all three chart sections', () => {
      render(<AnalyticsCharts jobAnalytics={mockJobAnalytics} />);

      expect(screen.getByText('Jobs Over Time')).toBeInTheDocument();
      expect(screen.getByText('Status Distribution')).toBeInTheDocument();
      expect(screen.getByText('Jobs by Channel')).toBeInTheDocument();
    });

    it('should render line chart for jobs over time', () => {
      render(<AnalyticsCharts jobAnalytics={mockJobAnalytics} />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('line')).toBeInTheDocument();
    });

    it('should render pie chart for status distribution', () => {
      render(<AnalyticsCharts jobAnalytics={mockJobAnalytics} />);

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByTestId('pie')).toBeInTheDocument();
    });

    it('should render bar chart for channel distribution', () => {
      render(<AnalyticsCharts jobAnalytics={mockJobAnalytics} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar')).toBeInTheDocument();
    });

    it('should render responsive containers', () => {
      render(<AnalyticsCharts jobAnalytics={mockJobAnalytics} />);

      const containers = screen.getAllByTestId('responsive-container');
      expect(containers.length).toBe(3);
    });
  });

  // ========== Data Transformation Tests ==========

  describe('Data Transformation', () => {
    it('should transform status data correctly', () => {
      render(<AnalyticsCharts jobAnalytics={mockJobAnalytics} />);

      const pieElement = screen.getByTestId('pie');
      const pieData = JSON.parse(
        pieElement.getAttribute('data-pie-data') || '[]'
      );

      // Should have 5 statuses with counts > 0
      expect(pieData.length).toBe(5);
      expect(pieData).toContainEqual(
        expect.objectContaining({ name: 'completed', value: 120 })
      );
      expect(pieData).toContainEqual(
        expect.objectContaining({ name: 'failed', value: 20 })
      );
    });

    it('should filter out statuses with zero count', () => {
      const analyticsWithZeros: JobAnalytics = {
        ...mockJobAnalytics,
        jobs_by_status: {
          completed: 100,
          failed: 0,
          pending: 0,
          in_progress: 0,
          cancelled: 0,
        },
      };

      render(<AnalyticsCharts jobAnalytics={analyticsWithZeros} />);

      const pieElement = screen.getByTestId('pie');
      const pieData = JSON.parse(
        pieElement.getAttribute('data-pie-data') || '[]'
      );

      // Should only have 1 status (completed)
      expect(pieData.length).toBe(1);
      expect(pieData[0]).toMatchObject({ name: 'completed', value: 100 });
    });

    it('should transform channel data correctly', () => {
      render(<AnalyticsCharts jobAnalytics={mockJobAnalytics} />);

      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(
        barChart.getAttribute('data-chart-data') || '[]'
      );

      expect(chartData.length).toBe(5);
      expect(chartData).toContainEqual(
        expect.objectContaining({ channel: expect.any(String), jobs: 50 })
      );
    });

    it('should format channel names (remove underscores and prefix)', () => {
      render(<AnalyticsCharts jobAnalytics={mockJobAnalytics} />);

      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(
        barChart.getAttribute('data-chart-data') || '[]'
      );

      // Check that channel names are formatted (first underscore replaced, "social " removed)
      const channelNames = chartData.map((d: { channel: string }) => d.channel);
      expect(channelNames).toContain('media_post'); // from social_media_post (first _ replaced with space, then "social " removed)
      expect(channelNames).toContain('blog post'); // from blog_post
    });

    it('should transform time series data correctly', () => {
      render(<AnalyticsCharts jobAnalytics={mockJobAnalytics} />);

      const lineChart = screen.getByTestId('line-chart');
      const chartData = JSON.parse(
        lineChart.getAttribute('data-chart-data') || '[]'
      );

      expect(chartData.length).toBe(5);
      expect(chartData[0]).toHaveProperty('timestamp');
      expect(chartData[0]).toHaveProperty('count', 10);
    });

    it('should format timestamps for display', () => {
      render(<AnalyticsCharts jobAnalytics={mockJobAnalytics} />);

      const lineChart = screen.getByTestId('line-chart');
      const chartData = JSON.parse(
        lineChart.getAttribute('data-chart-data') || '[]'
      );

      // Check that timestamp is formatted (e.g., "Oct 1")
      expect(chartData[0].timestamp).toMatch(/\w{3}\s\d{1,2}/);
    });
  });

  // ========== Loading State Tests ==========

  describe('Loading State', () => {
    it('should display loading skeleton when loading is true', () => {
      const { container } = render(
        <AnalyticsCharts jobAnalytics={mockJobAnalytics} loading={true} />
      );

      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBe(3);
    });

    it('should not show actual charts when loading', () => {
      render(
        <AnalyticsCharts jobAnalytics={mockJobAnalytics} loading={true} />
      );

      expect(screen.queryByText('Jobs Over Time')).not.toBeInTheDocument();
      expect(screen.queryByText('Status Distribution')).not.toBeInTheDocument();
      expect(screen.queryByText('Jobs by Channel')).not.toBeInTheDocument();
    });

    it('should display charts when loading is false', () => {
      render(
        <AnalyticsCharts jobAnalytics={mockJobAnalytics} loading={false} />
      );

      expect(screen.getByText('Jobs Over Time')).toBeInTheDocument();
      expect(screen.getByText('Status Distribution')).toBeInTheDocument();
      expect(screen.getByText('Jobs by Channel')).toBeInTheDocument();
    });

    it('should have correct loading skeleton structure', () => {
      const { container } = render(
        <AnalyticsCharts jobAnalytics={mockJobAnalytics} loading={true} />
      );

      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);

      const skeletonElements = container.querySelectorAll('.bg-gray-200');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });
  });

  // ========== Color Mapping Tests ==========

  describe('Color Mapping', () => {
    it('should assign correct colors to statuses', () => {
      render(<AnalyticsCharts jobAnalytics={mockJobAnalytics} />);

      const pieElement = screen.getByTestId('pie');
      const pieData = JSON.parse(
        pieElement.getAttribute('data-pie-data') || '[]'
      );

      const completedStatus = pieData.find(
        (d: { name: string }) => d.name === 'completed'
      );
      const failedStatus = pieData.find(
        (d: { name: string }) => d.name === 'failed'
      );

      expect(completedStatus?.color).toBe('#10B981'); // green
      expect(failedStatus?.color).toBe('#EF4444'); // red
    });

    it('should use default color for unknown status', () => {
      const analyticsWithUnknownStatus: JobAnalytics = {
        ...mockJobAnalytics,
        jobs_by_status: {
          completed: 100,
          // @ts-expect-error - Testing with unknown status
          unknown_status: 10,
        },
      };

      render(<AnalyticsCharts jobAnalytics={analyticsWithUnknownStatus} />);

      const pieElement = screen.getByTestId('pie');
      const pieData = JSON.parse(
        pieElement.getAttribute('data-pie-data') || '[]'
      );

      const unknownStatus = pieData.find(
        (d: { name: string }) => d.name === 'unknown status'
      );
      expect(unknownStatus?.color).toBe('#6B7280'); // gray (default)
    });
  });

  // ========== Edge Cases ==========

  describe('Edge Cases', () => {
    it('should handle empty jobs_by_status', () => {
      const emptyAnalytics: JobAnalytics = {
        ...mockJobAnalytics,
        jobs_by_status: {},
      };

      render(<AnalyticsCharts jobAnalytics={emptyAnalytics} />);

      expect(screen.getByText('Status Distribution')).toBeInTheDocument();
      const pieElement = screen.getByTestId('pie');
      const pieData = JSON.parse(
        pieElement.getAttribute('data-pie-data') || '[]'
      );
      expect(pieData.length).toBe(0);
    });

    it('should handle empty jobs_by_channel', () => {
      const emptyAnalytics: JobAnalytics = {
        ...mockJobAnalytics,
        jobs_by_channel: {},
      };

      render(<AnalyticsCharts jobAnalytics={emptyAnalytics} />);

      expect(screen.getByText('Jobs by Channel')).toBeInTheDocument();
      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(
        barChart.getAttribute('data-chart-data') || '[]'
      );
      expect(chartData.length).toBe(0);
    });

    it('should handle empty jobs_over_time', () => {
      const emptyAnalytics: JobAnalytics = {
        ...mockJobAnalytics,
        jobs_over_time: [],
      };

      render(<AnalyticsCharts jobAnalytics={emptyAnalytics} />);

      expect(screen.getByText('Jobs Over Time')).toBeInTheDocument();
      const lineChart = screen.getByTestId('line-chart');
      const chartData = JSON.parse(
        lineChart.getAttribute('data-chart-data') || '[]'
      );
      expect(chartData.length).toBe(0);
    });

    it('should handle single data point in time series', () => {
      const singlePointAnalytics: JobAnalytics = {
        ...mockJobAnalytics,
        jobs_over_time: [{ timestamp: '2025-10-01T00:00:00Z', count: 10 }],
      };

      render(<AnalyticsCharts jobAnalytics={singlePointAnalytics} />);

      const lineChart = screen.getByTestId('line-chart');
      const chartData = JSON.parse(
        lineChart.getAttribute('data-chart-data') || '[]'
      );
      expect(chartData.length).toBe(1);
      expect(chartData[0]).toHaveProperty('count', 10);
    });

    it('should handle all jobs with same status', () => {
      const singleStatusAnalytics: JobAnalytics = {
        ...mockJobAnalytics,
        jobs_by_status: {
          completed: 150,
        },
      };

      render(<AnalyticsCharts jobAnalytics={singleStatusAnalytics} />);

      const pieElement = screen.getByTestId('pie');
      const pieData = JSON.parse(
        pieElement.getAttribute('data-pie-data') || '[]'
      );
      expect(pieData.length).toBe(1);
      expect(pieData[0]).toMatchObject({ name: 'completed', value: 150 });
    });
  });

  // ========== Chart Component Tests ==========

  describe('Chart Components', () => {
    it('should render chart axes for line chart', () => {
      render(<AnalyticsCharts jobAnalytics={mockJobAnalytics} />);

      const axes = screen.getAllByTestId('x-axis');
      expect(axes.length).toBeGreaterThan(0);
    });

    it('should render tooltips for all charts', () => {
      render(<AnalyticsCharts jobAnalytics={mockJobAnalytics} />);

      const tooltips = screen.getAllByTestId('tooltip');
      expect(tooltips.length).toBeGreaterThan(0);
    });

    it('should render legends for charts', () => {
      render(<AnalyticsCharts jobAnalytics={mockJobAnalytics} />);

      const legends = screen.getAllByTestId('legend');
      expect(legends.length).toBeGreaterThan(0);
    });

    it('should render cartesian grid for line and bar charts', () => {
      render(<AnalyticsCharts jobAnalytics={mockJobAnalytics} />);

      const grids = screen.getAllByTestId('cartesian-grid');
      expect(grids.length).toBe(2); // Line chart and bar chart
    });
  });

  // ========== Styling Tests ==========

  describe('Styling', () => {
    it('should apply correct layout classes', () => {
      const { container } = render(
        <AnalyticsCharts jobAnalytics={mockJobAnalytics} />
      );

      // Check for grid layout
      const grid = container.querySelector(
        '.grid.grid-cols-1.lg\\:grid-cols-2'
      );
      expect(grid).toBeInTheDocument();
    });

    it('should have card styling for chart containers', () => {
      const { container } = render(
        <AnalyticsCharts jobAnalytics={mockJobAnalytics} />
      );

      const cards = container.querySelectorAll('.bg-white.rounded-lg.shadow');
      expect(cards.length).toBe(3);
    });

    it('should have proper spacing between charts', () => {
      const { container } = render(
        <AnalyticsCharts jobAnalytics={mockJobAnalytics} />
      );

      const spacedContainer = container.querySelector('.space-y-6');
      expect(spacedContainer).toBeInTheDocument();
    });
  });
});
