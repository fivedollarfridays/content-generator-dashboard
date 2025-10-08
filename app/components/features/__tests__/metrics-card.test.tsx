/**
 * MetricsCard Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MetricsCard } from '../metrics-card';
import type { MetricsCardProps } from '../metrics-card';

describe('MetricsCard', () => {
  const defaultProps: MetricsCardProps = {
    title: 'Test Metric',
    value: 1234,
  };

  // ========== Rendering Tests ==========

  describe('Rendering', () => {
    it('should render with required props', () => {
      render(<MetricsCard {...defaultProps} />);

      expect(screen.getByText('Test Metric')).toBeInTheDocument();
      expect(screen.getByText('1,234')).toBeInTheDocument();
    });

    it('should render with subtitle', () => {
      render(<MetricsCard {...defaultProps} subtitle="Last 30 days" />);

      expect(screen.getByText('Test Metric')).toBeInTheDocument();
      expect(screen.getByText('1,234')).toBeInTheDocument();
      expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(
        <MetricsCard {...defaultProps} className="custom-class" />
      );

      const card = container.querySelector('.custom-class');
      expect(card).toBeInTheDocument();
    });

    it('should render with icon', () => {
      const icon = <span data-testid="test-icon">📊</span>;
      render(<MetricsCard {...defaultProps} icon={icon} />);

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('📊')).toBeInTheDocument();
    });
  });

  // ========== Value Formatting Tests ==========

  describe('Value Formatting', () => {
    it('should format number values with commas', () => {
      render(<MetricsCard {...defaultProps} value={1234567} />);
      expect(screen.getByText('1,234,567')).toBeInTheDocument();
    });

    it('should handle zero value', () => {
      render(<MetricsCard {...defaultProps} value={0} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle negative values', () => {
      render(<MetricsCard {...defaultProps} value={-1234} />);
      expect(screen.getByText('-1,234')).toBeInTheDocument();
    });

    it('should display string values as-is', () => {
      render(<MetricsCard {...defaultProps} value="95.5%" />);
      expect(screen.getByText('95.5%')).toBeInTheDocument();
    });

    it('should handle empty string value', () => {
      render(<MetricsCard {...defaultProps} value="" />);
      expect(screen.getByText('Test Metric')).toBeInTheDocument();
    });
  });

  // ========== Trend Indicator Tests ==========

  describe('Trend Indicator', () => {
    it('should display upward trend', () => {
      render(
        <MetricsCard
          {...defaultProps}
          trend={{ value: 12.5, direction: 'up' }}
        />
      );

      expect(screen.getByText(/↑/)).toBeInTheDocument();
      expect(screen.getByText(/12.5%/)).toBeInTheDocument();
      expect(screen.getByText('vs previous period')).toBeInTheDocument();
    });

    it('should display downward trend', () => {
      render(
        <MetricsCard
          {...defaultProps}
          trend={{ value: 8.3, direction: 'down' }}
        />
      );

      expect(screen.getByText(/↓/)).toBeInTheDocument();
      expect(screen.getByText(/8.3%/)).toBeInTheDocument();
    });

    it('should display neutral trend', () => {
      render(
        <MetricsCard
          {...defaultProps}
          trend={{ value: 0, direction: 'neutral' }}
        />
      );

      expect(screen.getByText(/→/)).toBeInTheDocument();
      expect(screen.getByText(/0%/)).toBeInTheDocument();
    });

    it('should apply correct color for upward trend', () => {
      const { container } = render(
        <MetricsCard {...defaultProps} trend={{ value: 10, direction: 'up' }} />
      );

      const trendElement = container.querySelector('.text-green-600');
      expect(trendElement).toBeInTheDocument();
    });

    it('should apply correct color for downward trend', () => {
      const { container } = render(
        <MetricsCard
          {...defaultProps}
          trend={{ value: 10, direction: 'down' }}
        />
      );

      const trendElement = container.querySelector('.text-red-600');
      expect(trendElement).toBeInTheDocument();
    });

    it('should apply correct color for neutral trend', () => {
      const { container } = render(
        <MetricsCard
          {...defaultProps}
          trend={{ value: 0, direction: 'neutral' }}
        />
      );

      const trendElement = container.querySelector('.text-gray-600');
      expect(trendElement).toBeInTheDocument();
    });

    it('should handle negative trend value (absolute value displayed)', () => {
      render(
        <MetricsCard
          {...defaultProps}
          trend={{ value: -15.5, direction: 'down' }}
        />
      );

      // Should display absolute value
      expect(screen.getByText(/15.5%/)).toBeInTheDocument();
    });
  });

  // ========== Loading State Tests ==========

  describe('Loading State', () => {
    it('should display loading skeleton when loading is true', () => {
      const { container } = render(
        <MetricsCard {...defaultProps} loading={true} />
      );

      // Check for loading skeleton
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();

      // Should not show actual content
      expect(screen.queryByText('Test Metric')).not.toBeInTheDocument();
      expect(screen.queryByText('1,234')).not.toBeInTheDocument();
    });

    it('should not display loading skeleton when loading is false', () => {
      const { container } = render(
        <MetricsCard {...defaultProps} loading={false} />
      );

      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).not.toBeInTheDocument();

      // Should show actual content
      expect(screen.getByText('Test Metric')).toBeInTheDocument();
      expect(screen.getByText('1,234')).toBeInTheDocument();
    });

    it('should display loading skeleton with correct structure', () => {
      const { container } = render(
        <MetricsCard {...defaultProps} loading={true} />
      );

      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();

      // Check for skeleton elements
      const skeletonElements = container.querySelectorAll('.bg-gray-200');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });
  });

  // ========== Integration Tests ==========

  describe('Integration', () => {
    it('should render complete card with all optional props', () => {
      const icon = <span data-testid="chart-icon">📈</span>;
      render(
        <MetricsCard
          title="Total Sales"
          value={50000}
          subtitle="Last quarter"
          trend={{ value: 25.5, direction: 'up' }}
          icon={icon}
          className="sales-card"
        />
      );

      expect(screen.getByText('Total Sales')).toBeInTheDocument();
      expect(screen.getByText('50,000')).toBeInTheDocument();
      expect(screen.getByText('Last quarter')).toBeInTheDocument();
      expect(screen.getByText(/↑/)).toBeInTheDocument();
      expect(screen.getByText(/25.5%/)).toBeInTheDocument();
      expect(screen.getByTestId('chart-icon')).toBeInTheDocument();
    });

    it('should render card without optional props', () => {
      render(<MetricsCard title="Simple Metric" value={100} />);

      expect(screen.getByText('Simple Metric')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.queryByText('vs previous period')).not.toBeInTheDocument();
    });
  });

  // ========== Styling Tests ==========

  describe('Styling', () => {
    it('should apply base styling classes', () => {
      const { container } = render(<MetricsCard {...defaultProps} />);

      const card = container.querySelector('.bg-white.rounded-lg.shadow');
      expect(card).toBeInTheDocument();
    });

    it('should have hover effect class', () => {
      const { container } = render(<MetricsCard {...defaultProps} />);

      const card = container.querySelector('.hover\\:shadow-md');
      expect(card).toBeInTheDocument();
    });

    it('should have transition class', () => {
      const { container } = render(<MetricsCard {...defaultProps} />);

      const card = container.querySelector('.transition-shadow');
      expect(card).toBeInTheDocument();
    });
  });

  // ========== Edge Cases ==========

  describe('Edge Cases', () => {
    it('should handle very large numbers', () => {
      render(<MetricsCard {...defaultProps} value={9999999999} />);
      expect(screen.getByText('9,999,999,999')).toBeInTheDocument();
    });

    it('should handle decimal numbers', () => {
      render(<MetricsCard {...defaultProps} value={1234.567} />);
      // toLocaleString may format decimals differently based on locale
      expect(screen.getByText(/1,234\.567/)).toBeInTheDocument();
    });

    it('should handle trend value of zero', () => {
      render(
        <MetricsCard
          {...defaultProps}
          trend={{ value: 0, direction: 'neutral' }}
        />
      );

      expect(screen.getByText(/0%/)).toBeInTheDocument();
    });

    it('should render without subtitle when not provided', () => {
      render(<MetricsCard {...defaultProps} />);

      // Should not have subtitle text
      const subtitles = screen.queryAllByText(/Last/);
      expect(subtitles.length).toBe(0);
    });

    it('should render without icon when not provided', () => {
      const { container } = render(<MetricsCard {...defaultProps} />);

      // Check that icon container doesn't exist
      const iconContainer = container.querySelector(
        '.text-gray-400.opacity-50'
      );
      expect(iconContainer).not.toBeInTheDocument();
    });
  });
});
