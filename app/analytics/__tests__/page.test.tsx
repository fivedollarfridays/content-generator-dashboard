/**
 * Analytics Page Integration Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalyticsPage from '../page';
import type { AnalyticsOverview } from '@/types/content-generator';

// Mock the API client
const mockGetAnalytics = jest.fn();

jest.mock('@/lib/api/api-client', () => ({
  ContentGeneratorAPI: jest.fn().mockImplementation(() => ({
    getAnalytics: mockGetAnalytics,
  })),
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
      ],
    },
    performance_metrics: {
      avg_response_time_ms: 250,
      p95_response_time_ms: 500,
      p99_response_time_ms: 750,
      error_rate: 0.05,
      success_rate: 0.95,
    },
    channel_performance: {
      email: {
        total_jobs: 40,
        success_rate: 85,
        avg_processing_time_seconds: 120,
      },
    },
    recent_activity: {
      last_24h: 25,
      last_7d: 100,
      last_30d: 150,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => 'test-api-key');
    Storage.prototype.setItem = jest.fn();
    // Default successful API response
    mockGetAnalytics.mockResolvedValue({
      success: true,
      data: mockAnalyticsData,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ========== Initial Render Tests ==========

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

    it('should render refresh button', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });
    });

    it('should default to 7 days time range', () => {
      render(<AnalyticsPage />);

      const sevenDaysButton = screen.getByText('Last 7 Days');
      expect(sevenDaysButton).toHaveClass('bg-blue-600');
    });
  });

  // ========== API Integration Tests ==========

  describe('API Integration', () => {
    it('should fetch analytics data on mount', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(mockGetAnalytics).toHaveBeenCalledTimes(1);
      });
    });

    it('should pass correct parameters to API', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(mockGetAnalytics).toHaveBeenCalledWith(
          expect.objectContaining({
            granularity: 'day',
            start_date: expect.any(String),
            end_date: expect.any(String),
          })
        );
      });
    });

    it('should retrieve API key from localStorage', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(Storage.prototype.getItem).toHaveBeenCalledWith('api_key');
      });
    });

    it('should use empty string if no API key found', async () => {
      Storage.prototype.getItem = jest.fn(() => null);

      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(mockGetAnalytics).toHaveBeenCalled();
      });
    });
  });

  // ========== Loading State Tests ==========

  describe('Loading State', () => {
    it('should show loading state initially', () => {
      mockGetAnalytics.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(<AnalyticsPage />);

      const loadingCards = screen.getAllByTestId('metrics-card');
      expect(loadingCards[0]).toHaveAttribute('data-loading', 'true');
    });

    it('should show loading state for charts initially', () => {
      mockGetAnalytics.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(<AnalyticsPage />);

      const chartsComponent = screen.getByTestId('analytics-charts');
      expect(chartsComponent).toHaveAttribute('data-loading', 'true');
    });

    it('should hide loading state after data is fetched', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        const loadingCards = screen.queryAllByTestId('metrics-card');
        const firstCard = loadingCards[0];
        expect(firstCard).toHaveAttribute('data-loading', 'false');
      });
    });
  });

  // ========== Data Display Tests ==========

  describe('Data Display', () => {
    it('should display metrics cards with correct data', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Total Jobs')).toBeInTheDocument();
        expect(screen.getByText('Success Rate')).toBeInTheDocument();
        expect(screen.getByText('Avg Processing Time')).toBeInTheDocument();
        expect(screen.getByText('Active Jobs')).toBeInTheDocument();
      });
    });

    it('should display total jobs count', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument();
      });
    });

    it('should display success rate percentage', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('80.0%')).toBeInTheDocument();
      });
    });

    it('should format processing time correctly', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        // 125.5 seconds = 2.1 minutes
        expect(screen.getByText('2.1m')).toBeInTheDocument();
      });
    });

    it('should display additional metrics (completed, failed, pending)', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Completed')).toBeInTheDocument();
        expect(screen.getByText('Failed')).toBeInTheDocument();
        expect(screen.getByText('Pending')).toBeInTheDocument();
      });
    });

    it('should render analytics charts', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        const chartsComponent = screen.getByTestId('analytics-charts');
        expect(chartsComponent).toBeInTheDocument();
        expect(chartsComponent).toHaveAttribute('data-loading', 'false');
      });
    });

    it('should display recent activity section', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Recent Activity')).toBeInTheDocument();
        expect(screen.getByText('25')).toBeInTheDocument(); // last_24h
        expect(screen.getByText('100')).toBeInTheDocument(); // last_7d
        expect(screen.getByText('150')).toBeInTheDocument(); // last_30d (also total_jobs)
      });
    });
  });

  // ========== Time Range Switching Tests ==========

  describe('Time Range Switching', () => {
    it('should switch to 24h time range', async () => {
      render(<AnalyticsPage />);

      const button24h = screen.getByText('Last 24 Hours');
      fireEvent.click(button24h);

      await waitFor(() => {
        expect(mockGetAnalytics).toHaveBeenCalledWith(
          expect.objectContaining({
            granularity: 'hour',
          })
        );
      });
    });

    it('should switch to 30d time range', async () => {
      render(<AnalyticsPage />);

      const button30d = screen.getByText('Last 30 Days');
      fireEvent.click(button30d);

      await waitFor(() => {
        expect(mockGetAnalytics).toHaveBeenCalledWith(
          expect.objectContaining({
            granularity: 'day',
          })
        );
      });
    });

    it('should update active button styling on switch', async () => {
      render(<AnalyticsPage />);

      const button24h = screen.getByText('Last 24 Hours');
      fireEvent.click(button24h);

      await waitFor(() => {
        expect(button24h).toHaveClass('bg-blue-600');
      });
    });

    it('should refetch data when time range changes', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(mockGetAnalytics).toHaveBeenCalledTimes(1);
      });

      const button30d = screen.getByText('Last 30 Days');
      fireEvent.click(button30d);

      await waitFor(() => {
        expect(mockGetAnalytics).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ========== Error Handling Tests ==========

  describe('Error Handling', () => {
    it('should display error message when API fails', async () => {
      mockGetAnalytics.mockResolvedValue({
        success: false,
        error: { message: 'Failed to fetch analytics' },
      });

      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Error Loading Analytics')).toBeInTheDocument();
        expect(
          screen.getByText('Failed to fetch analytics')
        ).toBeInTheDocument();
      });
    });

    it('should display retry button on error', async () => {
      mockGetAnalytics.mockResolvedValue({
        success: false,
        error: { message: 'Network error' },
      });

      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('should retry fetching analytics when retry button is clicked', async () => {
      mockGetAnalytics
        .mockResolvedValueOnce({
          success: false,
          error: { message: 'Network error' },
        })
        .mockResolvedValueOnce({
          success: true,
          data: mockAnalyticsData,
        });

      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockGetAnalytics).toHaveBeenCalledTimes(2);
        expect(
          screen.queryByText('Error Loading Analytics')
        ).not.toBeInTheDocument();
      });
    });

    it('should handle exception during fetch', async () => {
      mockGetAnalytics.mockRejectedValue(new Error('Network failure'));

      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Error Loading Analytics')).toBeInTheDocument();
        expect(screen.getByText('Network failure')).toBeInTheDocument();
      });
    });

    it('should handle unknown error type', async () => {
      mockGetAnalytics.mockRejectedValue('Unknown error');

      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Unknown error occurred')).toBeInTheDocument();
      });
    });
  });

  // ========== Refresh Functionality Tests ==========

  describe('Refresh Functionality', () => {
    it('should refetch data when refresh button is clicked', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(mockGetAnalytics).toHaveBeenCalledTimes(1);
      });

      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockGetAnalytics).toHaveBeenCalledTimes(2);
      });
    });

    it('should show "Refreshing..." text during refresh', async () => {
      mockGetAnalytics.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () => resolve({ success: true, data: mockAnalyticsData }),
              100
            )
          )
      );

      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });

      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      expect(screen.getByText('Refreshing...')).toBeInTheDocument();
    });

    it('should disable refresh button during loading', async () => {
      mockGetAnalytics.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () => resolve({ success: true, data: mockAnalyticsData }),
              100
            )
          )
      );

      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });

      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      const refreshingButton = screen.getByText('Refreshing...');
      expect(refreshingButton).toBeDisabled();
    });
  });

  // ========== Edge Cases ==========

  describe('Edge Cases', () => {
    it('should handle zero values in analytics', async () => {
      const zeroAnalytics: AnalyticsOverview = {
        ...mockAnalyticsData,
        job_analytics: {
          ...mockAnalyticsData.job_analytics,
          total_jobs: 0,
          completed_jobs: 0,
          success_rate: 0,
          avg_processing_time_seconds: 0,
        },
      };

      mockGetAnalytics.mockResolvedValue({
        success: true,
        data: zeroAnalytics,
      });

      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument();
        expect(screen.getByText('0.0%')).toBeInTheDocument();
        expect(screen.getByText('0s')).toBeInTheDocument();
      });
    });

    it('should handle null analytics data', async () => {
      mockGetAnalytics.mockResolvedValue({
        success: true,
        data: null,
      });

      render(<AnalyticsPage />);

      await waitFor(() => {
        // Should display default values (0)
        const metricsCards = screen.getAllByTestId('metrics-value');
        expect(metricsCards[0]).toHaveTextContent('0');
      });
    });

    it('should format very large processing times', async () => {
      const longTimeAnalytics: AnalyticsOverview = {
        ...mockAnalyticsData,
        job_analytics: {
          ...mockAnalyticsData.job_analytics,
          avg_processing_time_seconds: 7200, // 2 hours
        },
      };

      mockGetAnalytics.mockResolvedValue({
        success: true,
        data: longTimeAnalytics,
      });

      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('2.0h')).toBeInTheDocument();
      });
    });

    it('should format processing times under 60 seconds', async () => {
      const quickTimeAnalytics: AnalyticsOverview = {
        ...mockAnalyticsData,
        job_analytics: {
          ...mockAnalyticsData.job_analytics,
          avg_processing_time_seconds: 45,
        },
      };

      mockGetAnalytics.mockResolvedValue({
        success: true,
        data: quickTimeAnalytics,
      });

      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('45.0s')).toBeInTheDocument();
      });
    });

    it('should not display recent activity section when analytics is null', async () => {
      mockGetAnalytics.mockResolvedValue({
        success: true,
        data: null,
      });

      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.queryByText('Recent Activity')).not.toBeInTheDocument();
      });
    });
  });

  // ========== Component Integration Tests ==========

  describe('Component Integration', () => {
    it('should pass correct props to MetricsCard components', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        const metricsCards = screen.getAllByTestId('metrics-card');
        expect(metricsCards.length).toBeGreaterThan(5);
      });
    });

    it('should pass job analytics to AnalyticsCharts', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        const chartsComponent = screen.getByTestId('analytics-charts');
        expect(chartsComponent).toBeInTheDocument();
      });
    });

    it('should display multiple metrics cards', async () => {
      render(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Total Jobs')).toBeInTheDocument();
        expect(screen.getByText('Success Rate')).toBeInTheDocument();
        expect(screen.getByText('Avg Processing Time')).toBeInTheDocument();
        expect(screen.getByText('Active Jobs')).toBeInTheDocument();
        expect(screen.getByText('Completed')).toBeInTheDocument();
        expect(screen.getByText('Failed')).toBeInTheDocument();
        expect(screen.getByText('Pending')).toBeInTheDocument();
      });
    });
  });
});
