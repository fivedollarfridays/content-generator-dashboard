/**
 * BatchJobOperations Component Tests
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BatchJobOperations } from '../batch-job-operations';
import type { SyncJob } from '@/types/content-generator';

const createMockJob = (id: string, status: SyncJob['status']): SyncJob => ({
  job_id: id,
  document_id: `doc-${id}`,
  status,
  channels: ['email'],
  created_at: '2025-01-01T00:00:00Z',
  progress: { percent: status === 'completed' ? 100 : 50, message: 'Processing' },
});

describe('BatchJobOperations', () => {
  const mockOnClearSelection = jest.fn();
  const mockOnBatchRetry = jest.fn();
  const mockOnBatchCancel = jest.fn();
  const mockOnBatchExport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when no jobs selected', () => {
      const { container } = render(
        <BatchJobOperations
          selectedJobs={[]}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render toolbar when jobs are selected', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      expect(screen.getByText('1 job selected')).toBeInTheDocument();
    });

    it('should show correct plural for multiple jobs', () => {
      const jobs = [
        createMockJob('1', 'completed'),
        createMockJob('2', 'completed'),
      ];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      expect(screen.getByText('2 jobs selected')).toBeInTheDocument();
    });

    it('should render fixed position toolbar', () => {
      const jobs = [createMockJob('1', 'completed')];

      const { container } = render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      const toolbar = container.firstChild;
      expect(toolbar).toHaveClass('fixed');
      expect(toolbar).toHaveClass('bottom-0');
    });
  });

  describe('Job Status Badges', () => {
    it('should show failed jobs badge', () => {
      const jobs = [
        createMockJob('1', 'failed'),
        createMockJob('2', 'completed'),
      ];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      expect(screen.getByText('1 failed')).toBeInTheDocument();
    });

    it('should show active jobs badge for pending', () => {
      const jobs = [
        createMockJob('1', 'pending'),
        createMockJob('2', 'completed'),
      ];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      expect(screen.getByText('1 active')).toBeInTheDocument();
    });

    it('should show active jobs badge for in_progress', () => {
      const jobs = [createMockJob('1', 'in_progress')];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      expect(screen.getByText('1 active')).toBeInTheDocument();
    });

    it('should show both failed and active badges', () => {
      const jobs = [
        createMockJob('1', 'failed'),
        createMockJob('2', 'pending'),
      ];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      expect(screen.getByText('1 failed')).toBeInTheDocument();
      expect(screen.getByText('1 active')).toBeInTheDocument();
    });
  });

  describe('Batch Retry', () => {
    it('should show retry button when failed jobs exist', () => {
      const jobs = [createMockJob('1', 'failed')];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      expect(screen.getByText(/Retry \(1\)/)).toBeInTheDocument();
    });

    it('should not show retry button when no failed jobs', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      expect(screen.queryByText(/Retry/)).not.toBeInTheDocument();
    });

    it('should call onBatchRetry with failed job IDs', async () => {
      const user = userEvent.setup();
      const jobs = [
        createMockJob('1', 'failed'),
        createMockJob('2', 'completed'),
      ];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      const retryButton = screen.getByText(/Retry \(1\)/);
      await user.click(retryButton);

      await waitFor(() => {
        expect(mockOnBatchRetry).toHaveBeenCalledWith(['1']);
      });
    });

    it('should show correct count for multiple failed jobs', () => {
      const jobs = [
        createMockJob('1', 'failed'),
        createMockJob('2', 'failed'),
        createMockJob('3', 'completed'),
      ];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      expect(screen.getByText(/Retry \(2\)/)).toBeInTheDocument();
    });
  });

  describe('Batch Cancel', () => {
    it('should show cancel button for pending jobs', () => {
      const jobs = [createMockJob('1', 'pending')];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      expect(screen.getByText(/Cancel \(1\)/)).toBeInTheDocument();
    });

    it('should show cancel button for in_progress jobs', () => {
      const jobs = [createMockJob('1', 'in_progress')];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      expect(screen.getByText(/Cancel \(1\)/)).toBeInTheDocument();
    });

    it('should not show cancel button for completed jobs', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      expect(screen.queryByText(/Cancel/)).not.toBeInTheDocument();
    });

    it('should call onBatchCancel with cancellable job IDs', async () => {
      const user = userEvent.setup();
      const jobs = [
        createMockJob('1', 'pending'),
        createMockJob('2', 'in_progress'),
        createMockJob('3', 'completed'),
      ];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      const cancelButton = screen.getByText(/Cancel \(2\)/);
      await user.click(cancelButton);

      await waitFor(() => {
        expect(mockOnBatchCancel).toHaveBeenCalledWith(['1', '2']);
      });
    });
  });

  describe('Batch Export', () => {
    it('should show export button', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      expect(screen.getByText('Export')).toBeInTheDocument();
    });

    it('should toggle export menu on button click', async () => {
      const user = userEvent.setup();
      const jobs = [createMockJob('1', 'completed')];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      const exportButton = screen.getByText('Export');
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Export as CSV')).toBeInTheDocument();
        expect(screen.getByText('Export as JSON')).toBeInTheDocument();
      });
    });

    it('should call onBatchExport with CSV format', async () => {
      const user = userEvent.setup();
      const jobs = [createMockJob('1', 'completed')];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      const exportButton = screen.getByText('Export');
      await user.click(exportButton);

      const csvButton = screen.getByText('Export as CSV');
      await user.click(csvButton);

      expect(mockOnBatchExport).toHaveBeenCalledWith(jobs, 'csv');
    });

    it('should call onBatchExport with JSON format', async () => {
      const user = userEvent.setup();
      const jobs = [createMockJob('1', 'completed')];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      const exportButton = screen.getByText('Export');
      await user.click(exportButton);

      const jsonButton = screen.getByText('Export as JSON');
      await user.click(jsonButton);

      expect(mockOnBatchExport).toHaveBeenCalledWith(jobs, 'json');
    });

    it('should close menu after export', async () => {
      const user = userEvent.setup();
      const jobs = [createMockJob('1', 'completed')];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      const exportButton = screen.getByText('Export');
      await user.click(exportButton);

      const csvButton = screen.getByText('Export as CSV');
      await user.click(csvButton);

      await waitFor(() => {
        expect(screen.queryByText('Export as CSV')).not.toBeInTheDocument();
      });
    });
  });

  describe('Clear Selection', () => {
    it('should show clear selection button', () => {
      const jobs = [createMockJob('1', 'completed')];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('should call onClearSelection when clicked', async () => {
      const user = userEvent.setup();
      const jobs = [createMockJob('1', 'completed')];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      const clearButton = screen.getByText('Clear');
      await user.click(clearButton);

      expect(mockOnClearSelection).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle only failed jobs', () => {
      const jobs = [createMockJob('1', 'failed'), createMockJob('2', 'failed')];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      expect(screen.getByText(/Retry \(2\)/)).toBeInTheDocument();
      expect(screen.queryByText(/Cancel/)).not.toBeInTheDocument();
    });

    it('should handle only active jobs', () => {
      const jobs = [
        createMockJob('1', 'pending'),
        createMockJob('2', 'in_progress'),
      ];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      expect(screen.getByText(/Cancel \(2\)/)).toBeInTheDocument();
      expect(screen.queryByText(/Retry/)).not.toBeInTheDocument();
    });

    it('should handle mixed job statuses', () => {
      const jobs = [
        createMockJob('1', 'failed'),
        createMockJob('2', 'pending'),
        createMockJob('3', 'completed'),
      ];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      expect(screen.getByText(/Retry \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/Cancel \(1\)/)).toBeInTheDocument();
    });

    it('should handle rapid menu toggle', async () => {
      const user = userEvent.setup({ delay: null });
      const jobs = [createMockJob('1', 'completed')];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      const exportButton = screen.getByText('Export');

      // Rapid clicks
      await user.click(exportButton);
      await user.click(exportButton);
      await user.click(exportButton);

      // Menu should toggle based on odd number of clicks
      expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible buttons', () => {
      const jobs = [
        createMockJob('1', 'failed'),
        createMockJob('2', 'pending'),
      ];

      render(
        <BatchJobOperations
          selectedJobs={jobs}
          onClearSelection={mockOnClearSelection}
          onBatchRetry={mockOnBatchRetry}
          onBatchCancel={mockOnBatchCancel}
          onBatchExport={mockOnBatchExport}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach(button => {
        expect(button).toBeEnabled();
      });
    });
  });
});
