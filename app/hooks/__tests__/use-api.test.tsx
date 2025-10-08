/**
 * useApi Hooks Tests
 *
 * Comprehensive test suite for React Query API wrapper hooks
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useHealthCheck,
  useJobs,
  useJob,
  useCacheStats,
  useGenerateContent,
  useBatchGenerate,
  useInvalidateCache,
  useClearCache,
  API_QUERY_KEYS,
} from '../use-api';
import { apiClient } from '@/lib/api/client';
import type {
  HealthStatus,
  SyncJob,
  CacheStats,
  ContentGenerationRequest,
  CacheInvalidationRequest,
  APIResponse,
} from '@/types/content-generator';

// Mock API client
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    healthCheck: jest.fn(),
    listJobs: jest.fn(),
    getJob: jest.fn(),
    getCacheStats: jest.fn(),
    generateContent: jest.fn(),
    batchGenerate: jest.fn(),
    invalidateCache: jest.fn(),
    clearAllCaches: jest.fn(),
  },
}));

describe('useApi Hooks', () => {
  let queryClient: QueryClient;

  // Create wrapper with QueryClient
  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries for tests
        },
        mutations: {
          retry: false,
        },
      },
    });

    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== Query Key Tests ==========

  describe('API_QUERY_KEYS', () => {
    it('should define health query key', () => {
      expect(API_QUERY_KEYS.health).toEqual(['health']);
    });

    it('should define jobs query key', () => {
      expect(API_QUERY_KEYS.jobs).toEqual(['jobs']);
    });

    it('should define job query key function', () => {
      expect(API_QUERY_KEYS.job('job-123')).toEqual(['job', 'job-123']);
    });

    it('should define cache query key', () => {
      expect(API_QUERY_KEYS.cache).toEqual(['cache']);
    });
  });

  // ========== useHealthCheck Tests ==========

  describe('useHealthCheck', () => {
    it('should fetch health status successfully', async () => {
      const mockHealthData: APIResponse<HealthStatus> = {
        success: true,
        data: {
          service: 'content-generator',
          status: 'healthy',
          timestamp: '2025-10-08T12:00:00Z',
        },
      };

      (apiClient.healthCheck as jest.Mock).mockResolvedValue(mockHealthData);

      const { result } = renderHook(() => useHealthCheck(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockHealthData);
      expect(apiClient.healthCheck).toHaveBeenCalledTimes(1);
    });

    it('should handle health check error', async () => {
      const mockError = new Error('Network error');
      (apiClient.healthCheck as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useHealthCheck(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(mockError);
    });

    it('should pass through react-query options', async () => {
      const mockHealthData: APIResponse<HealthStatus> = {
        success: true,
        data: {
          service: 'content-generator',
          status: 'healthy',
          timestamp: '2025-10-08T12:00:00Z',
        },
      };

      (apiClient.healthCheck as jest.Mock).mockResolvedValue(mockHealthData);

      const { result } = renderHook(
        () => useHealthCheck({ enabled: false }),
        {
          wrapper: createWrapper(),
        }
      );

      // Query should not run when enabled is false
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  // ========== useJobs Tests ==========

  describe('useJobs', () => {
    it('should fetch jobs list successfully', async () => {
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
        },
      ];

      const mockResponse: APIResponse<{ jobs: SyncJob[]; total: number }> = {
        success: true,
        data: { jobs: mockJobs, total: 1 },
      };

      (apiClient.listJobs as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(apiClient.listJobs).toHaveBeenCalledWith(undefined);
    });

    it('should pass filter parameters to API', async () => {
      const mockResponse: APIResponse<{ jobs: SyncJob[]; total: number }> = {
        success: true,
        data: { jobs: [], total: 0 },
      };

      (apiClient.listJobs as jest.Mock).mockResolvedValue(mockResponse);

      const params = { status: 'completed', limit: 10 };

      renderHook(() => useJobs(params), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(apiClient.listJobs).toHaveBeenCalledWith(params);
      });
    });

    it('should handle jobs list error', async () => {
      const mockError = new Error('Failed to fetch jobs');
      (apiClient.listJobs as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(mockError);
    });
  });

  // ========== useJob Tests ==========

  describe('useJob', () => {
    it('should fetch single job successfully', async () => {
      const mockJob: SyncJob = {
        job_id: 'job-123',
        document_id: 'doc-456',
        status: 'completed',
        channels: ['email', 'website'],
        content_type: 'update',
        template_style: 'modern',
        created_at: '2025-10-08T12:00:00Z',
        updated_at: '2025-10-08T12:05:00Z',
      };

      const mockResponse: APIResponse<SyncJob> = {
        success: true,
        data: mockJob,
      };

      (apiClient.getJob as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useJob('job-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(apiClient.getJob).toHaveBeenCalledWith('job-123');
    });

    it('should handle job fetch error', async () => {
      const mockError = new Error('Job not found');
      (apiClient.getJob as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useJob('job-404'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(mockError);
    });

    it('should support conditional fetching with enabled option', () => {
      const { result } = renderHook(() => useJob('job-123', { enabled: false }), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(apiClient.getJob).not.toHaveBeenCalled();
    });
  });

  // ========== useCacheStats Tests ==========

  describe('useCacheStats', () => {
    it('should fetch cache stats successfully', async () => {
      const mockCacheStats: CacheStats = {
        total_entries: 42,
        memory_usage: 1024,
        hit_rate: 0.85,
      };

      const mockResponse: APIResponse<CacheStats> = {
        success: true,
        data: mockCacheStats,
      };

      (apiClient.getCacheStats as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCacheStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(apiClient.getCacheStats).toHaveBeenCalledTimes(1);
    });

    it('should handle cache stats error', async () => {
      const mockError = new Error('Cache unavailable');
      (apiClient.getCacheStats as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useCacheStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(mockError);
    });
  });

  // ========== useGenerateContent Tests ==========

  describe('useGenerateContent', () => {
    it('should generate content successfully', async () => {
      const mockJob: SyncJob = {
        job_id: 'job-new',
        document_id: 'doc-new',
        status: 'pending',
        channels: ['email'],
        content_type: 'update',
        template_style: 'modern',
        created_at: '2025-10-08T12:00:00Z',
        updated_at: '2025-10-08T12:00:00Z',
      };

      const mockResponse: APIResponse<SyncJob> = {
        success: true,
        data: mockJob,
      };

      (apiClient.generateContent as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useGenerateContent(), {
        wrapper: createWrapper(),
      });

      const request: ContentGenerationRequest = {
        topic: 'AI in Healthcare',
        channels: ['email'],
        template_style: 'modern',
      };

      result.current.mutate(request);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(apiClient.generateContent).toHaveBeenCalledWith(request);
    });

    it('should invalidate jobs query on success', async () => {
      const mockResponse: APIResponse<SyncJob> = {
        success: true,
        data: {} as SyncJob,
      };

      (apiClient.generateContent as jest.Mock).mockResolvedValue(mockResponse);

      // Create wrapper first to get queryClient instance
      const wrapper = createWrapper();
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useGenerateContent(), { wrapper });

      result.current.mutate({
        topic: 'Test',
        channels: ['email'],
        template_style: 'modern',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: API_QUERY_KEYS.jobs,
      });
    });

    it('should handle generation error', async () => {
      const mockError = new Error('Generation failed');
      (apiClient.generateContent as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useGenerateContent(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        topic: 'Test',
        channels: ['email'],
        template_style: 'modern',
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(mockError);
    });

    it('should call custom onSuccess callback', async () => {
      const mockResponse: APIResponse<SyncJob> = {
        success: true,
        data: {} as SyncJob,
      };

      (apiClient.generateContent as jest.Mock).mockResolvedValue(mockResponse);

      const onSuccess = jest.fn();

      const { result } = renderHook(() => useGenerateContent({ onSuccess }), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        topic: 'Test',
        channels: ['email'],
        template_style: 'modern',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(onSuccess).toHaveBeenCalled();
    });
  });

  // ========== useBatchGenerate Tests ==========

  describe('useBatchGenerate', () => {
    it('should generate batch jobs successfully', async () => {
      const mockJobs: SyncJob[] = [
        {
          job_id: 'job-1',
          document_id: 'doc-1',
          status: 'pending',
          channels: ['email'],
          content_type: 'update',
          template_style: 'modern',
          created_at: '2025-10-08T12:00:00Z',
          updated_at: '2025-10-08T12:00:00Z',
        },
      ];

      const mockResponse: APIResponse<{ jobs: SyncJob[] }> = {
        success: true,
        data: { jobs: mockJobs },
      };

      (apiClient.batchGenerate as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useBatchGenerate(), {
        wrapper: createWrapper(),
      });

      const requests: ContentGenerationRequest[] = [
        { topic: 'Topic 1', channels: ['email'], template_style: 'modern' },
      ];

      result.current.mutate(requests as any);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
    });

    it('should invalidate jobs query on batch success', async () => {
      const mockResponse: APIResponse<{ jobs: SyncJob[] }> = {
        success: true,
        data: { jobs: [] },
      };

      (apiClient.batchGenerate as jest.Mock).mockResolvedValue(mockResponse);

      // Create wrapper first to get queryClient instance
      const wrapper = createWrapper();
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useBatchGenerate(), { wrapper });

      result.current.mutate([] as any);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: API_QUERY_KEYS.jobs,
      });
    });
  });

  // ========== useInvalidateCache Tests ==========

  describe('useInvalidateCache', () => {
    it('should invalidate cache successfully', async () => {
      const mockResponse: APIResponse<{ message: string }> = {
        success: true,
        data: { message: 'Cache invalidated' },
      };

      (apiClient.invalidateCache as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useInvalidateCache(), {
        wrapper: createWrapper(),
      });

      const request: CacheInvalidationRequest = {
        invalidate_all: true,
      };

      result.current.mutate(request);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(apiClient.invalidateCache).toHaveBeenCalledWith(request);
    });

    it('should invalidate cache and jobs queries on success', async () => {
      const mockResponse: APIResponse<{ message: string }> = {
        success: true,
        data: { message: 'Cache invalidated' },
      };

      (apiClient.invalidateCache as jest.Mock).mockResolvedValue(mockResponse);

      // Create wrapper first to get queryClient instance
      const wrapper = createWrapper();
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useInvalidateCache(), { wrapper });

      result.current.mutate({ invalidate_all: true });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: API_QUERY_KEYS.cache,
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: API_QUERY_KEYS.jobs,
      });
    });

    it('should handle cache invalidation error', async () => {
      const mockError = new Error('Invalidation failed');
      (apiClient.invalidateCache as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useInvalidateCache(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ invalidate_all: true });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(mockError);
    });
  });

  // ========== useClearCache Tests ==========

  describe('useClearCache', () => {
    it('should clear cache successfully', async () => {
      const mockResponse: APIResponse<{ message: string }> = {
        success: true,
        data: { message: 'All caches cleared' },
      };

      (apiClient.clearAllCaches as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useClearCache(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(apiClient.clearAllCaches).toHaveBeenCalledTimes(1);
    });

    it('should invalidate cache query on clear success', async () => {
      const mockResponse: APIResponse<{ message: string }> = {
        success: true,
        data: { message: 'All caches cleared' },
      };

      (apiClient.clearAllCaches as jest.Mock).mockResolvedValue(mockResponse);

      // Create wrapper first to get queryClient instance
      const wrapper = createWrapper();
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useClearCache(), { wrapper });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: API_QUERY_KEYS.cache,
      });
    });

    it('should handle clear cache error', async () => {
      const mockError = new Error('Clear failed');
      (apiClient.clearAllCaches as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useClearCache(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(mockError);
    });

    it('should call custom onSuccess callback', async () => {
      const mockResponse: APIResponse<{ message: string }> = {
        success: true,
        data: { message: 'All caches cleared' },
      };

      (apiClient.clearAllCaches as jest.Mock).mockResolvedValue(mockResponse);

      const onSuccess = jest.fn();

      const { result } = renderHook(() => useClearCache({ onSuccess }), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
