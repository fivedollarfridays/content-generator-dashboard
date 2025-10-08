/**
 * Templates Page Tests
 * Comprehensive test suite for template browsing and selection
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import TemplatesPage from '../page';
import type { Template } from '@/types/content-generator';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockRouterPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

// Mock TemplateSelector component
jest.mock('@/app/components/features/template-selector', () => {
  return function MockTemplateSelector({
    templates,
    selectedTemplate,
    onChange,
    showPreview,
    channelFilter,
  }: {
    templates: Template[];
    selectedTemplate?: Template;
    onChange: (template: Template) => void;
    showPreview?: boolean;
    channelFilter?: string[];
  }) {
    return (
      <div data-testid="template-selector">
        <div data-testid="template-count">{templates.length}</div>
        <div data-testid="show-preview">{showPreview ? 'true' : 'false'}</div>
        <div data-testid="channel-filter">
          {channelFilter ? channelFilter.join(',') : 'none'}
        </div>
        <div data-testid="selected-template">
          {selectedTemplate ? selectedTemplate.id : 'none'}
        </div>
        {templates.map(template => (
          <button
            key={template.id}
            data-testid={`template-${template.id}`}
            onClick={() => onChange(template)}
          >
            {template.name}
          </button>
        ))}
      </div>
    );
  };
});

describe('TemplatesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockRouterPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as any);
  });

  describe('Page Rendering', () => {
    it('should render templates page with header', () => {
      render(<TemplatesPage />);
      expect(screen.getByText('Content Templates')).toBeInTheDocument();
      expect(
        screen.getByText('Browse and select templates for your content generation')
      ).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      render(<TemplatesPage />);
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });

    it('should render search input', async () => {
      render(<TemplatesPage />);
      await waitFor(() => {
        expect(screen.getByLabelText('Search Templates')).toBeInTheDocument();
      });
      expect(
        screen.getByPlaceholderText('Search by name or description...')
      ).toBeInTheDocument();
    });

    it('should render channel filter buttons', async () => {
      render(<TemplatesPage />);
      await waitFor(() => {
        expect(screen.getByText('Email')).toBeInTheDocument();
      });
      expect(screen.getByText('Website')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
    });

    it('should display template stats', async () => {
      render(<TemplatesPage />);
      await waitFor(() => {
        expect(screen.getByText('Total Templates')).toBeInTheDocument();
      });
      expect(screen.getByText('Filtered Results')).toBeInTheDocument();
      expect(screen.getByText('Active Filters')).toBeInTheDocument();
    });
  });

  describe('Template Loading', () => {
    it('should load and display mock templates', async () => {
      render(<TemplatesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('template-selector')).toBeInTheDocument();
      });

      // Should show 5 mock templates
      expect(screen.getByTestId('template-count')).toHaveTextContent('5');
    });

    it('should hide loading spinner after templates load', async () => {
      render(<TemplatesPage />);

      await waitFor(() => {
        expect(screen.queryByRole('status', { hidden: true })).not.toBeInTheDocument();
      });
    });

    it('should display correct total template count', async () => {
      render(<TemplatesPage />);

      await waitFor(() => {
        const totalTemplatesElements = screen.getAllByText('5');
        expect(totalTemplatesElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter templates by name', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TemplatesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('template-selector')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by name or description...');
      await user.type(searchInput, 'Modern');

      await waitFor(() => {
        const templateCount = screen.getByTestId('template-count');
        // Should show fewer templates (Modern Email and Modern Website)
        expect(parseInt(templateCount.textContent || '0')).toBeLessThan(5);
      });
    });

    it('should filter templates by description', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TemplatesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('template-selector')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by name or description...');
      await user.type(searchInput, 'social');

      await waitFor(() => {
        const templateCount = screen.getByTestId('template-count');
        // Should filter to social media template
        expect(parseInt(templateCount.textContent || '0')).toBeGreaterThan(0);
      });
    });

    it('should handle case-insensitive search', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TemplatesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('template-selector')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by name or description...');
      await user.type(searchInput, 'MODERN');

      await waitFor(() => {
        const templateCount = screen.getByTestId('template-count');
        expect(parseInt(templateCount.textContent || '0')).toBeGreaterThan(0);
      });
    });

    it('should show empty state for no search results', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TemplatesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('template-selector')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by name or description...');
      await user.type(searchInput, 'nonexistent');

      await waitFor(() => {
        expect(screen.getByText('No templates found')).toBeInTheDocument();
        expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument();
      });
    });
  });

  describe('Channel Filtering', () => {
    it('should toggle channel filter when clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TemplatesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('template-selector')).toBeInTheDocument();
      });

      const emailButton = screen.getByText('Email');
      await user.click(emailButton);

      await waitFor(() => {
        const filterElement = screen.getByTestId('channel-filter');
        expect(filterElement).toHaveTextContent('email');
      });
    });

    it('should apply multiple channel filters', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TemplatesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('template-selector')).toBeInTheDocument();
      });

      const emailButton = screen.getByText('Email');
      const websiteButton = screen.getByText('Website');

      await user.click(emailButton);
      await user.click(websiteButton);

      await waitFor(() => {
        const filterElement = screen.getByTestId('channel-filter');
        expect(filterElement.textContent).toContain('email');
        expect(filterElement.textContent).toContain('website');
      });
    });

    it('should remove channel filter when clicked again', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TemplatesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('template-selector')).toBeInTheDocument();
      });

      const emailButton = screen.getByText('Email');
      await user.click(emailButton);
      await user.click(emailButton);

      await waitFor(() => {
        const filterElement = screen.getByTestId('channel-filter');
        expect(filterElement).toHaveTextContent('none');
      });
    });

    it('should show clear filters button when filters active', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TemplatesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('template-selector')).toBeInTheDocument();
      });

      const emailButton = screen.getByText('Email');
      await user.click(emailButton);

      await waitFor(() => {
        expect(screen.getByText('Clear filters')).toBeInTheDocument();
      });
    });

    it('should clear all filters when clear button clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TemplatesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('template-selector')).toBeInTheDocument();
      });

      const emailButton = screen.getByText('Email');
      await user.click(emailButton);

      await waitFor(() => {
        expect(screen.getByText('Clear filters')).toBeInTheDocument();
      });

      const clearButton = screen.getByText('Clear filters');
      await user.click(clearButton);

      await waitFor(() => {
        const filterElement = screen.getByTestId('channel-filter');
        expect(filterElement).toHaveTextContent('none');
      });
    });

    it('should update active filters count', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TemplatesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('template-selector')).toBeInTheDocument();
      });

      const emailButton = screen.getByText('Email');
      const websiteButton = screen.getByText('Website');

      await user.click(emailButton);
      await user.click(websiteButton);

      await waitFor(() => {
        // Find the "Active Filters" section and check its count shows 2
        const activeFiltersSection = screen
          .getByText('Active Filters')
          .closest('div');
        expect(activeFiltersSection).toHaveTextContent('2');
      });
    });
  });

  describe('Template Selection', () => {
    it('should select template when clicked in selector', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TemplatesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('template-selector')).toBeInTheDocument();
      });

      const templateButton = screen.getByTestId('template-modern-email-1');
      await user.click(templateButton);

      await waitFor(() => {
        const selectedElement = screen.getByTestId('selected-template');
        expect(selectedElement).toHaveTextContent('modern-email-1');
      });
    });

    it('should display selected template info', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TemplatesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('template-selector')).toBeInTheDocument();
      });

      const templateButton = screen.getByTestId('template-modern-email-1');
      await user.click(templateButton);

      await waitFor(() => {
        expect(screen.getByText(/Selected Template:/)).toBeInTheDocument();
        expect(screen.getByText('Modern Email Newsletter')).toBeInTheDocument();
      });
    });

    it('should show use template button when template selected', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TemplatesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('template-selector')).toBeInTheDocument();
      });

      const templateButton = screen.getByTestId('template-modern-email-1');
      await user.click(templateButton);

      await waitFor(() => {
        expect(screen.getByText('Use This Template →')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to generate page when use template clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TemplatesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('template-selector')).toBeInTheDocument();
      });

      const templateButton = screen.getByTestId('template-modern-email-1');
      await user.click(templateButton);

      await waitFor(() => {
        expect(screen.getByText('Use This Template →')).toBeInTheDocument();
      });

      const useButton = screen.getByText('Use This Template →');
      await user.click(useButton);

      expect(mockRouterPush).toHaveBeenCalledWith(
        '/generate?template=modern-email-1&style=modern'
      );
    });

    it('should include template id in navigation URL', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TemplatesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('template-selector')).toBeInTheDocument();
      });

      const templateButton = screen.getByTestId('template-classic-blog-1');
      await user.click(templateButton);

      await waitFor(() => {
        expect(screen.getByText('Use This Template →')).toBeInTheDocument();
      });

      const useButton = screen.getByText('Use This Template →');
      await user.click(useButton);

      expect(mockRouterPush).toHaveBeenCalledWith(
        '/generate?template=classic-blog-1&style=classic'
      );
    });

    it('should include template style in navigation URL', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TemplatesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('template-selector')).toBeInTheDocument();
      });

      const templateButton = screen.getByTestId('template-minimal-social-1');
      await user.click(templateButton);

      await waitFor(() => {
        expect(screen.getByText('Use This Template →')).toBeInTheDocument();
      });

      const useButton = screen.getByText('Use This Template →');
      await user.click(useButton);

      expect(mockRouterPush).toHaveBeenCalledWith(
        '/generate?template=minimal-social-1&style=minimal'
      );
    });
  });

  describe('Template Data', () => {
    it('should load all 5 mock templates', async () => {
      render(<TemplatesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('template-modern-email-1')).toBeInTheDocument();
      });

      expect(screen.getByTestId('template-classic-blog-1')).toBeInTheDocument();
      expect(screen.getByTestId('template-minimal-social-1')).toBeInTheDocument();
      expect(screen.getByTestId('template-modern-website-1')).toBeInTheDocument();
      expect(screen.getByTestId('template-classic-email-1')).toBeInTheDocument();
    });

    it('should pass correct props to TemplateSelector', async () => {
      render(<TemplatesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('template-selector')).toBeInTheDocument();
      });

      expect(screen.getByTestId('show-preview')).toHaveTextContent('true');
    });
  });

  describe('Stats Display', () => {
    it('should show total templates count', async () => {
      render(<TemplatesPage />);

      await waitFor(() => {
        const totalSection = screen.getByText('Total Templates').closest('div');
        expect(totalSection).toHaveTextContent('5');
      });
    });

    it('should update filtered results count based on search', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TemplatesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('template-selector')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by name or description...');
      await user.type(searchInput, 'Modern');

      await waitFor(() => {
        const filteredSection = screen.getByText('Filtered Results').closest('div');
        // Should show count less than 5
        expect(filteredSection?.textContent).toMatch(/[0-4]/);
      });
    });

    it('should show zero active filters initially', async () => {
      render(<TemplatesPage />);

      await waitFor(() => {
        const activeFiltersSection = screen
          .getByText('Active Filters')
          .closest('div');
        expect(activeFiltersSection).toHaveTextContent('0');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid filter toggling', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TemplatesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('template-selector')).toBeInTheDocument();
      });

      const emailButton = screen.getByText('Email');

      // Rapid clicks
      await user.click(emailButton);
      await user.click(emailButton);
      await user.click(emailButton);

      // Should end up with filter active (odd number of clicks)
      await waitFor(() => {
        const filterElement = screen.getByTestId('channel-filter');
        expect(filterElement).toHaveTextContent('email');
      });
    });

    it('should handle search and filter combination', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TemplatesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('template-selector')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by name or description...');
      await user.type(searchInput, 'Email');

      const emailButton = screen.getByText('Email');
      await user.click(emailButton);

      await waitFor(() => {
        const templateCount = screen.getByTestId('template-count');
        // Should show filtered templates
        expect(parseInt(templateCount.textContent || '0')).toBeGreaterThan(0);
      });
    });

    it('should handle selecting different templates', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TemplatesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('template-selector')).toBeInTheDocument();
      });

      // Select first template
      const template1 = screen.getByTestId('template-modern-email-1');
      await user.click(template1);

      await waitFor(() => {
        const selectedElement = screen.getByTestId('selected-template');
        expect(selectedElement).toHaveTextContent('modern-email-1');
      });

      // Select second template
      const template2 = screen.getByTestId('template-classic-blog-1');
      await user.click(template2);

      await waitFor(() => {
        const selectedElement = screen.getByTestId('selected-template');
        expect(selectedElement).toHaveTextContent('classic-blog-1');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible search input', async () => {
      render(<TemplatesPage />);

      await waitFor(() => {
        const searchInput = screen.getByLabelText('Search Templates');
        expect(searchInput).toHaveAttribute('type', 'text');
        expect(searchInput).toHaveAttribute('id', 'search');
      });
    });

    it('should have semantic heading structure', () => {
      render(<TemplatesPage />);

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Content Templates');
    });

    it('should have accessible filter buttons', async () => {
      render(<TemplatesPage />);

      await waitFor(() => {
        const emailButton = screen.getByRole('button', { name: /Email/i });
        expect(emailButton).toBeInTheDocument();
      });
    });
  });
});
