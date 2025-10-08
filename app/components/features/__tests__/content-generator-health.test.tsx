/**
 * ContentGeneratorHealth Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContentGeneratorHealth } from '../content-generator-health';
import type { HealthStatus, Metrics } from '@/types/content-generator';
import { ContentGeneratorAPI } from '@/lib/api/api-client';

// Mock the API client
jest.mock('@/lib/api/api-client');

const mockHealthStatus: HealthStatus = {
  status: 'healthy',
  uptime: 86400, // 1 day
  version: '1.0.0',
  checks: {
    database: {
      status: 'pass',
      message: 'Database connection healthy',
      latency_ms: 5.2,
    },
    redis: {
      status: 'pass',
      message: 'Redis connection healthy',
      latency_ms: 2.1,
    },
  },
};

const mockMetrics: Metrics = {
  requests_per_second: 12.5,
  avg_response_time_ms: 150.2,
  cache_hit_rate: 0.85,
  error_rate: 0.02,
  requests_total: 10000,
  active_jobs: 5,
  queue_size: 10,
};

describe('ContentGeneratorHealth', () => {
  const mockApiUrl = 'http://localhost:8000';
  const mockOnStatusChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ========== Rendering Tests ==========

  describe('Rendering States', () => {
    it('should render loading state initially', () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn(() => new Promise(() => {})), // Never resolves
            metrics: jest.fn(() => new Promise(() => {})),
          } as any)
      );

      const { container } = render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('should render error state when health check fails', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn().mockResolvedValue({
              success: false,
              error: { message: 'Network error' },
            }),
            metrics: jest.fn().mockResolvedValue({
              success: false,
            }),
          } as any)
      );

      render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('Health Check Failed')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should render health data when fetch succeeds', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn().mockResolvedValue({
              success: true,
              data: mockHealthStatus,
            }),
            metrics: jest.fn().mockResolvedValue({
              success: true,
              data: mockMetrics,
            }),
          } as any)
      );

      render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('API Health')).toBeInTheDocument();
        expect(screen.getByText('HEALTHY')).toBeInTheDocument();
      });
    });

    it('should display loading skeleton with correct structure', () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn(() => new Promise(() => {})),
            metrics: jest.fn(() => new Promise(() => {})),
          } as any)
      );

      const { container } = render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton?.querySelector('.bg-gray-200')).toBeInTheDocument();
    });
  });

  // ========== Status Display Tests ==========

  describe('Status Display', () => {
    it('should display healthy status with green color', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn().mockResolvedValue({
              success: true,
              data: { ...mockHealthStatus, status: 'healthy' },
            }),
            metrics: jest.fn().mockResolvedValue({ success: true, data: mockMetrics }),
          } as any)
      );

      const { container } = render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      await waitFor(() => {
        const statusBadge = container.querySelector('.text-green-600');
        expect(statusBadge).toBeInTheDocument();
        expect(statusBadge).toHaveTextContent('HEALTHY');
      });
    });

    it('should display degraded status with yellow color', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn().mockResolvedValue({
              success: true,
              data: { ...mockHealthStatus, status: 'degraded' },
            }),
            metrics: jest.fn().mockResolvedValue({ success: true, data: mockMetrics }),
          } as any)
      );

      const { container } = render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      await waitFor(() => {
        const statusBadge = container.querySelector('.text-yellow-600');
        expect(statusBadge).toBeInTheDocument();
        expect(statusBadge).toHaveTextContent('DEGRADED');
      });
    });

    it('should display unhealthy status with red color', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn().mockResolvedValue({
              success: true,
              data: { ...mockHealthStatus, status: 'unhealthy' },
            }),
            metrics: jest.fn().mockResolvedValue({ success: true, data: mockMetrics }),
          } as any)
      );

      const { container } = render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      await waitFor(() => {
        const statusBadge = container.querySelector('.text-red-600');
        expect(statusBadge).toBeInTheDocument();
        expect(statusBadge).toHaveTextContent('UNHEALTHY');
      });
    });

    it('should call onStatusChange when health data is fetched', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn().mockResolvedValue({
              success: true,
              data: mockHealthStatus,
            }),
            metrics: jest.fn().mockResolvedValue({ success: true, data: mockMetrics }),
          } as any)
      );

      render(
        <ContentGeneratorHealth
          apiUrl={mockApiUrl}
          onStatusChange={mockOnStatusChange}
        />
      );

      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenCalledWith(mockHealthStatus);
      });
    });
  });

  // ========== System Metrics Tests ==========

  describe('System Metrics', () => {
    it('should display uptime formatted correctly', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn().mockResolvedValue({
              success: true,
              data: { ...mockHealthStatus, uptime: 86400 }, // 1 day
            }),
            metrics: jest.fn().mockResolvedValue({ success: true, data: mockMetrics }),
          } as any)
      );

      render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('1d 0h 0m')).toBeInTheDocument();
      });
    });

    it('should format uptime in hours when less than a day', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn().mockResolvedValue({
              success: true,
              data: { ...mockHealthStatus, uptime: 7200 }, // 2 hours
            }),
            metrics: jest.fn().mockResolvedValue({ success: true, data: mockMetrics }),
          } as any)
      );

      render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('2h 0m')).toBeInTheDocument();
      });
    });

    it('should format uptime in minutes when less than an hour', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn().mockResolvedValue({
              success: true,
              data: { ...mockHealthStatus, uptime: 300 }, // 5 minutes
            }),
            metrics: jest.fn().mockResolvedValue({ success: true, data: mockMetrics }),
          } as any)
      );

      render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('5m')).toBeInTheDocument();
      });
    });

    it('should display version', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn().mockResolvedValue({
              success: true,
              data: { ...mockHealthStatus, version: '2.1.0' },
            }),
            metrics: jest.fn().mockResolvedValue({ success: true, data: mockMetrics }),
          } as any)
      );

      render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('2.1.0')).toBeInTheDocument();
      });
    });

    it('should display active jobs and queue size', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn().mockResolvedValue({
              success: true,
              data: mockHealthStatus,
            }),
            metrics: jest.fn().mockResolvedValue({
              success: true,
              data: { ...mockMetrics, active_jobs: 15, queue_size: 30 },
            }),
          } as any)
      );

      render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('Active Jobs')).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument();
        expect(screen.getByText('Queue Size')).toBeInTheDocument();
        expect(screen.getByText('30')).toBeInTheDocument();
      });
    });

    it('should display last update time', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn().mockResolvedValue({
              success: true,
              data: mockHealthStatus,
            }),
            metrics: jest.fn().mockResolvedValue({ success: true, data: mockMetrics }),
          } as any)
      );

      render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText(/Updated/)).toBeInTheDocument();
      });
    });
  });

  // ========== Health Checks Tests ==========

  describe('Health Checks', () => {
    it('should display health checks', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn().mockResolvedValue({
              success: true,
              data: mockHealthStatus,
            }),
            metrics: jest.fn().mockResolvedValue({ success: true, data: mockMetrics }),
          } as any)
      );

      render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('System Checks')).toBeInTheDocument();
        expect(screen.getByText('database')).toBeInTheDocument();
        expect(screen.getByText('redis')).toBeInTheDocument();
      });
    });

    it('should display check status and latency', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn().mockResolvedValue({
              success: true,
              data: mockHealthStatus,
            }),
            metrics: jest.fn().mockResolvedValue({ success: true, data: mockMetrics }),
          } as any)
      );

      render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('Database connection healthy')).toBeInTheDocument();
        expect(screen.getByText('Latency: 5.20ms')).toBeInTheDocument();
      });
    });

    it('should not display System Checks section when no checks', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn().mockResolvedValue({
              success: true,
              data: { ...mockHealthStatus, checks: {} },
            }),
            metrics: jest.fn().mockResolvedValue({ success: true, data: mockMetrics }),
          } as any)
      );

      render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.queryByText('System Checks')).not.toBeInTheDocument();
      });
    });
  });

  // ========== Performance Metrics Tests ==========

  describe('Performance Metrics', () => {
    it('should display performance metrics', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn().mockResolvedValue({
              success: true,
              data: mockHealthStatus,
            }),
            metrics: jest.fn().mockResolvedValue({ success: true, data: mockMetrics }),
          } as any)
      );

      render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
        expect(screen.getByText('12.50')).toBeInTheDocument(); // requests_per_second
        expect(screen.getByText('150ms')).toBeInTheDocument(); // avg_response_time_ms
        expect(screen.getByText('85.0%')).toBeInTheDocument(); // cache_hit_rate
        expect(screen.getByText('2.00%')).toBeInTheDocument(); // error_rate
        expect(screen.getByText('10,000')).toBeInTheDocument(); // requests_total
      });
    });

    it('should not display Performance Metrics section when no metrics', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn().mockResolvedValue({
              success: true,
              data: mockHealthStatus,
            }),
            metrics: jest.fn().mockResolvedValue({ success: false }),
          } as any)
      );

      render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.queryByText('Performance Metrics')).not.toBeInTheDocument();
      });
    });
  });

  // ========== Refresh Tests ==========

  describe('Refresh Functionality', () => {
    it('should auto-refresh at specified interval', async () => {
      const mockHealthCheck = jest.fn().mockResolvedValue({
        success: true,
        data: mockHealthStatus,
      });
      const mockMetricsFn = jest.fn().mockResolvedValue({
        success: true,
        data: mockMetrics,
      });

      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: mockHealthCheck,
            metrics: mockMetricsFn,
          } as any)
      );

      render(<ContentGeneratorHealth apiUrl={mockApiUrl} refreshInterval={5000} />);

      // Initial fetch
      await waitFor(() => {
        expect(mockHealthCheck).toHaveBeenCalledTimes(1);
      });

      // Advance timer by 5 seconds
      jest.advanceTimersByTime(5000);

      // Should fetch again
      await waitFor(() => {
        expect(mockHealthCheck).toHaveBeenCalledTimes(2);
      });
    });

    it('should refresh when Refresh Now button clicked', async () => {
      const mockHealthCheck = jest.fn().mockResolvedValue({
        success: true,
        data: mockHealthStatus,
      });

      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: mockHealthCheck,
            metrics: jest.fn().mockResolvedValue({ success: true, data: mockMetrics }),
          } as any)
      );

      render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      // Wait for initial fetch
      await waitFor(() => {
        expect(screen.getByText('Refresh Now')).toBeInTheDocument();
      });

      mockHealthCheck.mockClear();

      // Click refresh button
      fireEvent.click(screen.getByText('Refresh Now'));

      await waitFor(() => {
        expect(mockHealthCheck).toHaveBeenCalledTimes(1);
      });
    });

    it('should have refresh button enabled after load', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn().mockResolvedValue({
              success: true,
              data: mockHealthStatus,
            }),
            metrics: jest.fn().mockResolvedValue({ success: true, data: mockMetrics }),
          } as any)
      );

      render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Refresh Now')).toBeInTheDocument();
      });

      // Button should be enabled
      const button = screen.getByText('Refresh Now');
      expect(button).not.toBeDisabled();
    });
  });

  // ========== Error Handling Tests ==========

  describe('Error Handling', () => {
    it('should display error message on exception', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn().mockRejectedValue(new Error('Connection refused')),
            metrics: jest.fn().mockRejectedValue(new Error('Connection refused')),
          } as any)
      );

      render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('Health Check Failed')).toBeInTheDocument();
        expect(screen.getByText('Connection refused')).toBeInTheDocument();
      });
    });

    it('should retry health check when Retry button clicked', async () => {
      const mockHealthCheck = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ success: true, data: mockHealthStatus });

      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: mockHealthCheck,
            metrics: jest.fn().mockResolvedValue({ success: true, data: mockMetrics }),
          } as any)
      );

      render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      // Click retry
      fireEvent.click(screen.getByText('Retry'));

      // Should show success state
      await waitFor(() => {
        expect(screen.getByText('API Health')).toBeInTheDocument();
      });
    });

    it('should handle unknown error type', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn().mockRejectedValue('Unknown error'),
            metrics: jest.fn().mockRejectedValue('Unknown error'),
          } as any)
      );

      render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('Unknown error')).toBeInTheDocument();
      });
    });
  });

  // ========== Edge Cases ==========

  describe('Edge Cases', () => {
    it('should handle health data without version', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn().mockResolvedValue({
              success: true,
              data: { ...mockHealthStatus, version: undefined },
            }),
            metrics: jest.fn().mockResolvedValue({ success: true, data: mockMetrics }),
          } as any)
      );

      render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('API Health')).toBeInTheDocument();
        expect(screen.queryByText('Version')).not.toBeInTheDocument();
      });
    });

    it('should handle check without message', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn().mockResolvedValue({
              success: true,
              data: {
                ...mockHealthStatus,
                checks: {
                  test: {
                    status: 'pass',
                  },
                },
              },
            }),
            metrics: jest.fn().mockResolvedValue({ success: true, data: mockMetrics }),
          } as any)
      );

      render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('test')).toBeInTheDocument();
      });
    });

    it('should handle check without latency', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn().mockResolvedValue({
              success: true,
              data: {
                ...mockHealthStatus,
                checks: {
                  test: {
                    status: 'pass',
                    message: 'Test passed',
                  },
                },
              },
            }),
            metrics: jest.fn().mockResolvedValue({ success: true, data: mockMetrics }),
          } as any)
      );

      render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('Test passed')).toBeInTheDocument();
        expect(screen.queryByText(/Latency:/)).not.toBeInTheDocument();
      });
    });

    it('should cleanup interval on unmount', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            healthCheck: jest.fn().mockResolvedValue({
              success: true,
              data: mockHealthStatus,
            }),
            metrics: jest.fn().mockResolvedValue({ success: true, data: mockMetrics }),
          } as any)
      );

      const { unmount } = render(<ContentGeneratorHealth apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('API Health')).toBeInTheDocument();
      });

      unmount();

      // Verify no errors after unmount
      jest.advanceTimersByTime(30000);
    });
  });
});
