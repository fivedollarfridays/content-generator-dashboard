/**
 * JobsList Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import JobsList from '../jobs-list';
import type { SyncJob } from '@/types/content-generator';

describe('JobsList', () => {
  const mockApiUrl = 'http://localhost:8000';
  const mockOnJobClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  // ========== Rendering Tests ==========

  describe('Rendering', () => {
    it('should render loading state initially', () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(<JobsList apiUrl={mockApiUrl} />);

      expect(screen.getByText(/Loading jobs/i)).toBeInTheDocument();
    });

    it('should render jobs when data is loaded', async () => {
      const mockJobs: SyncJob[] = [
        {
          job_id: 'job-1',
          document_id: 'doc-1',
          status: 'completed',
          channels: ['email'],
          content_type: 'update',
          template_style: 'modern',
          created_at: '2025-10-02T12:00:00Z',
        },
        {
          job_id: 'job-2',
          document_id: 'doc-2',
          status: 'in_progress',
          channels: ['website'],
          content_type: 'blog',
          template_style: 'classic',
          created_at: '2025-10-02T13:00:00Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jobs: mockJobs, total: 2 }),
      });

      render(<JobsList apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('job-1')).toBeInTheDocument();
        expect(screen.getByText('job-2')).toBeInTheDocument();
      });
    });

    it('should render empty state when no jobs', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jobs: [], total: 0 }),
      });

      render(<JobsList apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText(/No jobs found/i)).toBeInTheDocument();
      });
    });

    it('should render error state when fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      render(<JobsList apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load jobs/i)).toBeInTheDocument();
      });
    });
  });

  // ========== Job Status Tests ==========

  describe('Job Status Display', () => {
    it('should display completed status with green color', async () => {
      const mockJobs: SyncJob[] = [
        {
          job_id: 'job-1',
          document_id: 'doc-1',
          status: 'completed',
          channels: ['email'],
          content_type: 'update',
          template_style: 'modern',
          created_at: '2025-10-02T12:00:00Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jobs: mockJobs, total: 1 }),
      });

      render(<JobsList apiUrl={mockApiUrl} />);

      await waitFor(
        () => {
          const statusElement = screen.getByText('completed');
          expect(statusElement).toHaveClass('text-green-600');
        },
        { timeout: 3000 }
      );
    });

    it('should display failed status with red color', async () => {
      const mockJobs: SyncJob[] = [
        {
          job_id: 'job-1',
          document_id: 'doc-1',
          status: 'failed',
          channels: ['email'],
          content_type: 'update',
          template_style: 'modern',
          created_at: '2025-10-02T12:00:00Z',
          error: 'Generation failed',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jobs: mockJobs, total: 1 }),
      });

      render(<JobsList apiUrl={mockApiUrl} />);

      await waitFor(
        () => {
          const statusElement = screen.getByText('failed');
          expect(statusElement).toHaveClass('text-red-600');
        },
        { timeout: 3000 }
      );
    });

    it('should display in_progress status with blue color', async () => {
      const mockJobs: SyncJob[] = [
        {
          job_id: 'job-1',
          document_id: 'doc-1',
          status: 'in_progress',
          channels: ['email'],
          content_type: 'update',
          template_style: 'modern',
          created_at: '2025-10-02T12:00:00Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jobs: mockJobs, total: 1 }),
      });

      render(<JobsList apiUrl={mockApiUrl} />);

      await waitFor(
        () => {
          const statusElement = screen.getByText('in_progress');
          expect(statusElement).toHaveClass('text-blue-600');
        },
        { timeout: 3000 }
      );
    });
  });

  // ========== Interaction Tests ==========

  describe('Job Interactions', () => {
    it('should call onJobClick when job is clicked', async () => {
      const mockJob: SyncJob = {
        job_id: 'job-1',
        document_id: 'doc-1',
        status: 'completed',
        channels: ['email'],
        content_type: 'update',
        template_style: 'modern',
        created_at: '2025-10-02T12:00:00Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jobs: [mockJob], total: 1 }),
      });

      render(<JobsList apiUrl={mockApiUrl} onJobClick={mockOnJobClick} />);

      await waitFor(
        () => {
          const jobElement = screen.getByText('job-1').closest('.job-card');
          expect(jobElement).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      const jobElement = screen.getByText('job-1').closest('.job-card');
      fireEvent.click(jobElement!);

      expect(mockOnJobClick).toHaveBeenCalledWith(mockJob);
    });
  });

  // ========== Pagination Tests ==========

  describe('Pagination', () => {
    it('should respect pageSize prop', async () => {
      const mockJobs: SyncJob[] = Array.from({ length: 50 }, (_, i) => ({
        job_id: `job-${i}`,
        document_id: `doc-${i}`,
        status: 'completed',
        channels: ['email'],
        content_type: 'update',
        template_style: 'modern',
        created_at: '2025-10-02T12:00:00Z',
      }));

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jobs: mockJobs.slice(0, 10), total: 50 }),
      });

      render(<JobsList apiUrl={mockApiUrl} pageSize={10} />);

      await waitFor(() => {
        const jobElements = screen.getAllByText(/job-/);
        expect(jobElements.length).toBeLessThanOrEqual(10);
      });
    });
  });

  // ========== Auto-Refresh Tests ==========

  describe('Auto-Refresh', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should refresh jobs at specified interval', async () => {
      const mockJobs: SyncJob[] = [
        {
          job_id: 'job-1',
          document_id: 'doc-1',
          status: 'in_progress',
          channels: ['email'],
          content_type: 'update',
          template_style: 'modern',
          created_at: '2025-10-02T12:00:00Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ jobs: mockJobs, total: 1 }),
      });

      render(<JobsList apiUrl={mockApiUrl} refreshInterval={5000} />);

      // Initial fetch
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Fast forward 5 seconds
      jest.advanceTimersByTime(5000);

      // Should fetch again
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ========== Channel Display Tests ==========

  describe('Channel Display', () => {
    it('should display job channels', async () => {
      const mockJobs: SyncJob[] = [
        {
          job_id: 'job-1',
          document_id: 'doc-1',
          status: 'completed',
          channels: ['email', 'website', 'social_twitter'],
          content_type: 'update',
          template_style: 'modern',
          created_at: '2025-10-02T12:00:00Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jobs: mockJobs, total: 1 }),
      });

      render(<JobsList apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText(/email/i)).toBeInTheDocument();
        expect(screen.getByText(/website/i)).toBeInTheDocument();
        expect(screen.getByText(/twitter/i)).toBeInTheDocument();
      });
    });
  });

  // ========== Date Formatting Tests ==========

  describe('Date Formatting', () => {
    it('should format created_at date correctly', async () => {
      const mockJobs: SyncJob[] = [
        {
          job_id: 'job-1',
          document_id: 'doc-1',
          status: 'completed',
          channels: ['email'],
          content_type: 'update',
          template_style: 'modern',
          created_at: '2025-10-02T12:00:00Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jobs: mockJobs, total: 1 }),
      });

      render(<JobsList apiUrl={mockApiUrl} />);

      await waitFor(
        () => {
          // Date should be formatted in some human-readable way
          expect(screen.getByText(/2025/)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  // ========== Error Message Display Tests ==========

  describe('Error Message Display', () => {
    it('should display error message for failed jobs', async () => {
      const mockJobs: SyncJob[] = [
        {
          job_id: 'job-1',
          document_id: 'doc-1',
          status: 'failed',
          channels: ['email'],
          content_type: 'update',
          template_style: 'modern',
          created_at: '2025-10-02T12:00:00Z',
          error: 'API timeout',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jobs: mockJobs, total: 1 }),
      });

      render(<JobsList apiUrl={mockApiUrl} />);

      await waitFor(
        () => {
          expect(screen.getByText('API timeout')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });
});
