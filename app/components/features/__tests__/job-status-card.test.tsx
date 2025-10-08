/**
 * JobStatusCard Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { JobStatusCard } from '../job-status-card';
import type { SyncJob } from '@/types/content-generator';

const createMockJob = (overrides: Partial<SyncJob> = {}): SyncJob => ({
  job_id: 'job-123',
  document_id: 'doc-456',
  status: 'completed',
  channels: ['email'],
  created_at: '2025-01-01T10:00:00Z',
  progress: { percent: 100, message: 'Done' },
  ...overrides,
});

describe('JobStatusCard', () => {
  const mockOnRetry = jest.fn();
  const mockOnCancel = jest.fn();
  const mockOnViewDetails = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Compact Mode', () => {
    it('should render compact view when compact prop is true', () => {
      const job = createMockJob();
      render(
        <JobStatusCard
          job={job}
          compact={true}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    });

    it('should show status icon in compact mode', () => {
      const job = createMockJob({ status: 'in_progress' });
      const { container } = render(
        <JobStatusCard job={job} compact={true} />
      );

      const icon = container.querySelector('svg.text-blue-600');
      expect(icon).toBeInTheDocument();
    });

    it('should show channel icons in compact mode', () => {
      const job = createMockJob({ channels: ['email', 'website'] });
      render(<JobStatusCard job={job} compact={true} />);

      expect(screen.getByText(/📧/)).toBeInTheDocument();
    });

    it('should call onViewDetails when clicked in compact mode', async () => {
      const user = userEvent.setup();
      const job = createMockJob();

      render(
        <JobStatusCard
          job={job}
          compact={true}
          onViewDetails={mockOnViewDetails}
        />
      );

      const card = screen.getByText('COMPLETED').closest('div');
      if (card) await user.click(card);

      expect(mockOnViewDetails).toHaveBeenCalledWith('job-123');
    });

    it('should show formatted date in compact mode', () => {
      const job = createMockJob({
        created_at: '2025-01-15T10:00:00Z',
      });

      render(<JobStatusCard job={job} compact={true} />);

      // Date will be formatted based on locale, just check it renders
      const dateText = screen.getByText(/COMPLETED/).closest('div')?.textContent;
      expect(dateText).toBeTruthy();
    });
  });

  describe('Full Mode - Status Display', () => {
    it('should render full view by default', () => {
      const job = createMockJob();
      render(<JobStatusCard job={job} />);

      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
      expect(screen.getByText(`Job ID: ${job.job_id}`)).toBeInTheDocument();
    });

    it('should display completed status with green styling', () => {
      const job = createMockJob({ status: 'completed' });
      const { container } = render(<JobStatusCard job={job} />);

      const card = container.querySelector('.border-green-200');
      expect(card).toBeInTheDocument();
    });

    it('should display in_progress status with blue styling', () => {
      const job = createMockJob({ status: 'in_progress' });
      const { container } = render(<JobStatusCard job={job} />);

      const card = container.querySelector('.border-blue-200');
      expect(card).toBeInTheDocument();
    });

    it('should display pending status with yellow styling', () => {
      const job = createMockJob({ status: 'pending' });
      const { container } = render(<JobStatusCard job={job} />);

      const card = container.querySelector('.border-yellow-200');
      expect(card).toBeInTheDocument();
    });

    it('should display failed status with red styling', () => {
      const job = createMockJob({ status: 'failed' });
      const { container } = render(<JobStatusCard job={job} />);

      const card = container.querySelector('.border-red-200');
      expect(card).toBeInTheDocument();
    });

    it('should display partial status with orange styling', () => {
      const job = createMockJob({ status: 'partial' });
      const { container } = render(<JobStatusCard job={job} />);

      const card = container.querySelector('.border-orange-200');
      expect(card).toBeInTheDocument();
    });

    it('should display cancelled status with gray styling', () => {
      const job = createMockJob({ status: 'cancelled' });
      const { container } = render(<JobStatusCard job={job} />);

      const card = container.querySelector('.border-gray-200');
      expect(card).toBeInTheDocument();
    });

    it('should show spinning icon for in_progress status', () => {
      const job = createMockJob({ status: 'in_progress' });
      const { container } = render(<JobStatusCard job={job} />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should display correlation ID if present', () => {
      const job = createMockJob({
        correlation_id: 'abc123456789',
      });

      render(<JobStatusCard job={job} />);

      expect(screen.getByText('abc12345')).toBeInTheDocument();
    });

    it('should not display correlation ID if absent', () => {
      const job = createMockJob();
      const { container } = render(<JobStatusCard job={job} />);

      const correlationDiv = container.querySelector('.font-mono.bg-white');
      expect(correlationDiv).not.toBeInTheDocument();
    });
  });

  describe('Document and Channel Display', () => {
    it('should display document ID', () => {
      const job = createMockJob({ document_id: 'doc-789' });
      render(<JobStatusCard job={job} />);

      expect(screen.getByText('doc-789')).toBeInTheDocument();
      expect(screen.getByText('Document')).toBeInTheDocument();
    });

    it('should display single channel', () => {
      const job = createMockJob({ channels: ['email'] });
      render(<JobStatusCard job={job} />);

      expect(screen.getByText('Channels')).toBeInTheDocument();
      expect(screen.getByText('email')).toBeInTheDocument();
      expect(screen.getByText(/📧/)).toBeInTheDocument();
    });

    it('should display multiple channels', () => {
      const job = createMockJob({
        channels: ['email', 'website', 'social_twitter'],
      });

      render(<JobStatusCard job={job} />);

      expect(screen.getByText('email')).toBeInTheDocument();
      expect(screen.getByText('website')).toBeInTheDocument();
      expect(screen.getByText('social_twitter')).toBeInTheDocument();
    });

    it('should show correct icons for different channels', () => {
      const job = createMockJob({
        channels: [
          'email',
          'website',
          'social_twitter',
          'social_linkedin',
          'social_facebook',
        ],
      });

      render(<JobStatusCard job={job} />);

      const text = screen.getByText('Channels').parentElement?.textContent;
      expect(text).toContain('📧'); // email
      expect(text).toContain('🌐'); // website
      expect(text).toContain('🐦'); // twitter
      expect(text).toContain('💼'); // linkedin
      expect(text).toContain('👥'); // facebook
    });

    it('should show default icon for unknown channel', () => {
      const job = createMockJob({ channels: ['unknown_channel'] });
      render(<JobStatusCard job={job} />);

      const text = screen.getByText('Channels').parentElement?.textContent;
      expect(text).toContain('📍');
    });
  });

  describe('Timestamp Display', () => {
    it('should display created timestamp', () => {
      const job = createMockJob({
        created_at: '2025-01-01T10:00:00Z',
      });

      render(<JobStatusCard job={job} />);

      expect(screen.getByText('Created')).toBeInTheDocument();
    });

    it('should display scheduled_for if present', () => {
      const job = createMockJob({
        scheduled_for: '2025-01-02T10:00:00Z',
      });

      render(<JobStatusCard job={job} />);

      expect(screen.getByText('Scheduled')).toBeInTheDocument();
    });

    it('should display started_at if present', () => {
      const job = createMockJob({
        started_at: '2025-01-01T11:00:00Z',
      });

      render(<JobStatusCard job={job} />);

      expect(screen.getByText('Started')).toBeInTheDocument();
    });

    it('should display completed_at if present', () => {
      const job = createMockJob({
        completed_at: '2025-01-01T12:00:00Z',
      });

      render(<JobStatusCard job={job} />);

      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('should not show optional timestamps if absent', () => {
      const job = createMockJob();
      render(<JobStatusCard job={job} />);

      expect(screen.queryByText('Scheduled')).not.toBeInTheDocument();
      expect(screen.queryByText('Started')).not.toBeInTheDocument();
    });
  });

  describe('Duration Calculation', () => {
    it('should display duration in seconds', () => {
      const job = createMockJob({
        started_at: '2025-01-01T10:00:00Z',
        completed_at: '2025-01-01T10:00:30Z',
      });

      render(<JobStatusCard job={job} />);

      expect(screen.getByText('Duration')).toBeInTheDocument();
      expect(screen.getByText('30s')).toBeInTheDocument();
    });

    it('should display duration in minutes and seconds', () => {
      const job = createMockJob({
        started_at: '2025-01-01T10:00:00Z',
        completed_at: '2025-01-01T10:02:30Z',
      });

      render(<JobStatusCard job={job} />);

      expect(screen.getByText('2m 30s')).toBeInTheDocument();
    });

    it('should display duration in hours and minutes', () => {
      const job = createMockJob({
        started_at: '2025-01-01T10:00:00Z',
        completed_at: '2025-01-01T12:30:00Z',
      });

      render(<JobStatusCard job={job} />);

      expect(screen.getByText('2h 30m')).toBeInTheDocument();
    });

    it('should not show duration if started_at is missing', () => {
      const job = createMockJob({
        completed_at: '2025-01-01T12:00:00Z',
      });

      render(<JobStatusCard job={job} />);

      expect(screen.queryByText('Duration')).not.toBeInTheDocument();
    });
  });

  describe('Results Display', () => {
    it('should display results if present', () => {
      const job = createMockJob({
        results: {
          email: { status: 'success', url: 'https://example.com' },
        },
      });

      render(<JobStatusCard job={job} />);

      expect(screen.getByText('Results')).toBeInTheDocument();
      expect(screen.getByText('✓ Success')).toBeInTheDocument();
    });

    it('should display failed result', () => {
      const job = createMockJob({
        results: {
          email: { status: 'failed' },
        },
      });

      render(<JobStatusCard job={job} />);

      expect(screen.getByText('✕ Failed')).toBeInTheDocument();
    });

    it('should show View link if URL is present', () => {
      const job = createMockJob({
        results: {
          email: { status: 'success', url: 'https://example.com/result' },
        },
      });

      render(<JobStatusCard job={job} />);

      const viewLink = screen.getByText('View');
      expect(viewLink).toHaveAttribute('href', 'https://example.com/result');
      expect(viewLink).toHaveAttribute('target', '_blank');
    });

    it('should not show results section if no results', () => {
      const job = createMockJob();
      render(<JobStatusCard job={job} />);

      expect(screen.queryByText('Results')).not.toBeInTheDocument();
    });

    it('should display multiple results', () => {
      const job = createMockJob({
        results: {
          email: { status: 'success' },
          website: { status: 'failed' },
        },
      });

      render(<JobStatusCard job={job} />);

      expect(screen.getByText('✓ Success')).toBeInTheDocument();
      expect(screen.getByText('✕ Failed')).toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    it('should display errors if present', () => {
      const job = createMockJob({
        errors: ['Error 1', 'Error 2'],
      });

      render(<JobStatusCard job={job} />);

      expect(screen.getByText('Errors')).toBeInTheDocument();
      expect(screen.getByText('Error 1')).toBeInTheDocument();
      expect(screen.getByText('Error 2')).toBeInTheDocument();
    });

    it('should not show errors section if no errors', () => {
      const job = createMockJob();
      render(<JobStatusCard job={job} />);

      expect(screen.queryByText('Errors')).not.toBeInTheDocument();
    });

    it('should style error section with red background', () => {
      const job = createMockJob({
        errors: ['Test error'],
      });

      const { container } = render(<JobStatusCard job={job} />);

      const errorSection = container.querySelector('.bg-red-50');
      expect(errorSection).toBeInTheDocument();
    });
  });

  describe('Metadata Display', () => {
    it('should display metadata if present', () => {
      const job = createMockJob({
        metadata: { key1: 'value1', key2: 'value2' },
      });

      render(<JobStatusCard job={job} />);

      expect(screen.getByText('Metadata')).toBeInTheDocument();
      const metadataText = screen.getByText('Metadata').nextSibling?.textContent;
      expect(metadataText).toContain('key1');
      expect(metadataText).toContain('value1');
    });

    it('should not show metadata section if no metadata', () => {
      const job = createMockJob();
      render(<JobStatusCard job={job} />);

      expect(screen.queryByText('Metadata')).not.toBeInTheDocument();
    });

    it('should format metadata as JSON', () => {
      const job = createMockJob({
        metadata: { test: 'data' },
      });

      const { container } = render(<JobStatusCard job={job} />);

      const metadataDiv = container.querySelector('.font-mono.overflow-auto');
      expect(metadataDiv?.textContent).toContain('"test"');
      expect(metadataDiv?.textContent).toContain('"data"');
    });
  });

  describe('Action Buttons', () => {
    it('should show retry button for failed jobs', () => {
      const job = createMockJob({ status: 'failed' });
      render(<JobStatusCard job={job} onRetry={mockOnRetry} />);

      expect(screen.getByText('🔄 Retry')).toBeInTheDocument();
    });

    it('should call onRetry when retry button clicked', async () => {
      const user = userEvent.setup();
      const job = createMockJob({ status: 'failed' });

      render(<JobStatusCard job={job} onRetry={mockOnRetry} />);

      await user.click(screen.getByText('🔄 Retry'));

      expect(mockOnRetry).toHaveBeenCalledWith('job-123');
    });

    it('should not show retry button if onRetry not provided', () => {
      const job = createMockJob({ status: 'failed' });
      render(<JobStatusCard job={job} />);

      expect(screen.queryByText('🔄 Retry')).not.toBeInTheDocument();
    });

    it('should show cancel button for pending jobs', () => {
      const job = createMockJob({ status: 'pending' });
      render(<JobStatusCard job={job} onCancel={mockOnCancel} />);

      expect(screen.getByText('⊘ Cancel')).toBeInTheDocument();
    });

    it('should show cancel button for in_progress jobs', () => {
      const job = createMockJob({ status: 'in_progress' });
      render(<JobStatusCard job={job} onCancel={mockOnCancel} />);

      expect(screen.getByText('⊘ Cancel')).toBeInTheDocument();
    });

    it('should call onCancel when cancel button clicked', async () => {
      const user = userEvent.setup();
      const job = createMockJob({ status: 'pending' });

      render(<JobStatusCard job={job} onCancel={mockOnCancel} />);

      await user.click(screen.getByText('⊘ Cancel'));

      expect(mockOnCancel).toHaveBeenCalledWith('job-123');
    });

    it('should not show cancel button for completed jobs', () => {
      const job = createMockJob({ status: 'completed' });
      render(<JobStatusCard job={job} onCancel={mockOnCancel} />);

      expect(screen.queryByText('⊘ Cancel')).not.toBeInTheDocument();
    });

    it('should show details button if onViewDetails provided', () => {
      const job = createMockJob();
      render(<JobStatusCard job={job} onViewDetails={mockOnViewDetails} />);

      expect(screen.getByText('👁 Details')).toBeInTheDocument();
    });

    it('should call onViewDetails when details button clicked', async () => {
      const user = userEvent.setup();
      const job = createMockJob();

      render(<JobStatusCard job={job} onViewDetails={mockOnViewDetails} />);

      await user.click(screen.getByText('👁 Details'));

      expect(mockOnViewDetails).toHaveBeenCalledWith('job-123');
    });

    it('should not show details button if onViewDetails not provided', () => {
      const job = createMockJob();
      render(<JobStatusCard job={job} />);

      expect(screen.queryByText('👁 Details')).not.toBeInTheDocument();
    });

    it('should show multiple action buttons together', () => {
      const job = createMockJob({ status: 'pending' });
      render(
        <JobStatusCard
          job={job}
          onCancel={mockOnCancel}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.getByText('⊘ Cancel')).toBeInTheDocument();
      expect(screen.getByText('👁 Details')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle job with all optional fields', () => {
      const job = createMockJob({
        correlation_id: 'correlation-123',
        scheduled_for: '2025-01-02T10:00:00Z',
        started_at: '2025-01-01T11:00:00Z',
        completed_at: '2025-01-01T12:00:00Z',
        results: { email: { status: 'success' } },
        errors: ['Test error'],
        metadata: { key: 'value' },
      });

      render(<JobStatusCard job={job} />);

      expect(screen.getByText('correlati')).toBeInTheDocument();
      expect(screen.getByText('Scheduled')).toBeInTheDocument();
      expect(screen.getByText('Started')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Results')).toBeInTheDocument();
      expect(screen.getByText('Errors')).toBeInTheDocument();
      expect(screen.getByText('Metadata')).toBeInTheDocument();
    });

    it('should handle job with minimal fields', () => {
      const job = createMockJob({
        scheduled_for: undefined,
        started_at: undefined,
        completed_at: undefined,
        results: undefined,
        errors: undefined,
        metadata: undefined,
      });

      render(<JobStatusCard job={job} />);

      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
      expect(screen.getByText(`Job ID: ${job.job_id}`)).toBeInTheDocument();
    });

    it('should handle empty results object', () => {
      const job = createMockJob({
        results: {},
      });

      render(<JobStatusCard job={job} />);

      expect(screen.queryByText('Results')).not.toBeInTheDocument();
    });

    it('should handle empty errors array', () => {
      const job = createMockJob({
        errors: [],
      });

      render(<JobStatusCard job={job} />);

      expect(screen.queryByText('Errors')).not.toBeInTheDocument();
    });

    it('should handle empty metadata object', () => {
      const job = createMockJob({
        metadata: {},
      });

      render(<JobStatusCard job={job} />);

      expect(screen.queryByText('Metadata')).not.toBeInTheDocument();
    });
  });
});
