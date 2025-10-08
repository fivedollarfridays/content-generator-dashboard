/**
 * Campaigns Page Tests
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CampaignsPage from '../page';

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => '2025-01-15'),
}));

// Mock campaign generator
jest.mock('@/lib/utils/mock-campaigns', () => ({
  generateMockCampaigns: jest.fn(() => [
    {
      id: 'campaign-1',
      name: 'Summer Sale 2025',
      description: 'Summer promotion campaign',
      status: 'active',
      tags: ['sale', 'summer'],
      startDate: '2025-06-01',
      endDate: '2025-08-31',
      channels: ['email', 'social'],
    },
    {
      id: 'campaign-2',
      name: 'Product Launch',
      description: 'New product announcement',
      status: 'draft',
      tags: ['launch', 'product'],
      startDate: '2025-09-01',
      endDate: '2025-09-30',
      channels: ['website', 'email'],
    },
    {
      id: 'campaign-3',
      name: 'Holiday Campaign',
      description: 'Holiday season promotions',
      status: 'paused',
      tags: ['holiday', 'seasonal'],
      startDate: '2025-12-01',
      endDate: '2025-12-31',
      channels: ['email'],
    },
  ]),
}));

describe('CampaignsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render page title and description', () => {
      render(<CampaignsPage />);

      expect(screen.getByText('Campaigns')).toBeInTheDocument();
      expect(
        screen.getByText('Plan, schedule, and track multi-channel content campaigns')
      ).toBeInTheDocument();
    });

    it('should render new campaign button', () => {
      render(<CampaignsPage />);

      expect(screen.getByText('New Campaign')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<CampaignsPage />);

      expect(
        screen.getByPlaceholderText(/Search campaigns by name, description, or tags/)
      ).toBeInTheDocument();
    });

    it('should render all status filter buttons', () => {
      render(<CampaignsPage />);

      expect(screen.getByText('All Campaigns')).toBeInTheDocument();
      expect(screen.getByText('Draft')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Paused')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Archived')).toBeInTheDocument();
    });
  });

  describe('Campaign Display', () => {
    it('should display all campaigns initially', () => {
      render(<CampaignsPage />);

      expect(screen.getByText('Summer Sale 2025')).toBeInTheDocument();
      expect(screen.getByText('Product Launch')).toBeInTheDocument();
      expect(screen.getByText('Holiday Campaign')).toBeInTheDocument();
    });

    it('should show campaign count', () => {
      render(<CampaignsPage />);

      expect(screen.getByText(/Showing 3 of 3 campaigns/)).toBeInTheDocument();
    });

    it('should display campaign details', () => {
      render(<CampaignsPage />);

      expect(screen.getByText('Summer promotion campaign')).toBeInTheDocument();
      expect(screen.getByText('New product announcement')).toBeInTheDocument();
    });
  });

  describe('Status Filtering', () => {
    it('should filter by active status', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CampaignsPage />);

      const activeButton = screen.getByText('Active');
      await user.click(activeButton);

      await waitFor(() => {
        expect(screen.getByText('Summer Sale 2025')).toBeInTheDocument();
        expect(screen.queryByText('Product Launch')).not.toBeInTheDocument();
        expect(screen.queryByText('Holiday Campaign')).not.toBeInTheDocument();
      });

      expect(screen.getByText(/Showing 1 of 3 campaigns/)).toBeInTheDocument();
    });

    it('should filter by draft status', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CampaignsPage />);

      const draftButton = screen.getByText('Draft');
      await user.click(draftButton);

      await waitFor(() => {
        expect(screen.getByText('Product Launch')).toBeInTheDocument();
        expect(screen.queryByText('Summer Sale 2025')).not.toBeInTheDocument();
      });
    });

    it('should filter by paused status', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CampaignsPage />);

      const pausedButton = screen.getByText('Paused');
      await user.click(pausedButton);

      await waitFor(() => {
        expect(screen.getByText('Holiday Campaign')).toBeInTheDocument();
        expect(screen.queryByText('Summer Sale 2025')).not.toBeInTheDocument();
      });
    });

    it('should return to all campaigns', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CampaignsPage />);

      // Filter by active
      await user.click(screen.getByText('Active'));

      await waitFor(() => {
        expect(screen.getByText(/Showing 1 of 3/)).toBeInTheDocument();
      });

      // Return to all
      await user.click(screen.getByText('All Campaigns'));

      await waitFor(() => {
        expect(screen.getByText(/Showing 3 of 3/)).toBeInTheDocument();
      });
    });

    it('should highlight selected status', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CampaignsPage />);

      const activeButton = screen.getByText('Active');
      await user.click(activeButton);

      await waitFor(() => {
        expect(activeButton).toHaveClass('bg-blue-600');
      });
    });
  });

  describe('Search Functionality', () => {
    it('should search by campaign name', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CampaignsPage />);

      const searchInput = screen.getByPlaceholderText(/Search campaigns/);
      await user.type(searchInput, 'Summer');

      await waitFor(() => {
        expect(screen.getByText('Summer Sale 2025')).toBeInTheDocument();
        expect(screen.queryByText('Product Launch')).not.toBeInTheDocument();
      });
    });

    it('should search by description', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CampaignsPage />);

      const searchInput = screen.getByPlaceholderText(/Search campaigns/);
      await user.type(searchInput, 'promotion');

      await waitFor(() => {
        expect(screen.getByText('Summer Sale 2025')).toBeInTheDocument();
        expect(screen.queryByText('Product Launch')).not.toBeInTheDocument();
      });
    });

    it('should search by tags', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CampaignsPage />);

      const searchInput = screen.getByPlaceholderText(/Search campaigns/);
      await user.type(searchInput, 'launch');

      await waitFor(() => {
        expect(screen.getByText('Product Launch')).toBeInTheDocument();
        expect(screen.queryByText('Summer Sale 2025')).not.toBeInTheDocument();
      });
    });

    it('should handle case-insensitive search', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CampaignsPage />);

      const searchInput = screen.getByPlaceholderText(/Search campaigns/);
      await user.type(searchInput, 'SUMMER');

      await waitFor(() => {
        expect(screen.getByText('Summer Sale 2025')).toBeInTheDocument();
      });
    });

    it('should show no results message', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CampaignsPage />);

      const searchInput = screen.getByPlaceholderText(/Search campaigns/);
      await user.type(searchInput, 'nonexistent');

      await waitFor(() => {
        expect(screen.getByText('No campaigns found')).toBeInTheDocument();
      });
    });

    it('should update results count', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CampaignsPage />);

      const searchInput = screen.getByPlaceholderText(/Search campaigns/);
      await user.type(searchInput, 'Summer');

      await waitFor(() => {
        expect(screen.getByText(/Showing 1 of 3/)).toBeInTheDocument();
      });
    });
  });

  describe('Combined Filtering', () => {
    it('should combine status and search filters', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CampaignsPage />);

      // Apply status filter
      await user.click(screen.getByText('Active'));

      // Apply search
      const searchInput = screen.getByPlaceholderText(/Search campaigns/);
      await user.type(searchInput, 'Summer');

      await waitFor(() => {
        expect(screen.getByText('Summer Sale 2025')).toBeInTheDocument();
        expect(screen.getByText(/Showing 1 of 3/)).toBeInTheDocument();
      });
    });

    it('should clear search when filter changes', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CampaignsPage />);

      const searchInput = screen.getByPlaceholderText(/Search campaigns/);
      await user.type(searchInput, 'Summer');

      await waitFor(() => {
        expect(screen.getByText(/Showing 1 of 3/)).toBeInTheDocument();
      });

      // Clear search
      await user.clear(searchInput);

      await waitFor(() => {
        expect(screen.getByText(/Showing 3 of 3/)).toBeInTheDocument();
      });
    });
  });

  describe('Status Colors', () => {
    it('should display correct status badge colors', () => {
      render(<CampaignsPage />);

      // Check that status badges are rendered (implementation detail)
      const statusBadges = document.querySelectorAll('[class*="bg-green"]');
      expect(statusBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form elements', () => {
      render(<CampaignsPage />);

      const searchInput = screen.getByPlaceholderText(/Search campaigns/);
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('should have semantic heading', () => {
      render(<CampaignsPage />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Campaigns');
    });

    it('should have clickable filter buttons', () => {
      render(<CampaignsPage />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search gracefully', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CampaignsPage />);

      const searchInput = screen.getByPlaceholderText(/Search campaigns/);
      await user.type(searchInput, '   ');

      await waitFor(() => {
        expect(screen.getByText(/Showing 3 of 3/)).toBeInTheDocument();
      });
    });

    it('should handle rapid filter changes', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CampaignsPage />);

      await user.click(screen.getByText('Active'));
      await user.click(screen.getByText('Draft'));
      await user.click(screen.getByText('Paused'));
      await user.click(screen.getByText('All Campaigns'));

      await waitFor(() => {
        expect(screen.getByText(/Showing 3 of 3/)).toBeInTheDocument();
      });
    });
  });
});
