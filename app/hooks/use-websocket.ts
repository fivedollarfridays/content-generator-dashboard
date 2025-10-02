'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * WebSocket connection states
 */
export enum WebSocketState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

/**
 * WebSocket hook options
 */
export interface UseWebSocketOptions {
  /**
   * Whether to automatically connect on mount
   * @default true
   */
  autoConnect?: boolean;

  /**
   * Whether to automatically reconnect on disconnect
   * @default true
   */
  autoReconnect?: boolean;

  /**
   * Reconnection delay in milliseconds
   * @default 3000
   */
  reconnectDelay?: number;

  /**
   * Maximum number of reconnection attempts (0 = infinite)
   * @default 5
   */
  maxReconnectAttempts?: number;

  /**
   * Callback fired when connection is established
   */
  onOpen?: (event: Event) => void;

  /**
   * Callback fired when connection is closed
   */
  onClose?: (event: CloseEvent) => void;

  /**
   * Callback fired when an error occurs
   */
  onError?: (event: Event) => void;

  /**
   * Callback fired when a message is received
   */
  onMessage?: (event: MessageEvent) => void;
}

/**
 * WebSocket hook return type
 */
export interface UseWebSocketReturn {
  /**
   * Current WebSocket connection state
   */
  state: WebSocketState;

  /**
   * Last message received from the WebSocket
   */
  lastMessage: MessageEvent | null;

  /**
   * Send a message through the WebSocket
   * @param data - Data to send (string, ArrayBuffer, or Blob)
   */
  send: (data: string | ArrayBuffer | Blob) => void;

  /**
   * Manually connect to the WebSocket
   */
  connect: () => void;

  /**
   * Manually disconnect from the WebSocket
   */
  disconnect: () => void;

  /**
   * Current reconnection attempt count
   */
  reconnectAttempt: number;
}

/**
 * Custom hook for managing WebSocket connections
 *
 * Provides automatic connection management, reconnection logic,
 * and message handling for WebSocket connections.
 *
 * @param url - WebSocket URL to connect to
 * @param options - Configuration options for the WebSocket connection
 * @returns WebSocket connection state and control methods
 *
 * @example
 * ```tsx
 * const { state, lastMessage, send, connect, disconnect } = useWebSocket(
 *   'ws://localhost:8000/ws/jobs',
 *   {
 *     autoConnect: true,
 *     autoReconnect: true,
 *     onMessage: (event) => {
 *       const data = JSON.parse(event.data);
 *       console.log('Received:', data);
 *     },
 *   }
 * );
 *
 * // Send a message
 * send(JSON.stringify({ type: 'subscribe', channel: 'jobs' }));
 *
 * // Manual control
 * if (state === WebSocketState.DISCONNECTED) {
 *   connect();
 * }
 * ```
 */
export const useWebSocket = (
  url: string,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn => {
  const {
    autoConnect = true,
    autoReconnect = true,
    reconnectDelay = 3000,
    maxReconnectAttempts = 5,
    onOpen,
    onClose,
    onError,
    onMessage,
  } = options;

  const [state, setState] = useState<WebSocketState>(
    WebSocketState.DISCONNECTED
  );
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState<number>(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldConnectRef = useRef<boolean>(autoConnect);

  /**
   * Establish WebSocket connection
   */
  const connect = useCallback((): void => {
    // Don't connect if already connecting or connected
    if (
      state === WebSocketState.CONNECTING ||
      state === WebSocketState.CONNECTED
    ) {
      return;
    }

    setState(WebSocketState.CONNECTING);
    shouldConnectRef.current = true;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = (event: Event): void => {
        setState(WebSocketState.CONNECTED);
        setReconnectAttempt(0);
        onOpen?.(event);
      };

      ws.onclose = (event: CloseEvent): void => {
        setState(WebSocketState.DISCONNECTED);
        wsRef.current = null;
        onClose?.(event);

        // Auto-reconnect if enabled and within attempt limits
        if (
          shouldConnectRef.current &&
          autoReconnect &&
          (maxReconnectAttempts === 0 ||
            reconnectAttempt < maxReconnectAttempts)
        ) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempt(prev => prev + 1);
            connect();
          }, reconnectDelay);
        }
      };

      ws.onerror = (event: Event): void => {
        setState(WebSocketState.ERROR);
        onError?.(event);
      };

      ws.onmessage = (event: MessageEvent): void => {
        setLastMessage(event);
        onMessage?.(event);
      };
    } catch (error) {
      setState(WebSocketState.ERROR);
      console.error('WebSocket connection error:', error);
    }
  }, [
    url,
    state,
    autoReconnect,
    reconnectDelay,
    maxReconnectAttempts,
    reconnectAttempt,
    onOpen,
    onClose,
    onError,
    onMessage,
  ]);

  /**
   * Close WebSocket connection
   */
  const disconnect = useCallback((): void => {
    shouldConnectRef.current = false;

    // Clear any pending reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close the WebSocket if it exists
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setState(WebSocketState.DISCONNECTED);
    setReconnectAttempt(0);
  }, []);

  /**
   * Send data through the WebSocket
   */
  const send = useCallback(
    (data: string | ArrayBuffer | Blob): void => {
      if (
        wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN &&
        state === WebSocketState.CONNECTED
      ) {
        wsRef.current.send(data);
      } else {
        console.warn('WebSocket is not connected. Message not sent:', data);
      }
    },
    [state]
  );

  /**
   * Auto-connect on mount if enabled
   */
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return (): void => {
      disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    state,
    lastMessage,
    send,
    connect,
    disconnect,
    reconnectAttempt,
  };
};
