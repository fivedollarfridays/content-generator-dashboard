/**
 * Analytics Page Tests
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AnalyticsPage from '../page';
import type { AnalyticsOverview } from '@/types/content-generator';

// Mock data
const mockAnalyticsData: AnalyticsOverview = {
  job_analytics: {
    total_jobs: 150,
    completed_jobs: 120,
    failed_jobs: 20,
    pending_jobs: 5,
    in_progress_jobs: 3,
    cancelled_jobs: 2,
    success_rate: 80,
    avg_processing_time_seconds: 125.5,
    jobs_by_channel: {
      email: 40,
      social: 30,
    },
    jobs_by_status: {
      completed: 120,
      failed: 20,
      pending: 5,
      in_progress: 3,
      cancelled: 2,
    },
    jobs_over_time: [],
  },
  performance_metrics: {
    avg_response_time_ms: 250,
    p95_response_time_ms: 500,
    p99_response_time_ms: 750,
    error_rate: 0.05,
    success_rate: 0.95,
  },
  channel_performance: {},
  recent_activity: {
    last_24h: 25,
    last_7d: 100,
    last_30d: 150,
  },
};

// Mock mock-data-generator
const mockGetAnalyticsOverview = jest.fn(() => mockAnalyticsData);
jest.mock('@/lib/utils/mock-data-generator', () => ({
  mockDataStore: {
    getAnalyticsOverview: mockGetAnalyticsOverview,
  },
}));

// Mock MetricsCard component
jest.mock('@/app/components/features/metrics-card', () => ({
  MetricsCard: ({
    title,
    value,
    loading,
  }: {
    title: string;
    value: string | number;
    loading?: boolean;
  }) => (
    <div data-testid="metrics-card" data-loading={loading}>
      <span data-testid="metrics-title">{title}</span>
      <span data-testid="metrics-value">{value}</span>
    </div>
  ),
}));

// Mock AnalyticsCharts component
jest.mock('@/app/components/features/analytics-charts', () => ({
  AnalyticsCharts: ({
    jobAnalytics,
    loading,
  }: {
    jobAnalytics: unknown;
    loading?: boolean;
  }) => (
    <div data-testid="analytics-charts" data-loading={loading}>
      Charts Component
    </div>
  ),
}));

describe('AnalyticsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAnalyticsOverview.mockReturnValue(mockAnalyticsData);
  });

  describe('Initial Render', () => {
    it('should render page header', () => {
      render(<AnalyticsPage />);

      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      expect(
        screen.getByText(
          /Insights and performance metrics for your content generation jobs/i
        )
      ).toBeInTheDocument();
    });

    it('should render time range selector buttons', () => {
      render(<AnalyticsPage />);

      expect(screen.getByText('Last 24 Hours')).toBeInTheDocument();
      expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
      expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
    });

    it('should default to 7 days time range', () => {
      render(<AnalyticsPage />);

      const sevenDaysButton = screen.getByText('Last 7 Days');
      expect(sevenDaysButton).toHaveClass('bg-blue-600');
    });

    it('should render refresh button after loading', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });
    });
  });

  describe('Data Fetching', () => {
    it('should fetch analytics data on mount', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(mockGetAnalyticsOverview).toHaveBeenCalled();
      });
    });

    it('should show Refreshing text when loading', async () => {
      const user = userEvent.setup();
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });

      const refreshButton = screen.getByText('Refresh');
      await user.click(refreshButton);

      expect(screen.getByText('Refreshing...')).toBeInTheDocument();
    });
  });

  describe('Metrics Display', () => {
    it('should display Total Jobs metric', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Total Jobs')).toBeInTheDocument();
      });

      const metricCards = screen.getAllByTestId('metrics-card');
      const totalJobsCard = metricCards.find(
        card => card.textContent?.includes('Total Jobs')
      );
      expect(totalJobsCard?.textContent).toContain('150');
    });

    it('should display Success Rate metric', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Success Rate')).toBeInTheDocument();
      });

      const metricCards = screen.getAllByTestId('metrics-card');
      const successRateCard = metricCards.find(
        card => card.textContent?.includes('Success Rate')
      );
      expect(successRateCard?.textContent).toContain('80.0%');
    });

    it('should display Avg Processing Time metric', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Avg Processing Time')).toBeInTheDocument();
      });

      const metricCards = screen.getAllByTestId('metrics-card');
      const processingTimeCard = metricCards.find(
        card => card.textContent?.includes('Avg Processing Time')
      );
      expect(processingTimeCard?.textContent).toContain('2.1m');
    });

    it('should display Active Jobs metric', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Active Jobs')).toBeInTheDocument();
      });

      const metricCards = screen.getAllByTestId('metrics-card');
      const activeJobsCard = metricCards.find(
        card => card.textContent?.includes('Active Jobs')
      );
      expect(activeJobsCard?.textContent).toContain('3');
    });

    it('should display Completed metric', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Completed')).toBeInTheDocument();
      });
    });

    it('should display Failed metric', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Failed')).toBeInTheDocument();
      });
    });

    it('should display Pending metric', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Pending')).toBeInTheDocument();
      });
    });
  });

  describe('Charts Display', () => {
    it('should render analytics charts after loading', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        const charts = screen.getAllByTestId('analytics-charts');
        expect(charts.length).toBeGreaterThan(0);
      });
    });

    it('should show loading charts initially', () => {
      render(<AnalyticsPage />);

      const loadingChart = screen.getByTestId('analytics-charts');
      expect(loadingChart).toHaveAttribute('data-loading', 'true');
    });

    it('should show data charts after load', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        const charts = screen.getAllByTestId('analytics-charts');
        const dataChart = charts.find(
          chart => chart.getAttribute('data-loading') === 'false'
        );
        expect(dataChart).toBeInTheDocument();
      });
    });
  });

  describe('Recent Activity', () => {
    it('should display recent activity section', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      });
    });

    it('should show Last 24 Hours count', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Last 24 Hours')).toBeInTheDocument();
        expect(screen.getByText('25')).toBeInTheDocument();
      });
    });

    it('should show Last 7 Days count', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
      });
    });

    it('should show Last 30 Days count', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
        expect(screen.getByText('150')).toBeInTheDocument();
      });
    });
  });

  describe('Time Range Switching', () => {
    it('should highlight selected time range', () => {
      render(<AnalyticsPage />);

      const sevenDaysButton = screen.getByText('Last 7 Days');
      expect(sevenDaysButton).toHaveClass('bg-blue-600');
    });

    it('should switch to 24h time range', async () => {
      const user = userEvent.setup();
      render(<AnalyticsPage />);

      const button = screen.getByText('Last 24 Hours');
      await user.click(button);

      expect(button).toHaveClass('bg-blue-600');
    });

    it('should switch to 30d time range', async () => {
      const user = userEvent.setup();
      render(<AnalyticsPage />);

      const button = screen.getByText('Last 30 Days');
      await user.click(button);

      expect(button).toHaveClass('bg-blue-600');
    });

    it('should refetch data when time range changes', async () => {
      const user = userEvent.setup();
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(mockGetAnalyticsOverview).toHaveBeenCalledTimes(1);
      });

      const button = screen.getByText('Last 24 Hours');
      await user.click(button);

      await waitFor(() => {
        expect(mockGetAnalyticsOverview).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should refetch data when refresh button clicked', async () => {
      const user = userEvent.setup();
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(mockGetAnalyticsOverview).toHaveBeenCalledTimes(1);
      });

      const refreshButton = screen.getByText('Refresh');
      await user.click(refreshButton);

      await waitFor(() => {
        expect(mockGetAnalyticsOverview).toHaveBeenCalledTimes(2);
      });
    });

    it('should disable refresh button while loading', async () => {
      const user = userEvent.setup();
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });

      const refreshButton = screen.getByText('Refresh');
      await user.click(refreshButton);

      const refreshingButton = screen.getByText('Refreshing...');
      expect(refreshingButton).toBeDisabled();
    });
  });

  describe('Processing Time Formatting', () => {
    it('should format seconds correctly', async () => {
      mockGetAnalyticsOverview.mockReturnValue({
        ...mockAnalyticsData,
        job_analytics: {
          ...mockAnalyticsData.job_analytics,
          avg_processing_time_seconds: 45,
        },
      });

      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('45.0s')).toBeInTheDocument();
      });
    });

    it('should format minutes correctly', async () => {
      mockGetAnalyticsOverview.mockReturnValue({
        ...mockAnalyticsData,
        job_analytics: {
          ...mockAnalyticsData.job_analytics,
          avg_processing_time_seconds: 125,
        },
      });

      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('2.1m')).toBeInTheDocument();
      });
    });

    it('should format hours correctly', async () => {
      mockGetAnalyticsOverview.mockReturnValue({
        ...mockAnalyticsData,
        job_analytics: {
          ...mockAnalyticsData.job_analytics,
          avg_processing_time_seconds: 7200,
        },
      });

      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('2.0h')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values', async () => {
      mockGetAnalyticsOverview.mockReturnValue({
        ...mockAnalyticsData,
        job_analytics: {
          ...mockAnalyticsData.job_analytics,
          total_jobs: 0,
          completed_jobs: 0,
          failed_jobs: 0,
          pending_jobs: 0,
          in_progress_jobs: 0,
          cancelled_jobs: 0,
          success_rate: 0,
          avg_processing_time_seconds: 0,
        },
        recent_activity: {
          last_24h: 0,
          last_7d: 0,
          last_30d: 0,
        },
      });

      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getAllByText('0').length).toBeGreaterThan(0);
      });
    });

    it('should render without errors on rapid time range switches', async () => {
      const user = userEvent.setup({ delay: null });
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Last 24 Hours'));
      await user.click(screen.getByText('Last 30 Days'));
      await user.click(screen.getByText('Last 7 Days'));

      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading state for metrics initially', () => {
      render(<AnalyticsPage />);

      const metricCards = screen.getAllByTestId('metrics-card');
      const loadingCard = metricCards.find(
        card => card.getAttribute('data-loading') === 'true'
      );
      expect(loadingCard).toBeInTheDocument();
    });

    it('should show data after loading complete', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        const metricCards = screen.getAllByTestId('metrics-card');
        const dataCard = metricCards.find(
          card => card.getAttribute('data-loading') === 'false'
        );
        expect(dataCard).toBeInTheDocument();
      });
    });
  });
});
