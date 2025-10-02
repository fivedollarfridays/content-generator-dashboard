'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type {
  HealthStatus,
  ContentGenerationRequest,
  SyncJob,
  CacheStats,
  CacheInvalidationRequest,
} from '@/types/content-generator';

/**
 * Query keys for React Query cache management
 */
export const API_QUERY_KEYS = {
  health: ['health'] as const,
  jobs: ['jobs'] as const,
  job: (jobId: string) => ['job', jobId] as const,
  cache: ['cache'] as const,
} as const;

/**
 * Hook for fetching health status
 *
 * @param options - React Query options
 * @returns Health status query
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useHealthCheck({
 *   refetchInterval: 10000, // Refetch every 10 seconds
 * });
 *
 * if (data?.success) {
 *   console.log('System is healthy:', data.data);
 * }
 * ```
 */
export const useHealthCheck = (
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof apiClient.healthCheck>>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: API_QUERY_KEYS.health,
    queryFn: () => apiClient.healthCheck(),
    ...options,
  });
};

/**
 * Hook for fetching jobs list
 *
 * @param params - Optional query parameters for filtering
 * @param options - React Query options
 * @returns Jobs list query
 *
 * @example
 * ```tsx
 * const { data, isLoading, refetch } = useJobs(
 *   { status: 'completed', limit: 20 },
 *   { refetchInterval: 5000 }
 * );
 *
 * if (data?.success) {
 *   console.log('Jobs:', data.data.jobs);
 * }
 * ```
 */
export const useJobs = (
  params?: Parameters<typeof apiClient.listJobs>[0],
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof apiClient.listJobs>>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: [...API_QUERY_KEYS.jobs, params],
    queryFn: () => apiClient.listJobs(params),
    ...options,
  });
};

/**
 * Hook for fetching a single job by ID
 *
 * @param jobId - Job ID to fetch
 * @param options - React Query options
 * @returns Job query
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useJob('job_123', {
 *   enabled: !!jobId, // Only fetch if jobId is provided
 * });
 *
 * if (data?.success) {
 *   console.log('Job details:', data.data);
 * }
 * ```
 */
export const useJob = (
  jobId: string,
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof apiClient.getJob>>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: API_QUERY_KEYS.job(jobId),
    queryFn: () => apiClient.getJob(jobId),
    ...options,
  });
};

/**
 * Hook for fetching cache statistics
 *
 * @param options - React Query options
 * @returns Cache stats query
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useCacheStats({
 *   refetchInterval: 15000, // Refetch every 15 seconds
 * });
 *
 * if (data?.success) {
 *   console.log('Cache entries:', data.data.total_entries);
 * }
 * ```
 */
export const useCacheStats = (
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof apiClient.getCacheStats>>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: API_QUERY_KEYS.cache,
    queryFn: () => apiClient.getCacheStats(),
    ...options,
  });
};

/**
 * Hook for generating content (mutation)
 *
 * @param options - React Query mutation options
 * @returns Content generation mutation
 *
 * @example
 * ```tsx
 * const { mutate, isPending, error } = useGenerateContent({
 *   onSuccess: (data) => {
 *     if (data.success) {
 *       console.log('Content generated:', data.data);
 *       router.push(`/jobs?highlight=${data.data.job_id}`);
 *     }
 *   },
 *   onError: (error) => {
 *     console.error('Generation failed:', error);
 *   },
 * });
 *
 * // Trigger generation
 * mutate({
 *   topic: 'AI in Healthcare',
 *   channels: ['email', 'website'],
 *   template_style: 'modern',
 * });
 * ```
 */
export const useGenerateContent = (
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof apiClient.generateContent>>,
    Error,
    ContentGenerationRequest
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ContentGenerationRequest) =>
      apiClient.generateContent(request),
    onSuccess: (...args) => {
      // Invalidate jobs query to refetch with new job
      queryClient.invalidateQueries({ queryKey: API_QUERY_KEYS.jobs });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

/**
 * Hook for batch job generation (mutation)
 *
 * @param options - React Query mutation options
 * @returns Batch job mutation
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useBatchGenerate({
 *   onSuccess: (data) => {
 *     if (data.success) {
 *       console.log(`Created ${data.data.jobs.length} jobs`);
 *     }
 *   },
 * });
 *
 * // Trigger batch generation
 * mutate({
 *   jobs: [
 *     { topic: 'Topic 1', channels: ['email'] },
 *     { topic: 'Topic 2', channels: ['website'] },
 *   ],
 * });
 * ```
 */
export const useBatchGenerate = (
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof apiClient.batchGenerate>>,
    Error,
    Parameters<typeof apiClient.batchGenerate>
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: Parameters<typeof apiClient.batchGenerate>) =>
      apiClient.batchGenerate(...args),
    onSuccess: (...args) => {
      // Invalidate jobs query to refetch with new jobs
      queryClient.invalidateQueries({ queryKey: API_QUERY_KEYS.jobs });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

/**
 * Hook for invalidating cache (mutation)
 *
 * @param options - React Query mutation options
 * @returns Cache invalidation mutation
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useInvalidateCache({
 *   onSuccess: (data) => {
 *     if (data.success) {
 *       console.log('Cache invalidated:', data.data.message);
 *     }
 *   },
 * });
 *
 * // Invalidate all cache
 * mutate({ invalidate_all: true });
 *
 * // Invalidate specific job
 * mutate({ job_id: 'job_123' });
 * ```
 */
export const useInvalidateCache = (
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof apiClient.invalidateCache>>,
    Error,
    CacheInvalidationRequest
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CacheInvalidationRequest) =>
      apiClient.invalidateCache(request),
    onSuccess: (...args) => {
      // Invalidate cache stats and jobs queries
      queryClient.invalidateQueries({ queryKey: API_QUERY_KEYS.cache });
      queryClient.invalidateQueries({ queryKey: API_QUERY_KEYS.jobs });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

/**
 * Hook for clearing all cache (mutation)
 *
 * @param options - React Query mutation options
 * @returns Clear cache mutation
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useClearCache({
 *   onSuccess: (data) => {
 *     if (data.success) {
 *       console.log('Cache cleared:', data.data.message);
 *     }
 *   },
 * });
 *
 * // Clear all cache
 * mutate();
 * ```
 */
export const useClearCache = (
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof apiClient.clearAllCaches>>,
    Error,
    void
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.clearAllCaches(),
    onSuccess: (...args) => {
      // Invalidate cache stats query
      queryClient.invalidateQueries({ queryKey: API_QUERY_KEYS.cache });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};
