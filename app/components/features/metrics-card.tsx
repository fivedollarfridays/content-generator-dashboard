'use client';

import React from 'react';

/**
 * Props for MetricsCard component
 */
export interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

/**
 * MetricsCard Component
 *
 * Displays a single metric with optional trend indicator and icon.
 * Used in analytics dashboard to show key performance indicators.
 * Memoized for performance when rendering multiple cards.
 *
 * @example
 * ```tsx
 * <MetricsCard
 *   title="Total Jobs"
 *   value={1234}
 *   subtitle="Last 30 days"
 *   trend={{ value: 12.5, direction: 'up' }}
 * />
 * ```
 */
export const MetricsCard: React.FC<MetricsCardProps> = React.memo(({
  title,
  value,
  subtitle,
  trend,
  icon,
  className = '',
  loading = false,
}): JSX.Element => {
  /**
   * Format number with commas for readability
   */
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  /**
   * Get trend color based on direction
   */
  const getTrendColor = (direction: 'up' | 'down' | 'neutral'): string => {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'neutral':
        return 'text-gray-600';
    }
  };

  /**
   * Get trend icon based on direction
   */
  const getTrendIcon = (direction: 'up' | 'down' | 'neutral'): string => {
    switch (direction) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      case 'neutral':
        return '→';
    }
  };

  if (loading) {
    return (
      <div
        className={`bg-white rounded-lg shadow p-6 border border-gray-200 ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {formatValue(value)}
          </p>
          {subtitle && <p className="text-xs text-gray-500 mb-2">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-sm font-medium ${getTrendColor(trend.direction)}`}
              >
                {getTrendIcon(trend.direction)} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500">vs previous period</span>
            </div>
          )}
        </div>
        {icon && <div className="text-gray-400 opacity-50">{icon}</div>}
      </div>
    </div>
  );
});

MetricsCard.displayName = 'MetricsCard';

export default MetricsCard;
