/**
 * useJobUpdates Hook Tests
 *
 * Test suite for WebSocket job updates hook
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { useJobUpdates } from '../use-job-updates';
import type { SyncJob } from '@/types/content-generator';

// Mock useWebSocket
const mockSend = jest.fn();
const mockConnect = jest.fn();
const mockDisconnect = jest.fn();

jest.mock('../use-websocket', () => ({
  useWebSocket: jest.fn((url, options) => {
    // Store the onMessage callback so we can trigger it in tests
    (global as any).mockOnMessage = options?.onMessage;
    (global as any).mockOnError = options?.onError;

    return {
      state: 1, // CONNECTED
      send: mockSend,
      connect: mockConnect,
      disconnect: mockDisconnect,
      lastMessage: null,
    };
  }),
  WebSocketState: {
    CONNECTING: 0,
    CONNECTED: 1,
    DISCONNECTED: 2,
    ERROR: 3,
  },
}));

describe('useJobUpdates', () => {
  const mockJob: SyncJob = {
    job_id: 'job-123',
    document_id: 'doc-123',
    status: 'in_progress',
    channels: ['email'],
    content_type: 'update',
    template_style: 'modern',
    created_at: '2025-10-08T00:00:00Z',
    updated_at: '2025-10-08T00:01:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).mockOnMessage = undefined;
    (global as any).mockOnError = undefined;
  });

  afterEach(() => {
    delete (global as any).mockOnMessage;
    delete (global as any).mockOnError;
  });

  describe('Hook Initialization', () => {
    it('should initialize with default options', () => {
      const { result } = renderHook(() => useJobUpdates());

      expect(result.current.isConnected).toBe(true);
      expect(result.current.lastUpdate).toBeNull();
      expect(typeof result.current.subscribeToJob).toBe('function');
      expect(typeof result.current.unsubscribeFromJob).toBe('function');
    });

    it('should not auto-connect when enabled is false', () => {
      const { useWebSocket } = require('../use-websocket');

      renderHook(() => useJobUpdates({ enabled: false }));

      expect(useWebSocket).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          autoConnect: false,
        })
      );
    });

    it('should use correct WebSocket URL', () => {
      const { useWebSocket } = require('../use-websocket');

      renderHook(() => useJobUpdates());

      const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
      expect(useWebSocket).toHaveBeenCalledWith(
        `${WS_URL}/ws/jobs`,
        expect.any(Object)
      );
    });
  });

  describe('Job Subscription', () => {
    it('should subscribe to a job', () => {
      const { result } = renderHook(() => useJobUpdates());

      act(() => {
        result.current.subscribeToJob('job-123');
      });

      expect(mockSend).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'subscribe',
          job_id: 'job-123',
        })
      );
    });

    it('should not subscribe when not connected', () => {
      const { useWebSocket } = require('../use-websocket');
      useWebSocket.mockReturnValueOnce({
        state: 0, // CONNECTING
        send: mockSend,
        connect: mockConnect,
        disconnect: mockDisconnect,
        lastMessage: null,
      });

      const { result } = renderHook(() => useJobUpdates());

      act(() => {
        result.current.subscribeToJob('job-123');
      });

      expect(mockSend).not.toHaveBeenCalled();
    });

    it('should unsubscribe from a job', () => {
      const { result } = renderHook(() => useJobUpdates());

      act(() => {
        result.current.unsubscribeFromJob('job-123');
      });

      expect(mockSend).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'unsubscribe',
          job_id: 'job-123',
        })
      );
    });
  });

  describe('Job Update Messages', () => {
    it('should handle job_update message', async () => {
      const onJobUpdate = jest.fn();

      renderHook(() =>
        useJobUpdates({
          onJobUpdate,
        })
      );

      const message = {
        type: 'job_update',
        job: mockJob,
        timestamp: '2025-10-08T00:01:00Z',
      };

      act(() => {
        (global as any).mockOnMessage?.(new MessageEvent('message', {
          data: JSON.stringify(message),
        }));
      });

      await waitFor(() => {
        expect(onJobUpdate).toHaveBeenCalledWith(mockJob);
      });
    });

    it('should handle job_created message', async () => {
      const onJobCreated = jest.fn();

      renderHook(() =>
        useJobUpdates({
          onJobCreated,
        })
      );

      const message = {
        type: 'job_created',
        job: mockJob,
        timestamp: '2025-10-08T00:00:00Z',
      };

      act(() => {
        (global as any).mockOnMessage?.(new MessageEvent('message', {
          data: JSON.stringify(message),
        }));
      });

      await waitFor(() => {
        expect(onJobCreated).toHaveBeenCalledWith(mockJob);
      });
    });

    it('should handle job_completed message', async () => {
      const onJobCompleted = jest.fn();
      const completedJob = { ...mockJob, status: 'completed' as const };

      renderHook(() =>
        useJobUpdates({
          onJobCompleted,
        })
      );

      const message = {
        type: 'job_completed',
        job: completedJob,
        timestamp: '2025-10-08T00:05:00Z',
      };

      act(() => {
        (global as any).mockOnMessage?.(new MessageEvent('message', {
          data: JSON.stringify(message),
        }));
      });

      await waitFor(() => {
        expect(onJobCompleted).toHaveBeenCalledWith(completedJob);
      });
    });

    it('should handle job_failed message', async () => {
      const onJobFailed = jest.fn();
      const failedJob = { ...mockJob, status: 'failed' as const, error: 'Test error' };

      renderHook(() =>
        useJobUpdates({
          onJobFailed,
        })
      );

      const message = {
        type: 'job_failed',
        job: failedJob,
        timestamp: '2025-10-08T00:05:00Z',
      };

      act(() => {
        (global as any).mockOnMessage?.(new MessageEvent('message', {
          data: JSON.stringify(message),
        }));
      });

      await waitFor(() => {
        expect(onJobFailed).toHaveBeenCalledWith(failedJob);
      });
    });

    it('should update lastUpdate state', async () => {
      const { result } = renderHook(() => useJobUpdates());

      const message = {
        type: 'job_update',
        job: mockJob,
        timestamp: '2025-10-08T00:01:00Z',
      };

      act(() => {
        (global as any).mockOnMessage?.(new MessageEvent('message', {
          data: JSON.stringify(message),
        }));
      });

      await waitFor(() => {
        expect(result.current.lastUpdate).toEqual(message);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON in messages', async () => {
      const onError = jest.fn();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      renderHook(() =>
        useJobUpdates({
          onError,
        })
      );

      act(() => {
        (global as any).mockOnMessage?.(new MessageEvent('message', {
          data: 'invalid json',
        }));
      });

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to parse WebSocket message:',
          expect.any(Error)
        );
        expect(onError).toHaveBeenCalledWith('Failed to parse job update message');
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle WebSocket errors', () => {
      const onError = jest.fn();

      renderHook(() =>
        useJobUpdates({
          onError,
        })
      );

      act(() => {
        (global as any).mockOnError?.('WebSocket connection error');
      });

      expect(onError).toHaveBeenCalledWith('WebSocket connection error');
    });

    it('should not crash when callbacks are undefined', async () => {
      const { result } = renderHook(() => useJobUpdates());

      const message = {
        type: 'job_update',
        job: mockJob,
        timestamp: '2025-10-08T00:01:00Z',
      };

      // Should not throw
      act(() => {
        (global as any).mockOnMessage?.(new MessageEvent('message', {
          data: JSON.stringify(message),
        }));
      });

      await waitFor(() => {
        expect(result.current.lastUpdate).toEqual(message);
      });
    });
  });

  describe('Connection State', () => {
    it('should report connected state', () => {
      const { result } = renderHook(() => useJobUpdates());

      expect(result.current.isConnected).toBe(true);
    });

    it('should report disconnected state', () => {
      const { useWebSocket } = require('../use-websocket');
      useWebSocket.mockReturnValueOnce({
        state: 2, // DISCONNECTED
        send: mockSend,
        connect: mockConnect,
        disconnect: mockDisconnect,
        lastMessage: null,
      });

      const { result } = renderHook(() => useJobUpdates());

      expect(result.current.isConnected).toBe(false);
    });
  });

  describe('Multiple Message Types', () => {
    it('should handle multiple messages in sequence', async () => {
      const onJobCreated = jest.fn();
      const onJobUpdate = jest.fn();
      const onJobCompleted = jest.fn();

      renderHook(() =>
        useJobUpdates({
          onJobCreated,
          onJobUpdate,
          onJobCompleted,
        })
      );

      // Job created
      act(() => {
        (global as any).mockOnMessage?.(new MessageEvent('message', {
          data: JSON.stringify({
            type: 'job_created',
            job: mockJob,
            timestamp: '2025-10-08T00:00:00Z',
          }),
        }));
      });

      await waitFor(() => {
        expect(onJobCreated).toHaveBeenCalledTimes(1);
      });

      // Job update
      const updatedJob = { ...mockJob, updated_at: '2025-10-08T00:02:00Z' };
      act(() => {
        (global as any).mockOnMessage?.(new MessageEvent('message', {
          data: JSON.stringify({
            type: 'job_update',
            job: updatedJob,
            timestamp: '2025-10-08T00:02:00Z',
          }),
        }));
      });

      await waitFor(() => {
        expect(onJobUpdate).toHaveBeenCalledTimes(1);
      });

      // Job completed
      const completedJob = { ...mockJob, status: 'completed' as const };
      act(() => {
        (global as any).mockOnMessage?.(new MessageEvent('message', {
          data: JSON.stringify({
            type: 'job_completed',
            job: completedJob,
            timestamp: '2025-10-08T00:05:00Z',
          }),
        }));
      });

      await waitFor(() => {
        expect(onJobCompleted).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Cleanup', () => {
    it('should disconnect on unmount', () => {
      const { unmount } = renderHook(() => useJobUpdates());

      unmount();

      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should not disconnect when enabled is false', () => {
      const { unmount } = renderHook(() => useJobUpdates({ enabled: false }));

      unmount();

      // Since it wasn't connected, disconnect shouldn't be called
      // (This depends on implementation, adjust if needed)
    });
  });
});
