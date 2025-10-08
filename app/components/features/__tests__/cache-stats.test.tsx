/**
 * CacheStats Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CacheStats } from '../cache-stats';
import type { CacheStats as CacheStatsType } from '@/types/content-generator';
import { ContentGeneratorAPI } from '@/lib/api/api-client';

// Mock the API client
jest.mock('@/lib/api/api-client');

const mockCacheStats: CacheStatsType = {
  hit_rate: 0.85,
  miss_rate: 0.15,
  hits: 8500,
  misses: 1500,
  total_keys: 1200,
  evictions: 50,
  memory_usage_mb: 45.6,
  avg_ttl_seconds: 3600,
  oldest_key_age_seconds: 86400,
  cache_targets: {
    content: {
      enabled: true,
      hit_rate: 0.92,
      total_keys: 500,
      memory_mb: 25.3,
    },
    templates: {
      enabled: true,
      hit_rate: 0.78,
      total_keys: 300,
      memory_mb: 10.2,
    },
    metadata: {
      enabled: false,
      hit_rate: 0,
      total_keys: 0,
    },
  },
};

describe('CacheStats', () => {
  const mockApiUrl = 'http://localhost:8000';
  const mockApiKey = 'test-api-key';
  const mockOnInvalidate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Mock window.confirm
    global.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  // ========== Rendering Tests ==========

  describe('Rendering States', () => {
    it('should render loading state initially', () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn(() => new Promise(() => {})),
          } as any)
      );

      const { container } = render(<CacheStats apiUrl={mockApiUrl} />);

      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('should render error state when fetch fails', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: false,
              error: { message: 'API error' },
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('Failed to Load Cache Stats')).toBeInTheDocument();
        expect(screen.getByText('API error')).toBeInTheDocument();
      });
    });

    it('should render stats when fetch succeeds', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('Cache Performance')).toBeInTheDocument();
      });
    });
  });

  // ========== Stats Display Tests ==========

  describe('Statistics Display', () => {
    it('should display hit rate correctly', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('85.0%')).toBeInTheDocument();
        expect(screen.getByText('8,500 hits')).toBeInTheDocument();
      });
    });

    it('should display miss rate correctly', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('15.0%')).toBeInTheDocument();
        expect(screen.getByText('1,500 misses')).toBeInTheDocument();
      });
    });

    it('should display total keys and evictions', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('1,200')).toBeInTheDocument();
        expect(screen.getByText('50 evictions')).toBeInTheDocument();
      });
    });

    it('should display memory usage', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('45.6 MB')).toBeInTheDocument();
      });
    });

    it('should display average TTL', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText(/Avg TTL:/)).toBeInTheDocument();
        expect(screen.getByText(/1h 0m/)).toBeInTheDocument();
      });
    });

    it('should display last update time', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText(/Updated/)).toBeInTheDocument();
      });
    });
  });

  // ========== Cache Targets Tests ==========

  describe('Cache Targets', () => {
    it('should display cache targets section', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('Cache Targets')).toBeInTheDocument();
        expect(screen.getByText('CONTENT')).toBeInTheDocument();
        expect(screen.getByText('TEMPLATES')).toBeInTheDocument();
        expect(screen.getByText('METADATA')).toBeInTheDocument();
      });
    });

    it('should show enabled badge for active cache targets', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        const enabledBadges = screen.getAllByText('Enabled');
        expect(enabledBadges.length).toBe(2); // content and templates
      });
    });

    it('should show disabled badge for inactive cache targets', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('Disabled')).toBeInTheDocument();
      });
    });

    it('should display target hit rates and stats for enabled targets', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('92.0%')).toBeInTheDocument(); // content hit rate
        expect(screen.getByText('500 keys • 25.3 MB')).toBeInTheDocument();
        expect(screen.getByText('78.0%')).toBeInTheDocument(); // templates hit rate
        expect(screen.getByText('300 keys • 10.2 MB')).toBeInTheDocument();
      });
    });

    it('should not display Cache Targets section when no targets', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: { ...mockCacheStats, cache_targets: {} },
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.queryByText('Cache Targets')).not.toBeInTheDocument();
      });
    });
  });

  // ========== Cache Age Tests ==========

  describe('Cache Age', () => {
    it('should display oldest cache entry age', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('Oldest Cache Entry')).toBeInTheDocument();
        expect(screen.getByText('1d 0h 0m old')).toBeInTheDocument();
      });
    });

    it('should not display oldest cache entry when age is 0', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: { ...mockCacheStats, oldest_key_age_seconds: 0 },
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.queryByText('Oldest Cache Entry')).not.toBeInTheDocument();
      });
    });
  });

  // ========== Invalidation Mode Tests ==========

  describe('Invalidation Mode', () => {
    it('should default to pattern mode', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        const patternRadio = screen.getByLabelText('Pattern') as HTMLInputElement;
        expect(patternRadio.checked).toBe(true);
      });
    });

    it('should switch to keys mode when selected', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        const keysRadio = screen.getByLabelText('Specific Keys');
        fireEvent.click(keysRadio);
        expect((keysRadio as HTMLInputElement).checked).toBe(true);
      });
    });

    it('should switch to tags mode when selected', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        const tagsRadio = screen.getByLabelText('Tags');
        fireEvent.click(tagsRadio);
        expect((tagsRadio as HTMLInputElement).checked).toBe(true);
      });
    });

    it('should show pattern placeholder in pattern mode', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        const input = screen.getByPlaceholderText('content:*');
        expect(input).toBeInTheDocument();
      });
    });

    it('should show keys placeholder in keys mode', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        fireEvent.click(screen.getByLabelText('Specific Keys'));
        const input = screen.getByPlaceholderText('key1, key2, key3');
        expect(input).toBeInTheDocument();
      });
    });

    it('should show tags placeholder in tags mode', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        fireEvent.click(screen.getByLabelText('Tags'));
        const input = screen.getByPlaceholderText('tag1, tag2');
        expect(input).toBeInTheDocument();
      });
    });
  });

  // ========== Invalidation Tests ==========

  describe('Cache Invalidation', () => {
    it('should invalidate by pattern', async () => {
      const mockInvalidateCache = jest.fn().mockResolvedValue({
        success: true,
        data: { invalidated: 25 },
      });

      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
            invalidateCache: mockInvalidateCache,
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} onInvalidate={mockOnInvalidate} />);

      await waitFor(() => {
        const input = screen.getByPlaceholderText('content:*');
        fireEvent.change(input, { target: { value: 'content:*' } });
      });

      fireEvent.click(screen.getByText('Invalidate'));

      await waitFor(() => {
        expect(mockInvalidateCache).toHaveBeenCalledWith({ pattern: 'content:*' });
        expect(screen.getByText('Invalidated 25 cache entries')).toBeInTheDocument();
      });
    });

    it('should invalidate by keys', async () => {
      const mockInvalidateCache = jest.fn().mockResolvedValue({
        success: true,
        data: { invalidated: 3 },
      });

      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
            invalidateCache: mockInvalidateCache,
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        fireEvent.click(screen.getByLabelText('Specific Keys'));
      });

      const input = screen.getByPlaceholderText('key1, key2, key3');
      fireEvent.change(input, { target: { value: 'key1, key2, key3' } });

      fireEvent.click(screen.getByText('Invalidate'));

      await waitFor(() => {
        expect(mockInvalidateCache).toHaveBeenCalledWith({
          cache_keys: ['key1', 'key2', 'key3'],
        });
      });
    });

    it('should invalidate by tags', async () => {
      const mockInvalidateCache = jest.fn().mockResolvedValue({
        success: true,
        data: { invalidated: 10 },
      });

      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
            invalidateCache: mockInvalidateCache,
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        fireEvent.click(screen.getByLabelText('Tags'));
      });

      const input = screen.getByPlaceholderText('tag1, tag2');
      fireEvent.change(input, { target: { value: 'tag1, tag2' } });

      fireEvent.click(screen.getByText('Invalidate'));

      await waitFor(() => {
        expect(mockInvalidateCache).toHaveBeenCalledWith({
          tags: ['tag1', 'tag2'],
        });
      });
    });

    it('should show error when invalidation input is empty', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
            invalidateCache: jest.fn(),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        const button = screen.getByText('Invalidate');
        expect(button).toBeDisabled();
      });
    });

    it('should disable invalidate button while invalidating', async () => {
      let resolveInvalidate: any;
      const invalidatePromise = new Promise(resolve => {
        resolveInvalidate = resolve;
      });

      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
            invalidateCache: jest.fn(() => invalidatePromise),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        const input = screen.getByPlaceholderText('content:*');
        fireEvent.change(input, { target: { value: 'test:*' } });
      });

      fireEvent.click(screen.getByText('Invalidate'));

      await waitFor(() => {
        expect(screen.getByText('Invalidating...')).toBeInTheDocument();
      });

      // Resolve the promise
      resolveInvalidate({ success: true, data: { invalidated: 5 } });

      await waitFor(() => {
        expect(screen.getByText('Invalidate')).toBeInTheDocument();
      });
    });

    it('should call onInvalidate callback', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
            invalidateCache: jest.fn().mockResolvedValue({
              success: true,
              data: { invalidated: 5 },
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} onInvalidate={mockOnInvalidate} />);

      await waitFor(() => {
        const input = screen.getByPlaceholderText('content:*');
        fireEvent.change(input, { target: { value: 'test:*' } });
      });

      fireEvent.click(screen.getByText('Invalidate'));

      await waitFor(() => {
        expect(mockOnInvalidate).toHaveBeenCalledWith({ pattern: 'test:*' });
      });
    });

    it('should handle invalidation error', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
            invalidateCache: jest.fn().mockResolvedValue({
              success: false,
              error: { message: 'Invalidation failed' },
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        const input = screen.getByPlaceholderText('content:*');
        fireEvent.change(input, { target: { value: 'test:*' } });
      });

      fireEvent.click(screen.getByText('Invalidate'));

      await waitFor(() => {
        expect(screen.getByText('Invalidation failed')).toBeInTheDocument();
      });
    });

    it('should clear input after successful invalidation', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
            invalidateCache: jest.fn().mockResolvedValue({
              success: true,
              data: { invalidated: 5 },
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        const input = screen.getByPlaceholderText('content:*') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'test:*' } });
        expect(input.value).toBe('test:*');
      });

      fireEvent.click(screen.getByText('Invalidate'));

      await waitFor(() => {
        const input = screen.getByPlaceholderText('content:*') as HTMLInputElement;
        expect(input.value).toBe('');
      });
    });
  });

  // ========== Clear All Tests ==========

  describe('Clear All Caches', () => {
    it('should show confirmation dialog before clearing all', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
            clearAllCaches: jest.fn().mockResolvedValue({ success: true }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Clear All'));
      });

      expect(global.confirm).toHaveBeenCalledWith(
        'Are you sure you want to clear ALL caches? This cannot be undone.'
      );
    });

    it('should clear all caches when confirmed', async () => {
      const mockClearAllCaches = jest.fn().mockResolvedValue({ success: true });

      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
            clearAllCaches: mockClearAllCaches,
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Clear All'));
      });

      await waitFor(() => {
        expect(mockClearAllCaches).toHaveBeenCalled();
        expect(screen.getByText('All caches cleared successfully')).toBeInTheDocument();
      });
    });

    it('should not clear when confirmation is cancelled', async () => {
      global.confirm = jest.fn(() => false);
      const mockClearAllCaches = jest.fn();

      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
            clearAllCaches: mockClearAllCaches,
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Clear All'));
      });

      expect(mockClearAllCaches).not.toHaveBeenCalled();
    });

    it('should handle clear all error', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
            clearAllCaches: jest.fn().mockResolvedValue({
              success: false,
              error: { message: 'Clear failed' },
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Clear All'));
      });

      await waitFor(() => {
        expect(screen.getByText('Clear failed')).toBeInTheDocument();
      });
    });
  });

  // ========== Refresh Tests ==========

  describe('Refresh Functionality', () => {
    it('should auto-refresh at specified interval', async () => {
      const mockGetCacheStats = jest.fn().mockResolvedValue({
        success: true,
        data: mockCacheStats,
      });

      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: mockGetCacheStats,
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} refreshInterval={5000} />);

      // Initial fetch
      await waitFor(() => {
        expect(mockGetCacheStats).toHaveBeenCalledTimes(1);
      });

      // Advance timer
      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(mockGetCacheStats).toHaveBeenCalledTimes(2);
      });
    });

    it('should refresh when refresh button clicked', async () => {
      const mockGetCacheStats = jest.fn().mockResolvedValue({
        success: true,
        data: mockCacheStats,
      });

      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: mockGetCacheStats,
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });

      mockGetCacheStats.mockClear();

      fireEvent.click(screen.getByText('Refresh'));

      await waitFor(() => {
        expect(mockGetCacheStats).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ========== Error Handling Tests ==========

  describe('Error Handling', () => {
    it('should display error when exception is thrown', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockRejectedValue(new Error('Network error')),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should retry when retry button clicked', async () => {
      const mockGetCacheStats = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ success: true, data: mockCacheStats });

      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: mockGetCacheStats,
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Retry'));

      await waitFor(() => {
        expect(screen.getByText('Cache Performance')).toBeInTheDocument();
      });
    });
  });

  // ========== Formatting Tests ==========

  describe('Utility Functions', () => {
    it('should format duration in hours and minutes', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: { ...mockCacheStats, avg_ttl_seconds: 7200 }, // 2 hours
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText(/2h 0m/)).toBeInTheDocument();
      });
    });

    it('should format duration in minutes and seconds', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: { ...mockCacheStats, avg_ttl_seconds: 125 }, // 2m 5s
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText(/2m 5s/)).toBeInTheDocument();
      });
    });

    it('should format duration in seconds only', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: { ...mockCacheStats, avg_ttl_seconds: 45 },
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText(/45s/)).toBeInTheDocument();
      });
    });
  });

  // ========== Edge Cases ==========

  describe('Edge Cases', () => {
    it('should handle target without memory_mb', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: {
                ...mockCacheStats,
                cache_targets: {
                  test: {
                    enabled: true,
                    hit_rate: 0.5,
                    total_keys: 100,
                  },
                },
              },
            }),
          } as any)
      );

      render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('100 keys')).toBeInTheDocument();
        expect(screen.queryByText(/MB/)).toBeInTheDocument(); // Should still show other MB values
      });
    });

    it('should cleanup interval on unmount', async () => {
      (ContentGeneratorAPI as jest.MockedClass<typeof ContentGeneratorAPI>).mockImplementation(
        () =>
          ({
            getCacheStats: jest.fn().mockResolvedValue({
              success: true,
              data: mockCacheStats,
            }),
          } as any)
      );

      const { unmount } = render(<CacheStats apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(screen.getByText('Cache Performance')).toBeInTheDocument();
      });

      unmount();

      // Verify no errors after unmount
      jest.advanceTimersByTime(15000);
    });
  });
});
