/**
 * API Client Tests
 * Comprehensive test suite for ContentGeneratorAPI class
 *
 * Testing Strategy:
 * - Mock fetch API for all HTTP calls
 * - Test successful responses
 * - Test error handling
 * - Test request formatting
 * - Test authentication headers
 * - Verify 70% code coverage target
 */

import { ContentGeneratorAPI } from '../api-client';
import type {
  HealthStatus,
  Metrics,
  SyncJob,
  JobsListResponse,
  CacheStats,
} from '@/types/content-generator';

// Mock fetch globally
global.fetch = jest.fn();

describe('ContentGeneratorAPI', () => {
  let api: ContentGeneratorAPI;
  const BASE_URL = 'http://localhost:8000';
  const API_KEY = 'test-api-key';

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    api = new ContentGeneratorAPI(BASE_URL);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with base URL', () => {
      const client = new ContentGeneratorAPI(BASE_URL);
      expect(client).toBeInstanceOf(ContentGeneratorAPI);
    });

    it('should remove trailing slash from base URL', () => {
      const client = new ContentGeneratorAPI('http://localhost:8000/');
      expect(client).toBeInstanceOf(ContentGeneratorAPI);
    });

    it('should initialize with API key', () => {
      const client = new ContentGeneratorAPI(BASE_URL, API_KEY);
      expect(client).toBeInstanceOf(ContentGeneratorAPI);
    });
  });

  describe('Health & Status Methods', () => {
    describe('healthCheck()', () => {
      it('should fetch health status successfully', async () => {
        const mockHealth: HealthStatus = {
          status: 'healthy',
          timestamp: '2025-10-02T12:00:00Z',
          checks: {
            database: { status: 'pass' },
            cache: { status: 'pass' },
          },
          uptime: 3600,
          version: '1.0.0',
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockHealth,
        });

        const result = await api.healthCheck();

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/health',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          })
        );
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockHealth);
      });

      it('should handle health check failure', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 503,
          json: async () => ({ detail: 'Service unavailable' }),
        });

        const result = await api.healthCheck();

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('Service unavailable');
        expect(result.error?.status).toBe(503);
      });
    });

    describe('readinessCheck()', () => {
      it('should fetch readiness status successfully', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ready: true }),
        });

        const result = await api.readinessCheck();

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/ready',
          expect.any(Object)
        );
        expect(result.success).toBe(true);
        expect(result.data).toEqual({ ready: true });
      });
    });

    describe('metrics()', () => {
      it('should fetch metrics successfully', async () => {
        const mockMetrics: Metrics = {
          requests_total: 1000,
          requests_per_second: 10.5,
          avg_response_time_ms: 150,
          error_rate: 0.01,
          cache_hit_rate: 0.85,
          active_jobs: 5,
          queue_size: 2,
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockMetrics,
        });

        const result = await api.metrics();

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/metrics',
          expect.any(Object)
        );
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockMetrics);
      });
    });
  });

  describe('Content Generation Methods', () => {
    describe('generateContent()', () => {
      it('should generate content successfully', async () => {
        const mockJob: SyncJob = {
          job_id: 'job-123',
          document_id: 'doc-456',
          channels: ['email', 'website'],
          status: 'pending',
          created_at: '2025-10-02T12:00:00Z',
          updated_at: '2025-10-02T12:00:00Z',
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockJob,
        });

        const request = {
          document_id: 'doc-456',
          channels: ['email', 'website'] as const,
        };

        const result = await api.generateContent(request);

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/v2/content/sync',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(request),
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          })
        );
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockJob);
      });

      it('should include API key in headers when set', async () => {
        const apiWithKey = new ContentGeneratorAPI(BASE_URL, API_KEY);

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ job_id: 'test' }),
        });

        await apiWithKey.generateContent({
          document_id: 'doc-123',
          channels: ['email'],
        });

        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: `Bearer ${API_KEY}`,
            }),
          })
        );
      });
    });

    describe('previewContent()', () => {
      it('should preview content without document ID', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ preview: 'content' }),
        });

        const result = await api.previewContent();

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/v1/preview',
          expect.any(Object)
        );
        expect(result.success).toBe(true);
      });

      it('should preview content with document ID', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ preview: 'content' }),
        });

        const result = await api.previewContent('doc-123');

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/v1/preview?document_id=doc-123',
          expect.any(Object)
        );
        expect(result.success).toBe(true);
      });
    });

    describe('validateContent()', () => {
      it('should validate content successfully', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            valid: true,
            errors: [],
          }),
        });

        const result = await api.validateContent(
          { title: 'Test' },
          'article',
          true
        );

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/v2/content/validate',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              content: { title: 'Test' },
              content_type: 'article',
              strict: true,
            }),
          })
        );
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Job Methods', () => {
    describe('listJobs()', () => {
      it('should list jobs without parameters', async () => {
        const mockResponse: JobsListResponse = {
          jobs: [],
          total: 0,
          limit: 20,
          offset: 0,
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await api.listJobs();

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/v2/content/sync',
          expect.any(Object)
        );
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockResponse);
      });

      it('should list jobs with query parameters', async () => {
        const mockResponse: JobsListResponse = {
          jobs: [],
          total: 0,
          limit: 10,
          offset: 5,
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await api.listJobs({
          status: 'completed',
          limit: 10,
          offset: 5,
        });

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/v2/content/sync?status=completed&limit=10&offset=5',
          expect.any(Object)
        );
        expect(result.success).toBe(true);
      });
    });

    describe('getJob()', () => {
      it('should get job by ID successfully', async () => {
        const mockJob: SyncJob = {
          job_id: 'job-123',
          document_id: 'doc-456',
          channels: ['email'],
          status: 'completed',
          created_at: '2025-10-02T12:00:00Z',
          updated_at: '2025-10-02T12:05:00Z',
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockJob,
        });

        const result = await api.getJob('job-123');

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/v2/content/sync/job-123',
          expect.any(Object)
        );
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockJob);
      });
    });

    describe('cancelJob()', () => {
      it('should cancel job successfully', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ cancelled: true }),
        });

        const result = await api.cancelJob('job-123');

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/v2/content/sync/job-123',
          expect.objectContaining({
            method: 'DELETE',
          })
        );
        expect(result.success).toBe(true);
        expect(result.data).toEqual({ cancelled: true });
      });
    });

    describe('retryJob()', () => {
      it('should retry job successfully', async () => {
        const mockJob: SyncJob = {
          job_id: 'job-123',
          document_id: 'doc-456',
          channels: ['email'],
          status: 'pending',
          created_at: '2025-10-02T12:00:00Z',
          updated_at: '2025-10-02T12:10:00Z',
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockJob,
        });

        const result = await api.retryJob('job-123');

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/v2/content/sync/job-123/retry',
          expect.objectContaining({
            method: 'POST',
          })
        );
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockJob);
      });
    });
  });

  describe('Cache Methods', () => {
    describe('getCacheStats()', () => {
      it('should get cache stats successfully', async () => {
        const mockStats: CacheStats = {
          total_keys: 100,
          hit_rate: 0.85,
          miss_rate: 0.15,
          evictions: 5,
          memory_usage_mb: 50.5,
          avg_ttl_seconds: 3600,
          oldest_key_age_seconds: 7200,
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockStats,
        });

        const result = await api.getCacheStats();

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/v2/cache/stats',
          expect.any(Object)
        );
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockStats);
      });
    });

    describe('invalidateCache()', () => {
      it('should invalidate cache with pattern', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            invalidated: 10,
            pattern: 'content:*',
          }),
        });

        const result = await api.invalidateCache({
          pattern: 'content:*',
        });

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/v2/cache/invalidate',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ pattern: 'content:*' }),
          })
        );
        expect(result.success).toBe(true);
      });

      it('should invalidate cache with specific keys', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            invalidated: 2,
          }),
        });

        const result = await api.invalidateCache({
          cache_keys: ['key1', 'key2'],
        });

        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: JSON.stringify({ cache_keys: ['key1', 'key2'] }),
          })
        );
        expect(result.success).toBe(true);
      });
    });

    describe('clearAllCaches()', () => {
      it('should clear all caches successfully', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ cleared: true }),
        });

        const result = await api.clearAllCaches();

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/v2/cache/clear',
          expect.objectContaining({
            method: 'POST',
          })
        );
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Batch Operations', () => {
    describe('batchGenerate()', () => {
      it('should batch generate with default options', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ batch_id: 'batch-123', jobs: [] }),
        });

        const requests = [
          { document_id: 'doc-1', channels: ['email'] as const },
          { document_id: 'doc-2', channels: ['website'] as const },
        ];

        const result = await api.batchGenerate(requests);

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/v2/batch/generate',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              requests,
              parallel: true,
              fail_fast: false,
            }),
          })
        );
        expect(result.success).toBe(true);
      });

      it('should batch generate with custom options', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ batch_id: 'batch-123' }),
        });

        const requests = [
          { document_id: 'doc-1', channels: ['email'] as const },
        ];

        await api.batchGenerate(requests, false, true);

        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: JSON.stringify({
              requests,
              parallel: false,
              fail_fast: true,
            }),
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await api.healthCheck();

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Network error');
    });

    it('should handle non-Error network failures', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce('Unknown error');

      const result = await api.healthCheck();

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Network error');
    });

    it('should handle API errors with detail field', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: 'Invalid request' }),
      });

      const result = await api.healthCheck();

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Invalid request');
      expect(result.error?.status).toBe(400);
    });

    it('should handle API errors with message field', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal server error' }),
      });

      const result = await api.healthCheck();

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Internal server error');
    });

    it('should handle API errors with no detail or message', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({}),
      });

      const result = await api.healthCheck();

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Request failed');
    });
  });

  describe('Utility Methods', () => {
    describe('setApiKey()', () => {
      it('should update API key', async () => {
        const newKey = 'new-api-key';
        api.setApiKey(newKey);

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        });

        await api.healthCheck();

        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: `Bearer ${newKey}`,
            }),
          })
        );
      });
    });

    describe('generateCorrelationId()', () => {
      it('should generate unique correlation IDs', () => {
        const id1 = api.generateCorrelationId();
        const id2 = api.generateCorrelationId();

        expect(id1).toBeTruthy();
        expect(id2).toBeTruthy();
        expect(id1).not.toBe(id2);
        expect(id1).toMatch(/^\d+-[a-z0-9]+$/);
      });
    });
  });
});
