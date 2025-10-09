/**
 * API Client for Content Generator
 *
 * TypeScript client for the Content Generator API. Provides methods for
 * content generation, job management, cache operations, and system monitoring.
 *
 * @example
 * ```typescript
 * import { ContentGeneratorAPI } from '@/lib/api/api-client';
 *
 * const api = new ContentGeneratorAPI('http://localhost:8000', 'your-api-key');
 *
 * // Health check
 * const health = await api.healthCheck();
 *
 * // Generate content
 * const job = await api.generateContent({
 *   topic: 'AI in Healthcare',
 *   channels: ['email', 'website'],
 *   template_style: 'modern',
 * });
 * ```
 */

import type {
  HealthStatus,
  Metrics,
  SyncJob,
  JobsListResponse,
  ContentGenerationRequest,
  CacheStats,
  CacheInvalidationRequest,
  CacheInvalidationResponse,
  ValidationResult,
  APIResponse,
  AnalyticsOverview,
  JobAnalytics,
} from '@/types/content-generator';

/**
 * Content Generator API Client
 */
export class ContentGeneratorAPI {
  private baseUrl: string;
  private apiKey?: string;
  private correlationIdHeader = 'X-Correlation-ID';

  /**
   * Create a new API client instance
   *
   * @param baseUrl - Base URL of the API (e.g., 'http://localhost:8000')
   * @param apiKey - Optional API key for authentication
   *
   * @example
   * ```typescript
   * const api = new ContentGeneratorAPI('http://localhost:8000', 'your-api-key');
   * ```
   */
  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  /**
   * Make an HTTP request to the API
   *
   * @param endpoint - API endpoint path
   * @param options - Fetch options (method, body, headers, etc.)
   * @returns API response with success/error handling
   * @private
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            message: data.detail || data.message || 'Request failed',
            status: response.status,
            details: data,
          },
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Network error',
        },
      };
    }
  }

  // ========== Health & Status ==========

  /**
   * Check the health status of the API
   *
   * Returns detailed health information including database status,
   * cache status, and uptime metrics.
   *
   * @returns Health status response
   *
   * @example
   * ```typescript
   * const health = await api.healthCheck();
   * if (health.success) {
   *   console.log('Status:', health.data.status);
   *   console.log('Database:', health.data.database_status);
   * }
   * ```
   */
  async healthCheck(): Promise<APIResponse<HealthStatus>> {
    return this.request<HealthStatus>('/health');
  }

  /**
   * Check if the API is ready to accept requests
   *
   * Returns a simple ready/not-ready status for load balancer health checks.
   *
   * @returns Readiness status response
   *
   * @example
   * ```typescript
   * const ready = await api.readinessCheck();
   * if (ready.success && ready.data.ready) {
   *   console.log('API is ready');
   * }
   * ```
   */
  async readinessCheck(): Promise<APIResponse<{ ready: boolean }>> {
    return this.request('/ready');
  }

  /**
   * Get API metrics and statistics
   *
   * Returns performance metrics, request counts, and system statistics.
   *
   * @returns Metrics response
   *
   * @example
   * ```typescript
   * const metrics = await api.metrics();
   * if (metrics.success) {
   *   console.log('Total requests:', metrics.data.total_requests);
   * }
   * ```
   */
  async metrics(): Promise<APIResponse<Metrics>> {
    return this.request<Metrics>('/metrics');
  }

  // ========== Content Generation ==========

  /**
   * Generate content synchronously
   *
   * Creates a content generation job and waits for completion.
   * Generates content for specified channels using AI templates.
   *
   * @param request - Content generation parameters
   * @returns Completed job with generated content
   *
   * @example
   * ```typescript
   * const job = await api.generateContent({
   *   topic: 'AI in Healthcare',
   *   channels: ['email', 'website'],
   *   template_style: 'modern',
   *   options: {
   *     tone: 'professional',
   *     length: 'medium',
   *   },
   * });
   *
   * if (job.success) {
   *   console.log('Job ID:', job.data.job_id);
   *   console.log('Status:', job.data.status);
   *   console.log('Content:', job.data.result);
   * }
   * ```
   */
  async generateContent(
    request: ContentGenerationRequest
  ): Promise<APIResponse<SyncJob>> {
    return this.request<SyncJob>('/api/v2/content/sync', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Preview generated content
   *
   * Retrieve a preview of generated content by document ID.
   *
   * @param documentId - Optional document ID to preview
   * @returns Content preview response
   *
   * @example
   * ```typescript
   * const preview = await api.previewContent('doc_123');
   * if (preview.success) {
   *   console.log('Preview:', preview.data);
   * }
   * ```
   */
  async previewContent(documentId?: string): Promise<APIResponse<any>> {
    const params = documentId ? `?document_id=${documentId}` : '';
    return this.request(`/api/v1/preview${params}`);
  }

  /**
   * Validate content structure and data
   *
   * Validates generated content against schema requirements.
   *
   * @param content - Content to validate
   * @param contentType - Optional content type specification
   * @param strict - Whether to use strict validation (default: true)
   * @returns Validation result
   *
   * @example
   * ```typescript
   * const validation = await api.validateContent(
   *   { title: 'Test', body: 'Content' },
   *   'article',
   *   true
   * );
   *
   * if (validation.success && validation.data.valid) {
   *   console.log('Content is valid');
   * } else {
   *   console.error('Validation errors:', validation.data.errors);
   * }
   * ```
   */
  async validateContent(
    content: any,
    contentType?: string,
    strict = true
  ): Promise<APIResponse<ValidationResult>> {
    return this.request<ValidationResult>('/api/v2/content/validate', {
      method: 'POST',
      body: JSON.stringify({ content, content_type: contentType, strict }),
    });
  }

  // ========== Jobs ==========

  /**
   * List all content generation jobs
   *
   * Retrieve a paginated list of jobs with optional status filtering.
   *
   * @param params - Query parameters for filtering and pagination
   * @param params.status - Filter by job status (pending, processing, completed, failed)
   * @param params.limit - Maximum number of jobs to return
   * @param params.offset - Number of jobs to skip (for pagination)
   * @returns List of jobs
   *
   * @example
   * ```typescript
   * const jobs = await api.listJobs({
   *   status: 'completed',
   *   limit: 20,
   *   offset: 0,
   * });
   *
   * if (jobs.success) {
   *   console.log('Total jobs:', jobs.data.total);
   *   console.log('Jobs:', jobs.data.jobs);
   * }
   * ```
   */
  async listJobs(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<APIResponse<JobsListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.set('status', params.status);
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());

    const query = queryParams.toString();
    return this.request<JobsListResponse>(
      `/api/v2/jobs${query ? `?${query}` : ''}`
    );
  }

  /**
   * Get a specific job by ID
   *
   * Retrieve detailed information about a single job.
   *
   * @param jobId - Unique job identifier
   * @returns Job details
   *
   * @example
   * ```typescript
   * const job = await api.getJob('job_abc123');
   * if (job.success) {
   *   console.log('Job status:', job.data.status);
   *   console.log('Created at:', job.data.created_at);
   *   console.log('Result:', job.data.result);
   * }
   * ```
   */
  async getJob(jobId: string): Promise<APIResponse<SyncJob>> {
    return this.request<SyncJob>(`/api/v2/jobs/${jobId}`);
  }

  /**
   * Cancel a running or pending job
   *
   * Attempts to cancel a job that is currently processing or pending.
   *
   * @param jobId - Job ID to cancel
   * @returns Cancellation status
   *
   * @example
   * ```typescript
   * const result = await api.cancelJob('job_abc123');
   * if (result.success && result.data.cancelled) {
   *   console.log('Job cancelled successfully');
   * }
   * ```
   */
  async cancelJob(jobId: string): Promise<APIResponse<{ cancelled: boolean }>> {
    return this.request(`/api/v2/content/sync/${jobId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Retry a failed job
   *
   * Resubmits a failed job for processing with the same parameters.
   *
   * @param jobId - Job ID to retry
   * @returns New job instance
   *
   * @example
   * ```typescript
   * const job = await api.retryJob('job_abc123');
   * if (job.success) {
   *   console.log('Job retried with new ID:', job.data.job_id);
   * }
   * ```
   */
  async retryJob(jobId: string): Promise<APIResponse<SyncJob>> {
    return this.request<SyncJob>(`/api/v2/jobs/${jobId}/retry`, {
      method: 'POST',
    });
  }

  // ========== Cache ==========

  /**
   * Get cache statistics
   *
   * Retrieve detailed statistics about the API's cache system including
   * memory usage, entry counts, and performance metrics.
   *
   * @returns Cache statistics
   *
   * @example
   * ```typescript
   * const stats = await api.getCacheStats();
   * if (stats.success) {
   *   console.log('Total entries:', stats.data.total_entries);
   *   console.log('Memory used:', stats.data.memory_usage);
   *   console.log('Hit rate:', stats.data.hit_rate);
   * }
   * ```
   */
  async getCacheStats(): Promise<APIResponse<CacheStats>> {
    return this.request<CacheStats>('/api/v2/cache/stats');
  }

  /**
   * Invalidate specific cache entries
   *
   * Remove specific entries from the cache by job ID, pattern, or all entries.
   *
   * @param request - Cache invalidation parameters
   * @returns Invalidation result with count of cleared entries
   *
   * @example
   * ```typescript
   * // Invalidate specific job
   * const result = await api.invalidateCache({ job_id: 'job_123' });
   *
   * // Invalidate all cache
   * const result = await api.invalidateCache({ invalidate_all: true });
   *
   * if (result.success) {
   *   console.log('Entries cleared:', result.data.entries_cleared);
   * }
   * ```
   */
  async invalidateCache(
    request: CacheInvalidationRequest
  ): Promise<APIResponse<CacheInvalidationResponse>> {
    return this.request<CacheInvalidationResponse>('/api/v2/cache/invalidate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Clear all cache entries
   *
   * Removes all entries from the cache system. Use with caution in production.
   *
   * @returns Clear cache result
   *
   * @example
   * ```typescript
   * const result = await api.clearAllCaches();
   * if (result.success && result.data.cleared) {
   *   console.log('All caches cleared');
   * }
   * ```
   */
  async clearAllCaches(): Promise<APIResponse<{ cleared: boolean }>> {
    return this.request('/api/v2/cache/clear', {
      method: 'POST',
    });
  }

  // ========== Analytics ==========

  /**
   * Get analytics overview
   *
   * Retrieve comprehensive analytics including job statistics, performance metrics,
   * channel performance, and recent activity.
   *
   * @param params - Query parameters for analytics
   * @param params.start_date - Start date for analytics period (ISO format)
   * @param params.end_date - End date for analytics period (ISO format)
   * @param params.granularity - Time granularity (hour, day, week, month)
   * @returns Analytics overview
   *
   * @example
   * ```typescript
   * const analytics = await api.getAnalytics({
   *   start_date: '2025-10-01T00:00:00Z',
   *   end_date: '2025-10-07T23:59:59Z',
   *   granularity: 'day'
   * });
   *
   * if (analytics.success) {
   *   console.log('Total jobs:', analytics.data.job_analytics.total_jobs);
   *   console.log('Success rate:', analytics.data.job_analytics.success_rate);
   * }
   * ```
   */
  async getAnalytics(params?: {
    start_date?: string;
    end_date?: string;
    granularity?: 'hour' | 'day' | 'week' | 'month';
  }): Promise<APIResponse<AnalyticsOverview>> {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.set('start_date', params.start_date);
    if (params?.end_date) queryParams.set('end_date', params.end_date);
    if (params?.granularity) queryParams.set('granularity', params.granularity);

    const query = queryParams.toString();
    return this.request<AnalyticsOverview>(
      `/api/v2/analytics${query ? `?${query}` : ''}`
    );
  }

  /**
   * Get job analytics
   *
   * Retrieve detailed job-specific analytics including status distribution,
   * channel usage, and time-series data.
   *
   * @param params - Query parameters for job analytics
   * @param params.start_date - Start date for analytics period
   * @param params.end_date - End date for analytics period
   * @param params.status - Filter by job status
   * @param params.channel - Filter by channel
   * @returns Job analytics
   *
   * @example
   * ```typescript
   * const jobAnalytics = await api.getJobAnalytics({
   *   start_date: '2025-10-01T00:00:00Z',
   *   end_date: '2025-10-07T23:59:59Z',
   *   status: 'completed'
   * });
   *
   * if (jobAnalytics.success) {
   *   console.log('Completed jobs:', jobAnalytics.data.completed_jobs);
   * }
   * ```
   */
  async getJobAnalytics(params?: {
    start_date?: string;
    end_date?: string;
    status?: string;
    channel?: string;
  }): Promise<APIResponse<JobAnalytics>> {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.set('start_date', params.start_date);
    if (params?.end_date) queryParams.set('end_date', params.end_date);
    if (params?.status) queryParams.set('status', params.status);
    if (params?.channel) queryParams.set('channel', params.channel);

    const query = queryParams.toString();
    return this.request<JobAnalytics>(
      `/api/v2/analytics/jobs${query ? `?${query}` : ''}`
    );
  }

  // ========== Batch Operations ==========

  /**
   * Generate content for multiple jobs in batch
   *
   * Creates multiple content generation jobs at once with options for
   * parallel processing and failure handling.
   *
   * @param requests - Array of content generation requests
   * @param parallel - Whether to process jobs in parallel (default: true)
   * @param failFast - Whether to stop on first failure (default: false)
   * @returns Batch job result with all job statuses
   *
   * @example
   * ```typescript
   * const result = await api.batchGenerate(
   *   [
   *     { topic: 'AI in Healthcare', channels: ['email'] },
   *     { topic: 'Future of Medicine', channels: ['website'] },
   *     { topic: 'Medical Innovation', channels: ['social_twitter'] },
   *   ],
   *   true,  // parallel processing
   *   false  // don't fail fast
   * );
   *
   * if (result.success) {
   *   console.log('Total jobs:', result.data.total);
   *   console.log('Successful:', result.data.successful);
   *   console.log('Failed:', result.data.failed);
   * }
   * ```
   */
  async batchGenerate(
    requests: ContentGenerationRequest[],
    parallel = true,
    failFast = false
  ): Promise<APIResponse<any>> {
    return this.request('/api/v2/batch/generate', {
      method: 'POST',
      body: JSON.stringify({ requests, parallel, fail_fast: failFast }),
    });
  }

  // ========== Utilities ==========

  /**
   * Set or update the API key
   *
   * Updates the API key used for authentication in subsequent requests.
   *
   * @param apiKey - New API key to use
   *
   * @example
   * ```typescript
   * api.setApiKey('new-api-key-123');
   * ```
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Generate a unique correlation ID
   *
   * Creates a unique identifier for request tracking and debugging.
   *
   * @returns Unique correlation ID string
   *
   * @example
   * ```typescript
   * const correlationId = api.generateCorrelationId();
   * console.log('Correlation ID:', correlationId);
   * // Output: "1234567890-abc123def"
   * ```
   */
  generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default ContentGeneratorAPI;
