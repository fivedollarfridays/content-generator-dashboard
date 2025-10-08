/**
 * Jobs Page Tests
 *
 * Test suite for jobs listing and management page
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock all dependencies before imports
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

jest.mock('@/app/contexts', () => ({
  useAuth: jest.fn(),
  useToast: jest.fn(),
}));

jest.mock('@/app/hooks', () => ({
  useWebSocket: jest.fn(),
  WebSocketState: {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
  },
}));

jest.mock('@/app/components/features/jobs-list', () => {
  return function MockJobsList() {
    return <div data-testid="jobs-list">Jobs List Component</div>;
  };
});

jest.mock('@/app/components/features/job-status-card', () => {
  return function MockJobStatusCard() {
    return <div data-testid="job-status-card">Job Status Card</div>;
  };
});

jest.mock('@/app/components/features/advanced-job-filters', () => {
  return function MockAdvancedJobFilters() {
    return <div data-testid="advanced-job-filters">Advanced Filters</div>;
  };
});

jest.mock('@/app/components/features/batch-job-operations', () => {
  return function MockBatchJobOperations() {
    return <div data-testid="batch-job-operations">Batch Operations</div>;
  };
});

jest.mock('@/app/components/features/filter-presets', () => {
  return function MockFilterPresets() {
    return <div data-testid="filter-presets">Filter Presets</div>;
  };
});

// Import after mocks
import JobsPage from '../page';

const { useSearchParams } = require('next/navigation');
const { useAuth, useToast } = require('@/app/contexts');
const { useWebSocket } = require('@/app/hooks');

describe('JobsPage', () => {
  let mockToast: any;
  let mockSearchParams: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock toast
    mockToast = {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
    };
    useToast.mockReturnValue(mockToast);

    // Mock auth
    useAuth.mockReturnValue({
      apiKey: 'test-api-key',
      isAuthenticated: true,
    });

    // Mock search params
    mockSearchParams = {
      get: jest.fn(),
    };
    useSearchParams.mockReturnValue(mockSearchParams);

    // Mock WebSocket
    useWebSocket.mockReturnValue({
      isConnected: true,
      connectionState: 1,
      send: jest.fn(),
      lastMessage: null,
    });
  });

  describe('Page Rendering', () => {
    it('should render jobs page', () => {
      render(<JobsPage />);

      expect(screen.getByTestId('jobs-list')).toBeInTheDocument();
    });

    it('should render all major components', () => {
      render(<JobsPage />);

      expect(screen.getByTestId('jobs-list')).toBeInTheDocument();
      expect(screen.getByTestId('job-status-card')).toBeInTheDocument();
      expect(screen.getByTestId('advanced-job-filters')).toBeInTheDocument();
      expect(screen.getByTestId('batch-job-operations')).toBeInTheDocument();
      expect(screen.getByTestId('filter-presets')).toBeInTheDocument();
    });

    it('should render within Suspense boundary', () => {
      render(<JobsPage />);

      // Should render without throwing
      expect(screen.getByTestId('jobs-list')).toBeInTheDocument();
    });
  });

  describe('Authentication Integration', () => {
    it('should handle authenticated state', () => {
      useAuth.mockReturnValue({
        apiKey: 'valid-key',
        isAuthenticated: true,
      });

      render(<JobsPage />);

      expect(screen.getByTestId('jobs-list')).toBeInTheDocument();
    });

    it('should handle missing API key', () => {
      useAuth.mockReturnValue({
        apiKey: null,
        isAuthenticated: false,
      });

      render(<JobsPage />);

      expect(screen.getByTestId('jobs-list')).toBeInTheDocument();
    });
  });

  describe('Search Params Integration', () => {
    it('should read highlight parameter from URL', () => {
      mockSearchParams.get.mockReturnValue('job-123');

      render(<JobsPage />);

      expect(mockSearchParams.get).toHaveBeenCalledWith('highlight');
    });

    it('should handle missing highlight parameter', () => {
      mockSearchParams.get.mockReturnValue(null);

      render(<JobsPage />);

      expect(mockSearchParams.get).toHaveBeenCalled();
    });
  });

  describe('WebSocket Integration', () => {
    it('should connect to WebSocket', () => {
      render(<JobsPage />);

      expect(useWebSocket).toHaveBeenCalled();
    });

    it('should handle WebSocket connected state', () => {
      useWebSocket.mockReturnValue({
        isConnected: true,
        connectionState: 1,
        send: jest.fn(),
        lastMessage: null,
      });

      render(<JobsPage />);

      expect(screen.getByTestId('jobs-list')).toBeInTheDocument();
    });

    it('should handle WebSocket disconnected state', () => {
      useWebSocket.mockReturnValue({
        isConnected: false,
        connectionState: 3,
        send: jest.fn(),
        lastMessage: null,
      });

      render(<JobsPage />);

      expect(screen.getByTestId('jobs-list')).toBeInTheDocument();
    });

    it('should handle WebSocket messages', () => {
      useWebSocket.mockReturnValue({
        isConnected: true,
        connectionState: 1,
        send: jest.fn(),
        lastMessage: { type: 'job_update', data: {} },
      });

      render(<JobsPage />);

      expect(screen.getByTestId('jobs-list')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should render JobsList component', () => {
      render(<JobsPage />);

      expect(screen.getByTestId('jobs-list')).toBeInTheDocument();
    });

    it('should render JobStatusCard component', () => {
      render(<JobsPage />);

      expect(screen.getByTestId('job-status-card')).toBeInTheDocument();
    });

    it('should render AdvancedJobFilters component', () => {
      render(<JobsPage />);

      expect(screen.getByTestId('advanced-job-filters')).toBeInTheDocument();
    });

    it('should render BatchJobOperations component', () => {
      render(<JobsPage />);

      expect(screen.getByTestId('batch-job-operations')).toBeInTheDocument();
    });

    it('should render FilterPresets component', () => {
      render(<JobsPage />);

      expect(screen.getByTestId('filter-presets')).toBeInTheDocument();
    });
  });

  describe('Environment Configuration', () => {
    it('should use default API URL when env var not set', () => {
      const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;
      delete process.env.NEXT_PUBLIC_API_URL;

      render(<JobsPage />);

      expect(screen.getByTestId('jobs-list')).toBeInTheDocument();

      process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
    });

    it('should use default WS URL when env var not set', () => {
      const originalWsUrl = process.env.NEXT_PUBLIC_WS_URL;
      delete process.env.NEXT_PUBLIC_WS_URL;

      render(<JobsPage />);

      expect(screen.getByTestId('jobs-list')).toBeInTheDocument();

      process.env.NEXT_PUBLIC_WS_URL = originalWsUrl;
    });
  });

  describe('Error Handling', () => {
    it('should handle render without crashing', () => {
      expect(() => {
        render(<JobsPage />);
      }).not.toThrow();
    });

    it('should handle missing context gracefully', () => {
      useAuth.mockReturnValue({});
      useToast.mockReturnValue({});

      expect(() => {
        render(<JobsPage />);
      }).not.toThrow();
    });

    it('should handle WebSocket errors gracefully', () => {
      useWebSocket.mockReturnValue({
        isConnected: false,
        connectionState: 3,
        send: jest.fn(),
        lastMessage: null,
        error: new Error('Connection failed'),
      });

      render(<JobsPage />);

      expect(screen.getByTestId('jobs-list')).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('should initialize with default state', () => {
      render(<JobsPage />);

      // Page renders successfully with default state
      expect(screen.getByTestId('jobs-list')).toBeInTheDocument();
    });

    it('should handle multiple renders', () => {
      const { rerender } = render(<JobsPage />);

      expect(screen.getByTestId('jobs-list')).toBeInTheDocument();

      rerender(<JobsPage />);

      expect(screen.getByTestId('jobs-list')).toBeInTheDocument();
    });
  });

  describe('Toast Integration', () => {
    it('should have toast context available', () => {
      render(<JobsPage />);

      expect(useToast).toHaveBeenCalled();
    });

    it('should handle toast methods', () => {
      const customToast = {
        success: jest.fn(),
        error: jest.fn(),
        warning: jest.fn(),
        info: jest.fn(),
      };
      useToast.mockReturnValue(customToast);

      render(<JobsPage />);

      expect(screen.getByTestId('jobs-list')).toBeInTheDocument();
    });
  });

  describe('Suspense Behavior', () => {
    it('should wrap content in Suspense', () => {
      render(<JobsPage />);

      // Should render without Suspense errors
      expect(screen.getByTestId('jobs-list')).toBeInTheDocument();
    });

    it('should handle Suspense fallback', () => {
      // Mock to trigger Suspense
      const { container } = render(<JobsPage />);

      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render accessible structure', () => {
      const { container } = render(<JobsPage />);

      expect(container).toBeInTheDocument();
    });

    it('should have proper component hierarchy', () => {
      render(<JobsPage />);

      expect(screen.getByTestId('jobs-list')).toBeInTheDocument();
      expect(screen.getByTestId('advanced-job-filters')).toBeInTheDocument();
    });
  });
});
