/**
 * History Page Tests
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import HistoryPage from '../page';
import type { SyncJob } from '@/types/content-generator';

// Mock jobs data
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
    completed_at: '2025-10-08T12:05:00Z',
  },
  {
    job_id: 'job-2',
    document_id: 'doc-2',
    status: 'failed',
    channels: ['website'],
    content_type: 'blog',
    template_style: 'classic',
    created_at: '2025-10-08T11:00:00Z',
    updated_at: '2025-10-08T11:05:00Z',
    error: 'Generation failed',
  },
  {
    job_id: 'job-3',
    document_id: 'doc-3',
    status: 'pending',
    channels: ['social'],
    content_type: 'update',
    template_style: 'modern',
    created_at: '2025-10-08T10:00:00Z',
    updated_at: '2025-10-08T10:00:00Z',
  },
];

// Mock API client
jest.mock('@/lib/api/api-client', () => ({
  ContentGeneratorAPI: jest.fn().mockImplementation(() => ({
    listJobs: jest.fn().mockResolvedValue({
      success: true,
      data: {
        jobs: mockJobs,
        total: 3,
      },
    }),
    retryJob: jest.fn().mockResolvedValue({
      success: true,
      data: { job_id: 'job-2' },
    }),
    cancelJob: jest.fn().mockResolvedValue({
      success: true,
      data: { job_id: 'job-3' },
    }),
  })),
}));

// Mock toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}));

// Mock dynamic imports
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (fn: any) => {
    const Component = fn();
    return Component;
  },
}));

// Mock JobTimeline component
jest.mock('@/app/components/features/job-timeline', () => {
  return function MockJobTimeline({ jobs, onJobClick }: any) {
    return (
      <div data-testid="job-timeline">
        {jobs.map((job: SyncJob) => (
          <button
            key={job.job_id}
            data-testid={`job-${job.job_id}`}
            onClick={() => onJobClick(job)}
          >
            {job.job_id}
          </button>
        ))}
      </div>
    );
  };
});

// Mock JobDetailModal
jest.mock('@/app/components/features/job-detail-modal', () => {
  return function MockJobDetailModal({ job, isOpen, onClose, onRetry, onCancel }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="job-detail-modal">
        <h3>Job: {job?.job_id}</h3>
        <button onClick={onClose}>Close</button>
        {onRetry && <button onClick={() => onRetry(job)}>Retry</button>}
        {onCancel && <button onClick={() => onCancel(job)}>Cancel</button>}
      </div>
    );
  };
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => 'test-api-key'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('HistoryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('test-api-key');
  });

  describe('Initial Rendering', () => {
    it('should render page title', async () => {
      render(<HistoryPage />);

      await waitFor(() => {
        expect(screen.getByText(/Job History/i)).toBeInTheDocument();
      });
    });

    it('should load API key from localStorage', async () => {
      render(<HistoryPage />);

      await waitFor(() => {
        expect(localStorageMock.getItem).toHaveBeenCalledWith('api_key');
      });
    });

    it('should fetch jobs on mount', async () => {
      const { ContentGeneratorAPI } = require('@/lib/api/api-client');
      const mockApi = new ContentGeneratorAPI();

      render(<HistoryPage />);

      await waitFor(() => {
        expect(mockApi.listJobs).toHaveBeenCalledWith({ limit: 500 });
      });
    });

    it('should render job timeline', async () => {
      render(<HistoryPage />);

      await waitFor(() => {
        expect(screen.getByTestId('job-timeline')).toBeInTheDocument();
      });
    });
  });

  describe('Job Display', () => {
    it('should display all jobs', async () => {
      render(<HistoryPage />);

      await waitFor(() => {
        expect(screen.getByTestId('job-job-1')).toBeInTheDocument();
        expect(screen.getByTestId('job-job-2')).toBeInTheDocument();
        expect(screen.getByTestId('job-job-3')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter jobs by job_id', async () => {
      render(<HistoryPage />);

      await waitFor(() => {
        expect(screen.getByTestId('job-job-1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search by job ID or document ID/i);
      await userEvent.type(searchInput, 'job-1');

      await waitFor(() => {
        expect(screen.getByTestId('job-job-1')).toBeInTheDocument();
        expect(screen.queryByTestId('job-job-2')).not.toBeInTheDocument();
      });
    });

    it('should filter jobs by document_id', async () => {
      render(<HistoryPage />);

      await waitFor(() => {
        expect(screen.getByTestId('job-job-2')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search by job ID or document ID/i);
      await userEvent.type(searchInput, 'doc-2');

      await waitFor(() => {
        expect(screen.getByTestId('job-job-2')).toBeInTheDocument();
        expect(screen.queryByTestId('job-job-1')).not.toBeInTheDocument();
      });
    });

    it('should be case-insensitive', async () => {
      render(<HistoryPage />);

      await waitFor(() => {
        expect(screen.getByTestId('job-job-1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search by job ID or document ID/i);
      await userEvent.type(searchInput, 'JOB-1');

      await waitFor(() => {
        expect(screen.getByTestId('job-job-1')).toBeInTheDocument();
      });
    });
  });

  describe('Status Filtering', () => {
    it('should filter by completed status', async () => {
      render(<HistoryPage />);

      await waitFor(() => {
        expect(screen.getByTestId('job-job-1')).toBeInTheDocument();
      });

      const statusSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(statusSelect, 'completed');

      await waitFor(() => {
        expect(screen.getByTestId('job-job-1')).toBeInTheDocument();
        expect(screen.queryByTestId('job-job-2')).not.toBeInTheDocument();
      });
    });

    it('should show all jobs when filter is "all"', async () => {
      render(<HistoryPage />);

      await waitFor(() => {
        expect(screen.getByTestId('job-job-1')).toBeInTheDocument();
      });

      const statusSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(statusSelect, 'all');

      await waitFor(() => {
        expect(screen.getByTestId('job-job-1')).toBeInTheDocument();
        expect(screen.getByTestId('job-job-2')).toBeInTheDocument();
        expect(screen.getByTestId('job-job-3')).toBeInTheDocument();
      });
    });
  });

  describe('Job Detail Modal', () => {
    it('should open modal when job is clicked', async () => {
      render(<HistoryPage />);

      await waitFor(() => {
        expect(screen.getByTestId('job-job-1')).toBeInTheDocument();
      });

      const jobButton = screen.getByTestId('job-job-1');
      fireEvent.click(jobButton);

      await waitFor(() => {
        expect(screen.getByTestId('job-detail-modal')).toBeInTheDocument();
        expect(screen.getByText('Job: job-1')).toBeInTheDocument();
      });
    });

    it('should close modal when close button is clicked', async () => {
      render(<HistoryPage />);

      await waitFor(() => {
        const jobButton = screen.getByTestId('job-job-1');
        fireEvent.click(jobButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('job-detail-modal')).toBeInTheDocument();
      });

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('job-detail-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { ContentGeneratorAPI } = require('@/lib/api/api-client');
      ContentGeneratorAPI.mockImplementationOnce(() => ({
        listJobs: jest.fn().mockResolvedValue({
          success: false,
          error: { message: 'API Error' },
        }),
      }));

      const { toast } = require('react-hot-toast');

      render(<HistoryPage />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to load job history');
      });
    });

    it('should handle fetch exceptions', async () => {
      const { ContentGeneratorAPI } = require('@/lib/api/api-client');
      ContentGeneratorAPI.mockImplementationOnce(() => ({
        listJobs: jest.fn().mockRejectedValue(new Error('Network error')),
      }));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const { toast } = require('react-hot-toast');

      render(<HistoryPage />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error loading job history');
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Loading State', () => {
    it('should show loading state initially', () => {
      render(<HistoryPage />);

      // Loading skeleton should be shown
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should hide loading state after data loads', async () => {
      render(<HistoryPage />);

      await waitFor(() => {
        expect(screen.getByTestId('job-timeline')).toBeInTheDocument();
      });
    });
  });
});
