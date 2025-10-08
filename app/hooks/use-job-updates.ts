/**
 * useJobUpdates Hook
 *
 * Custom hook for real-time job status updates via WebSocket
 * Connects to toombos-backend WebSocket endpoint and listens for job updates
 */

'use client';

import { useEffect, useCallback, useState } from 'react';
import { useWebSocket, WebSocketState } from './use-websocket';
import type { SyncJob } from '@/types/content-generator';

export interface JobUpdateMessage {
  type: 'job_update' | 'job_created' | 'job_completed' | 'job_failed';
  job: SyncJob;
  timestamp: string;
}

export interface UseJobUpdatesOptions {
  /**
   * Whether to automatically connect on mount
   * @default true
   */
  enabled?: boolean;

  /**
   * Callback fired when a job update is received
   */
  onJobUpdate?: (job: SyncJob) => void;

  /**
   * Callback fired when a new job is created
   */
  onJobCreated?: (job: SyncJob) => void;

  /**
   * Callback fired when a job is completed
   */
  onJobCompleted?: (job: SyncJob) => void;

  /**
   * Callback fired when a job fails
   */
  onJobFailed?: (job: SyncJob) => void;

  /**
   * Callback fired on connection errors
   */
  onError?: (error: string) => void;
}

export interface UseJobUpdatesReturn {
  /**
   * Current WebSocket connection state
   */
  connectionState: WebSocketState;

  /**
   * Last job update received
   */
  lastUpdate: JobUpdateMessage | null;

  /**
   * Whether the WebSocket is connected
   */
  isConnected: boolean;

  /**
   * Manually reconnect to the WebSocket
   */
  reconnect: () => void;

  /**
   * Disconnect from the WebSocket
   */
  disconnect: () => void;

  /**
   * Subscribe to updates for a specific job
   */
  subscribeToJob: (jobId: string) => void;

  /**
   * Unsubscribe from updates for a specific job
   */
  unsubscribeFromJob: (jobId: string) => void;
}

/**
 * Custom hook for real-time job updates via WebSocket
 *
 * @param options - Configuration options
 * @returns WebSocket connection state and control methods
 *
 * @example
 * ```tsx
 * const { isConnected, lastUpdate, subscribeToJob } = useJobUpdates({
 *   enabled: true,
 *   onJobUpdate: (job) => {
 *     console.log('Job updated:', job);
 *     // Update local state with new job data
 *   },
 *   onJobCompleted: (job) => {
 *     toast.success(`Job ${job.job_id} completed!`);
 *   },
 * });
 *
 * // Subscribe to specific job
 * useEffect(() => {
 *   subscribeToJob('job-123');
 *   return () => unsubscribeFromJob('job-123');
 * }, []);
 * ```
 */
export const useJobUpdates = (
  options: UseJobUpdatesOptions = {}
): UseJobUpdatesReturn => {
  const {
    enabled = true,
    onJobUpdate,
    onJobCreated,
    onJobCompleted,
    onJobFailed,
    onError,
  } = options;

  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
  const wsUrl = `${WS_URL}/ws/jobs`;

  const [lastUpdate, setLastUpdate] = useState<JobUpdateMessage | null>(null);

  /**
   * Handle incoming WebSocket messages
   */
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message: JobUpdateMessage = JSON.parse(event.data);

        // Update last update state
        setLastUpdate(message);

        // Call appropriate callback based on message type
        switch (message.type) {
          case 'job_created':
            onJobCreated?.(message.job);
            break;
          case 'job_update':
            onJobUpdate?.(message.job);
            break;
          case 'job_completed':
            onJobCompleted?.(message.job);
            break;
          case 'job_failed':
            onJobFailed?.(message.job);
            break;
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
        onError?.('Failed to parse job update message');
      }
    },
    [onJobUpdate, onJobCreated, onJobCompleted, onJobFailed, onError]
  );

  /**
   * Handle WebSocket errors
   */
  const handleError = useCallback(
    (event: Event) => {
      console.error('WebSocket error:', event);
      onError?.('WebSocket connection error');
    },
    [onError]
  );

  /**
   * Initialize WebSocket connection
   */
  const { state, send, connect, disconnect } = useWebSocket(wsUrl, {
    autoConnect: enabled,
    autoReconnect: true,
    reconnectDelay: 3000,
    maxReconnectAttempts: 5,
    onMessage: handleMessage,
    onError: handleError,
  });

  /**
   * Subscribe to updates for a specific job
   */
  const subscribeToJob = useCallback(
    (jobId: string) => {
      if (state === WebSocketState.CONNECTED) {
        send(
          JSON.stringify({
            type: 'subscribe',
            job_id: jobId,
          })
        );
      }
    },
    [state, send]
  );

  /**
   * Unsubscribe from updates for a specific job
   */
  const unsubscribeFromJob = useCallback(
    (jobId: string) => {
      if (state === WebSocketState.CONNECTED) {
        send(
          JSON.stringify({
            type: 'unsubscribe',
            job_id: jobId,
          })
        );
      }
    },
    [state, send]
  );

  /**
   * Reconnect to the WebSocket
   */
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => connect(), 100);
  }, [connect, disconnect]);

  return {
    connectionState: state,
    lastUpdate,
    isConnected: state === WebSocketState.CONNECTED,
    reconnect,
    disconnect,
    subscribeToJob,
    unsubscribeFromJob,
  };
};

export default useJobUpdates;
