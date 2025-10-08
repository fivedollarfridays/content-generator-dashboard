/**
 * AdvancedJobFilters Component Tests
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AdvancedJobFilters, type JobFilterState } from '../advanced-job-filters';

const createInitialFilters = (): JobFilterState => ({
  search: '',
  status: 'all',
  channels: [],
  dateRange: { from: '', to: '' },
});

describe('AdvancedJobFilters', () => {
  let mockOnFiltersChange: jest.Mock;
  let mockOnReset: jest.Mock;

  beforeEach(() => {
    mockOnFiltersChange = jest.fn();
    mockOnReset = jest.fn();
  });

  describe('Initial Rendering', () => {
    it('should render filter header with title', () => {
      const filters = createInitialFilters();
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('should render search input', () => {
      const filters = createInitialFilters();
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      expect(
        screen.getByPlaceholderText(/Search by job ID or document ID/i)
      ).toBeInTheDocument();
    });

    it('should render all status filter buttons', () => {
      const filters = createInitialFilters();
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('All Status')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
      expect(screen.getByText('Partial')).toBeInTheDocument();
      expect(screen.getByText('Cancelled')).toBeInTheDocument();
    });

    it('should not show active badge when no filters are active', () => {
      const filters = createInitialFilters();
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.queryByText('Active')).not.toBeInTheDocument();
    });

    it('should not show reset button when no filters are active', () => {
      const filters = createInitialFilters();
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.queryByText('Reset')).not.toBeInTheDocument();
    });

    it('should not show expanded filters by default', () => {
      const filters = createInitialFilters();
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.queryByText('Channels')).not.toBeInTheDocument();
      expect(screen.queryByText('Date Range')).not.toBeInTheDocument();
    });

    it('should show "More" button initially', () => {
      const filters = createInitialFilters();
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset=  {mockOnReset}
        />
      );

      expect(screen.getByText('More')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should update search value on input change', async () => {
      const user = userEvent.setup();
      const filters = createInitialFilters();
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      const searchInput = screen.getByPlaceholderText(
        /Search by job ID or document ID/i
      );
      await user.type(searchInput, 't');

      expect(mockOnFiltersChange).toHaveBeenCalled();
      const lastCall = mockOnFiltersChange.mock.calls[mockOnFiltersChange.mock.calls.length - 1][0];
      expect(lastCall.search).toBe('t');
    });

    it('should display search value in input', () => {
      const filters = { ...createInitialFilters(), search: 'existing-search' };
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      const searchInput = screen.getByPlaceholderText(
        /Search by job ID or document ID/i
      ) as HTMLInputElement;
      expect(searchInput.value).toBe('existing-search');
    });
  });

  describe('Status Filter', () => {
    it('should highlight selected status', () => {
      const filters = { ...createInitialFilters(), status: 'pending' as const };
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      const pendingButton = screen.getByText('Pending');
      expect(pendingButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('should call onFiltersChange when status clicked', async () => {
      const user = userEvent.setup();
      const filters = createInitialFilters();
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('Completed'));

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filters,
        status: 'completed',
      });
    });

    it('should allow switching between statuses', async () => {
      const user = userEvent.setup();
      const filters = createInitialFilters();
      const { rerender } = render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('Failed'));
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filters,
        status: 'failed',
      });

      const updatedFilters = { ...filters, status: 'failed' as const };
      rerender(
        <AdvancedJobFilters
          filters={updatedFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('All Status'));
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...updatedFilters,
        status: 'all',
      });
    });
  });

  describe('Expand/Collapse Functionality', () => {
    it('should toggle to expanded view when More clicked', async () => {
      const user = userEvent.setup();
      const filters = createInitialFilters();
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('More'));

      expect(screen.getByText('Channels')).toBeInTheDocument();
      expect(screen.getByText('Date Range')).toBeInTheDocument();
    });

    it('should show "Less" button when expanded', async () => {
      const user = userEvent.setup();
      const filters = createInitialFilters();
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('More'));

      expect(screen.getByText('Less')).toBeInTheDocument();
      expect(screen.queryByText('More')).not.toBeInTheDocument();
    });

    it('should collapse when Less clicked', async () => {
      const user = userEvent.setup();
      const filters = createInitialFilters();
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('More'));
      expect(screen.getByText('Channels')).toBeInTheDocument();

      await user.click(screen.getByText('Less'));

      await waitFor(() => {
        expect(screen.queryByText('Channels')).not.toBeInTheDocument();
      });
    });
  });

  describe('Channel Filter (Expanded)', () => {
    it('should render all channel options when expanded', async () => {
      const user = userEvent.setup();
      const filters = createInitialFilters();
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('More'));

      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Website')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
    });

    it('should toggle channel selection', async () => {
      const user = userEvent.setup();
      const filters = createInitialFilters();
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('More'));
      await user.click(screen.getByText('Email'));

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filters,
        channels: ['email'],
      });
    });

    it('should allow selecting multiple channels', async () => {
      const user = userEvent.setup();
      const filters = createInitialFilters();
      const { rerender } = render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('More'));
      await user.click(screen.getByText('Email'));

      const updatedFilters = { ...filters, channels: ['email' as const] };
      rerender(
        <AdvancedJobFilters
          filters={updatedFilters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('Twitter'));

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...updatedFilters,
        channels: ['email', 'social_twitter'],
      });
    });

    it('should deselect channel when clicked again', async () => {
      const user = userEvent.setup();
      const filters = { ...createInitialFilters(), channels: ['email' as const] };
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('More'));

      // Wait for channels section to appear
      await waitFor(() => {
        expect(screen.getByText('Channels')).toBeInTheDocument();
      });

      // Click the Email channel button (first one in the list)
      const emailButtons = screen.getAllByText('Email');
      await user.click(emailButtons[0]);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filters,
        channels: [],
      });
    });

    it('should highlight selected channels', async () => {
      const user = userEvent.setup();
      const filters = { ...createInitialFilters(), channels: ['email' as const] };
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('More'));

      // Wait for channels section to appear
      await waitFor(() => {
        expect(screen.getByText('Channels')).toBeInTheDocument();
      });

      const emailButtons = screen.getAllByText('Email');
      const emailButton = emailButtons[0].closest('button');
      expect(emailButton).toHaveClass('border-blue-500');
    });
  });

  describe('Date Range Filter (Expanded)', () => {
    it('should render from and to date inputs when expanded', async () => {
      const user = userEvent.setup();
      const filters = createInitialFilters();
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('More'));

      expect(screen.getByText('From')).toBeInTheDocument();
      expect(screen.getByText('To')).toBeInTheDocument();
    });

    it('should update from date on change', async () => {
      const user = userEvent.setup();
      const filters = createInitialFilters();
      const { container } = render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('More'));

      const dateInputs = container.querySelectorAll('input[type="date"]');
      const fromInput = dateInputs[0] as HTMLInputElement;

      if (fromInput) {
        await user.clear(fromInput);
        await user.type(fromInput, '2025-01-01');
      }

      expect(mockOnFiltersChange).toHaveBeenCalled();
    });

    it('should update to date on change', async () => {
      const user = userEvent.setup();
      const filters = createInitialFilters();
      const { container } = render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('More'));

      const dateInputs = container.querySelectorAll('input[type="date"]');
      const toInput = dateInputs[1] as HTMLInputElement;

      if (toInput) {
        await user.clear(toInput);
        await user.type(toInput, '2025-12-31');
      }

      expect(mockOnFiltersChange).toHaveBeenCalled();
    });

    it('should display date range values', async () => {
      const user = userEvent.setup();
      const filters = {
        ...createInitialFilters(),
        dateRange: { from: '2025-01-01', to: '2025-12-31' },
      };
      const { container } = render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('More'));

      const dateInputs = container.querySelectorAll('input[type="date"]');

      expect((dateInputs[0] as HTMLInputElement).value).toBe('2025-01-01');
      expect((dateInputs[1] as HTMLInputElement).value).toBe('2025-12-31');
    });
  });

  describe('Active Filters Badge', () => {
    it('should show active badge when search filter is active', () => {
      const filters = { ...createInitialFilters(), search: 'test' };
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should show active badge when status filter is not all', () => {
      const filters = { ...createInitialFilters(), status: 'completed' as const };
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should show active badge when channels are selected', () => {
      const filters = { ...createInitialFilters(), channels: ['email' as const] };
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should show active badge when date range from is set', () => {
      const filters = {
        ...createInitialFilters(),
        dateRange: { from: '2025-01-01', to: '' },
      };
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should show active badge when date range to is set', () => {
      const filters = {
        ...createInitialFilters(),
        dateRange: { from: '', to: '2025-12-31' },
      };
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  describe('Reset Functionality', () => {
    it('should show reset button when filters are active', () => {
      const filters = { ...createInitialFilters(), search: 'test' };
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('should call onReset when reset button clicked', async () => {
      const user = userEvent.setup();
      const filters = { ...createInitialFilters(), search: 'test' };
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('Reset'));

      expect(mockOnReset).toHaveBeenCalled();
    });
  });

  describe('Active Filters Summary (Expanded)', () => {
    it('should show active filters summary when expanded and filters are active', async () => {
      const user = userEvent.setup();
      const filters = { ...createInitialFilters(), search: 'test' };
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('More'));

      expect(screen.getByText('Active Filters:')).toBeInTheDocument();
    });

    it('should display search in summary', async () => {
      const user = userEvent.setup();
      const filters = { ...createInitialFilters(), search: 'test-search' };
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('More'));

      const summary = screen.getByText('Active Filters:').closest('div');
      expect(summary).toHaveTextContent('test-search');
    });

    it('should display status in summary', async () => {
      const user = userEvent.setup();
      const filters = { ...createInitialFilters(), status: 'failed' as const };
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('More'));

      expect(screen.getByText(/Status: failed/i)).toBeInTheDocument();
    });

    it('should display selected channels in summary', async () => {
      const user = userEvent.setup();
      const filters = {
        ...createInitialFilters(),
        channels: ['email' as const, 'website' as const],
      };
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('More'));

      const summarySection = screen.getByText('Active Filters:').closest('div');
      expect(summarySection).toHaveTextContent('Email');
      expect(summarySection).toHaveTextContent('Website');
    });

    it('should display date range in summary', async () => {
      const user = userEvent.setup();
      const filters = {
        ...createInitialFilters(),
        dateRange: { from: '2025-01-01', to: '2025-12-31' },
      };
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('More'));

      expect(screen.getByText('From: 2025-01-01')).toBeInTheDocument();
      expect(screen.getByText('To: 2025-12-31')).toBeInTheDocument();
    });

    it('should not show summary when expanded but no filters active', async () => {
      const user = userEvent.setup();
      const filters = createInitialFilters();
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('More'));

      expect(screen.queryByText('Active Filters:')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search string', async () => {
      const user = userEvent.setup();
      const filters = { ...createInitialFilters(), search: 'previous' };
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      const searchInput = screen.getByPlaceholderText(
        /Search by job ID or document ID/i
      );
      await user.clear(searchInput);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filters,
        search: '',
      });
    });

    it('should handle all filters active at once', async () => {
      const user = userEvent.setup();
      const filters = {
        search: 'test',
        status: 'completed' as const,
        channels: ['email' as const, 'website' as const],
        dateRange: { from: '2025-01-01', to: '2025-12-31' },
      };
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();

      await user.click(screen.getByText('More'));

      const summary = screen.getByText('Active Filters:').closest('div');
      expect(summary).toHaveTextContent('test');
      expect(summary).toHaveTextContent('completed');
    });

    it('should handle rapid filter changes', async () => {
      const user = userEvent.setup({ delay: null });
      const filters = createInitialFilters();
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('Pending'));
      await user.click(screen.getByText('Completed'));
      await user.click(screen.getByText('Failed'));

      expect(mockOnFiltersChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const filters = createInitialFilters();
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Filters');
    });

    it('should have accessible search input', () => {
      const filters = createInitialFilters();
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      const searchInput = screen.getByPlaceholderText(
        /Search by job ID or document ID/i
      );
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('should have accessible date inputs when expanded', async () => {
      const user = userEvent.setup();
      const filters = createInitialFilters();
      const { container } = render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('More'));

      const dateInputs = container.querySelectorAll('input[type="date"]');

      expect(dateInputs).toHaveLength(2);
    });

    it('should have accessible buttons for all interactive elements', () => {
      const filters = createInitialFilters();
      render(
        <AdvancedJobFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      buttons.forEach(button => {
        expect(button).toHaveAttribute('class');
      });
    });
  });
});
