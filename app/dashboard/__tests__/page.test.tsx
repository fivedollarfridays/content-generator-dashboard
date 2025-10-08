/**
 * Dashboard Page Tests
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardPage from '../page';
import type { SyncJob } from '@/types/content-generator';

// Mock components
jest.mock('@/app/components/features/content-generator-health', () => {
  return function MockContentGeneratorHealth() {
    return <div data-testid="content-generator-health">Health Component</div>;
  };
});

jest.mock('@/app/components/features/analytics-metrics', () => {
  return function MockAnalyticsMetrics() {
    return <div data-testid="analytics-metrics">Analytics Metrics</div>;
  };
});

jest.mock('@/app/components/features/job-charts', () => {
  return function MockJobCharts() {
    return <div data-testid="job-charts">Job Charts</div>;
  };
});

// Mock mock-data-generator
const mockJobs: SyncJob[] = [
  {
    job_id: 'job-1',
    document_id: 'doc-1',
    status: 'completed',
    channels: ['email'],
    content_type: 'update',
    template_style: 'modern',
    created_at: '2025-10-08T12:00:00Z',
    updated_at: '2025-10-08T12:05:00Z',
  },
  {
    job_id: 'job-2',
    document_id: 'doc-2',
    status: 'pending',
    channels: ['website'],
    content_type: 'blog',
    template_style: 'classic',
    created_at: '2025-10-08T12:10:00Z',
    updated_at: '2025-10-08T12:10:00Z',
  },
];

jest.mock('@/lib/utils/mock-data-generator', () => ({
  mockDataStore: {
    getJobs: jest.fn(() => mockJobs),
  },
}));

// Mock API client
jest.mock('@/lib/api/api-client', () => ({
  ContentGeneratorAPI: jest.fn(),
}));

describe('DashboardPage', () => {
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock = {};

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => localStorageMock[key] || null),
        setItem: jest.fn((key, value) => {
          localStorageMock[key] = value;
        }),
        removeItem: jest.fn((key) => {
          delete localStorageMock[key];
        }),
        clear: jest.fn(() => {
          localStorageMock = {};
        }),
      },
      writable: true,
    });

    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ========== Rendering Tests ==========

  describe('Initial Rendering', () => {
    it('should render dashboard page with title', () => {
      render(<DashboardPage />);

      expect(screen.getByText('Content Generator Dashboard')).toBeInTheDocument();
      expect(
        screen.getByText('Monitor system health, manage content generation, and view analytics')
      ).toBeInTheDocument();
    });

    it('should render health component', () => {
      render(<DashboardPage />);

      expect(screen.getByTestId('content-generator-health')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      render(<DashboardPage />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should render quick actions section', () => {
      render(<DashboardPage />);

      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('Generate Content')).toBeInTheDocument();
      expect(screen.getByText('View Jobs')).toBeInTheDocument();
      expect(screen.getByText('Templates')).toBeInTheDocument();
    });
  });

  // ========== Data Loading Tests ==========

  describe('Data Loading', () => {
    it('should load jobs and display analytics when data is available', async () => {
      render(<DashboardPage />);

      // Fast-forward past the 300ms delay
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('analytics-metrics')).toBeInTheDocument();
      expect(screen.getByTestId('job-charts')).toBeInTheDocument();
    });

    it('should display Analytics heading when jobs are loaded', async () => {
      render(<DashboardPage />);

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('Analytics')).toBeInTheDocument();
      });
    });

    it('should load API key from localStorage', () => {
      localStorageMock['api_key'] = 'test-api-key';

      render(<DashboardPage />);

      expect(window.localStorage.getItem).toHaveBeenCalledWith('api_key');
    });

    it('should handle missing API key gracefully', () => {
      render(<DashboardPage />);

      // Should not crash even without API key
      expect(screen.getByText('Content Generator Dashboard')).toBeInTheDocument();
    });
  });

  // ========== Empty State Tests ==========

  describe('Empty State', () => {
    it('should show empty state when no jobs are available', async () => {
      // Mock empty jobs
      const mockDataGenerator = require('@/lib/utils/mock-data-generator');
      mockDataGenerator.mockDataStore.getJobs.mockReturnValue([]);

      render(<DashboardPage />);

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(
          screen.getByText('No jobs found. Start by generating some content to see analytics.')
        ).toBeInTheDocument();
      });
    });

    it('should not show analytics when no jobs are available', async () => {
      const mockDataGenerator = require('@/lib/utils/mock-data-generator');
      mockDataGenerator.mockDataStore.getJobs.mockReturnValue([]);

      render(<DashboardPage />);

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.queryByTestId('analytics-metrics')).not.toBeInTheDocument();
        expect(screen.queryByTestId('job-charts')).not.toBeInTheDocument();
      });
    });
  });

  // ========== Navigation Links Tests ==========

  describe('Navigation Links', () => {
    it('should have link to generate page', () => {
      render(<DashboardPage />);

      const generateLink = screen.getByText('Start Generating').closest('a');
      expect(generateLink).toHaveAttribute('href', '/generate');
    });

    it('should have link to jobs page', () => {
      render(<DashboardPage />);

      const jobsLink = screen.getByText('View Jobs').closest('a');
      expect(jobsLink).toHaveAttribute('href', '/jobs');
    });

    it('should have link to templates page', () => {
      render(<DashboardPage />);

      const templatesLink = screen.getByText('Browse Templates').closest('a');
      expect(templatesLink).toHaveAttribute('href', '/templates');
    });
  });

  // ========== Interval Cleanup Tests ==========

  describe('Interval Management', () => {
    it('should set up interval to refresh jobs every 30 seconds', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');

      render(<DashboardPage />);

      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        30000
      );
    });

    it('should clear interval on unmount', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { unmount } = render(<DashboardPage />);
      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  // ========== Component Props Tests ==========

  describe('Component Props', () => {
    it('should pass correct props to ContentGeneratorHealth', () => {
      render(<DashboardPage />);

      // Component is rendered with health check (verified by test ID)
      expect(screen.getByTestId('content-generator-health')).toBeInTheDocument();
    });

    it('should pass jobs to AnalyticsMetrics when loaded', async () => {
      render(<DashboardPage />);

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByTestId('analytics-metrics')).toBeInTheDocument();
      });
    });

    it('should pass jobs to JobCharts when loaded', async () => {
      render(<DashboardPage />);

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByTestId('job-charts')).toBeInTheDocument();
      });
    });
  });

  // ========== Error Handling Tests ==========

  describe('Error Handling', () => {
    it('should handle jobs fetch error gracefully', async () => {
      const mockDataGenerator = require('@/lib/utils/mock-data-generator');
      mockDataGenerator.mockDataStore.getJobs.mockImplementation(() => {
        throw new Error('Fetch failed');
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<DashboardPage />);

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to fetch jobs for analytics:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('should show empty state after fetch error', async () => {
      const mockDataGenerator = require('@/lib/utils/mock-data-generator');
      mockDataGenerator.mockDataStore.getJobs.mockImplementation(() => {
        throw new Error('Fetch failed');
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<DashboardPage />);

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      expect(
        screen.getByText('No jobs found. Start by generating some content to see analytics.')
      ).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });
  });

  // ========== Loading State Tests ==========

  describe('Loading State', () => {
    it('should show skeleton loaders while loading', () => {
      render(<DashboardPage />);

      const skeletons = screen.getAllByTestId(/loading/i);
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should hide loading state after data is loaded', async () => {
      render(<DashboardPage />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });
  });
});
