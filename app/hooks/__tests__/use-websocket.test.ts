/**
 * useWebSocket Hook Tests
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useWebSocket, WebSocketState } from '../use-websocket';

// Mock WebSocket
class MockWebSocket {
  url: string;
  readyState: number = WebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;

  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
    // Simulate async connection
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 10);
  }

  send(data: string | ArrayBuffer | Blob): void {
    if (this.readyState === WebSocket.OPEN) {
      // Message sent successfully
    } else {
      throw new Error('WebSocket is not open');
    }
  }

  close(): void {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }

  // Helper to simulate incoming messages
  simulateMessage(data: string): void {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data }));
    }
  }

  // Helper to simulate errors
  simulateError(): void {
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }

  static instances: MockWebSocket[] = [];
  static clearInstances(): void {
    MockWebSocket.instances = [];
  }
  static getLatest(): MockWebSocket | undefined {
    return MockWebSocket.instances[MockWebSocket.instances.length - 1];
  }
}

// Replace global WebSocket
global.WebSocket = MockWebSocket as any;

describe('useWebSocket', () => {
  beforeEach(() => {
    MockWebSocket.clearInstances();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Connection Management', () => {
    it('should auto-connect on mount by default', async () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8000/test')
      );

      expect(result.current.state).toBe(WebSocketState.CONNECTING);

      act(() => {
        jest.advanceTimersByTime(20);
      });

      await waitFor(() => {
        expect(result.current.state).toBe(WebSocketState.CONNECTED);
      });
    });

    it('should not auto-connect when disabled', () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8000/test', { autoConnect: false })
      );

      expect(result.current.state).toBe(WebSocketState.DISCONNECTED);
      expect(MockWebSocket.instances.length).toBe(0);
    });

    it('should connect manually when connect() called', async () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8000/test', { autoConnect: false })
      );

      expect(result.current.state).toBe(WebSocketState.DISCONNECTED);

      act(() => {
        result.current.connect();
      });

      expect(result.current.state).toBe(WebSocketState.CONNECTING);

      act(() => {
        jest.advanceTimersByTime(20);
      });

      await waitFor(() => {
        expect(result.current.state).toBe(WebSocketState.CONNECTED);
      });
    });

    it('should disconnect when disconnect() called', async () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8000/test')
      );

      act(() => {
        jest.advanceTimersByTime(20);
      });

      await waitFor(() => {
        expect(result.current.state).toBe(WebSocketState.CONNECTED);
      });

      act(() => {
        result.current.disconnect();
      });

      expect(result.current.state).toBe(WebSocketState.DISCONNECTED);
    });

    it('should not connect if already connecting', async () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8000/test')
      );

      expect(result.current.state).toBe(WebSocketState.CONNECTING);

      // Try to connect again while connecting
      act(() => {
        result.current.connect();
      });

      // Should still only have one WebSocket instance
      expect(MockWebSocket.instances.length).toBe(1);
    });

    it('should not connect if already connected', async () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8000/test')
      );

      act(() => {
        jest.advanceTimersByTime(20);
      });

      await waitFor(() => {
        expect(result.current.state).toBe(WebSocketState.CONNECTED);
      });

      const instanceCount = MockWebSocket.instances.length;

      // Try to connect again while connected
      act(() => {
        result.current.connect();
      });

      // Should not create new instance
      expect(MockWebSocket.instances.length).toBe(instanceCount);
    });
  });

  describe('Message Handling', () => {
    it('should receive messages', async () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8000/test')
      );

      act(() => {
        jest.advanceTimersByTime(20);
      });

      await waitFor(() => {
        expect(result.current.state).toBe(WebSocketState.CONNECTED);
      });

      const ws = MockWebSocket.getLatest();

      act(() => {
        ws?.simulateMessage('test message');
      });

      await waitFor(() => {
        expect(result.current.lastMessage).not.toBeNull();
        expect(result.current.lastMessage?.data).toBe('test message');
      });
    });

    it('should send messages when connected', async () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8000/test')
      );

      act(() => {
        jest.advanceTimersByTime(20);
      });

      await waitFor(() => {
        expect(result.current.state).toBe(WebSocketState.CONNECTED);
      });

      const ws = MockWebSocket.getLatest();
      const sendSpy = jest.spyOn(ws!, 'send');

      act(() => {
        result.current.send('test data');
      });

      expect(sendSpy).toHaveBeenCalledWith('test data');
    });

    it('should not send messages when disconnected', () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8000/test', { autoConnect: false })
      );

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      act(() => {
        result.current.send('test data');
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should call onMessage callback', async () => {
      const onMessage = jest.fn();
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8000/test', { onMessage })
      );

      act(() => {
        jest.advanceTimersByTime(20);
      });

      await waitFor(() => {
        expect(result.current.state).toBe(WebSocketState.CONNECTED);
      });

      const ws = MockWebSocket.getLatest();

      act(() => {
        ws?.simulateMessage('callback test');
      });

      await waitFor(() => {
        expect(onMessage).toHaveBeenCalled();
      });
    });
  });

  describe('Event Callbacks', () => {
    it('should call onOpen callback', async () => {
      const onOpen = jest.fn();
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8000/test', { onOpen })
      );

      act(() => {
        jest.advanceTimersByTime(20);
      });

      await waitFor(() => {
        expect(onOpen).toHaveBeenCalled();
        expect(result.current.state).toBe(WebSocketState.CONNECTED);
      });
    });

    it('should call onClose callback', async () => {
      const onClose = jest.fn();
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8000/test', { onClose })
      );

      act(() => {
        jest.advanceTimersByTime(20);
      });

      await waitFor(() => {
        expect(result.current.state).toBe(WebSocketState.CONNECTED);
      });

      act(() => {
        result.current.disconnect();
      });

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('should call onError callback', async () => {
      const onError = jest.fn();
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8000/test', { onError })
      );

      act(() => {
        jest.advanceTimersByTime(20);
      });

      await waitFor(() => {
        expect(result.current.state).toBe(WebSocketState.CONNECTED);
      });

      const ws = MockWebSocket.getLatest();

      act(() => {
        ws?.simulateError();
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
        expect(result.current.state).toBe(WebSocketState.ERROR);
      });
    });
  });

  describe('Auto-Reconnect', () => {
    it('should auto-reconnect after disconnect', async () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8000/test', {
          autoReconnect: true,
          reconnectDelay: 1000,
        })
      );

      act(() => {
        jest.advanceTimersByTime(20);
      });

      await waitFor(() => {
        expect(result.current.state).toBe(WebSocketState.CONNECTED);
      });

      const ws = MockWebSocket.getLatest();

      // Simulate disconnect
      act(() => {
        ws?.close();
      });

      await waitFor(() => {
        expect(result.current.state).toBe(WebSocketState.DISCONNECTED);
      });

      // Wait for reconnect delay
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.reconnectAttempt).toBe(1);
    });

    it('should not auto-reconnect when disabled', async () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8000/test', {
          autoReconnect: false,
        })
      );

      act(() => {
        jest.advanceTimersByTime(20);
      });

      await waitFor(() => {
        expect(result.current.state).toBe(WebSocketState.CONNECTED);
      });

      const ws = MockWebSocket.getLatest();
      const instanceCount = MockWebSocket.instances.length;

      // Simulate disconnect
      act(() => {
        ws?.close();
      });

      await waitFor(() => {
        expect(result.current.state).toBe(WebSocketState.DISCONNECTED);
      });

      // Wait for potential reconnect
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Should not create new connection
      expect(MockWebSocket.instances.length).toBe(instanceCount);
    });

    it('should respect max reconnect attempts', async () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8000/test', {
          autoReconnect: true,
          reconnectDelay: 100,
          maxReconnectAttempts: 3,
        })
      );

      act(() => {
        jest.advanceTimersByTime(20);
      });

      await waitFor(() => {
        expect(result.current.state).toBe(WebSocketState.CONNECTED);
      });

      // Simulate multiple disconnects
      for (let i = 0; i < 4; i++) {
        const ws = MockWebSocket.getLatest();
        act(() => {
          ws?.close();
        });

        act(() => {
          jest.advanceTimersByTime(150);
        });
      }

      // Should stop at max attempts
      await waitFor(() => {
        expect(result.current.reconnectAttempt).toBeLessThanOrEqual(3);
      });
    });

    it('should reset reconnect attempts on successful connection', async () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8000/test', {
          autoReconnect: true,
          reconnectDelay: 100,
        })
      );

      act(() => {
        jest.advanceTimersByTime(20);
      });

      await waitFor(() => {
        expect(result.current.state).toBe(WebSocketState.CONNECTED);
      });

      // Simulate disconnect and reconnect
      const ws1 = MockWebSocket.getLatest();
      act(() => {
        ws1?.close();
      });

      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(result.current.reconnectAttempt).toBeGreaterThan(0);

      // Wait for reconnection
      act(() => {
        jest.advanceTimersByTime(20);
      });

      await waitFor(() => {
        expect(result.current.state).toBe(WebSocketState.CONNECTED);
        expect(result.current.reconnectAttempt).toBe(0);
      });
    });
  });

  describe('Cleanup', () => {
    it('should disconnect on unmount', async () => {
      const { result, unmount } = renderHook(() =>
        useWebSocket('ws://localhost:8000/test')
      );

      act(() => {
        jest.advanceTimersByTime(20);
      });

      await waitFor(() => {
        expect(result.current.state).toBe(WebSocketState.CONNECTED);
      });

      const ws = MockWebSocket.getLatest();
      const closeSpy = jest.spyOn(ws!, 'close');

      unmount();

      expect(closeSpy).toHaveBeenCalled();
    });

    it('should clear reconnect timeout on disconnect', async () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8000/test', {
          autoReconnect: true,
          reconnectDelay: 5000,
        })
      );

      act(() => {
        jest.advanceTimersByTime(20);
      });

      await waitFor(() => {
        expect(result.current.state).toBe(WebSocketState.CONNECTED);
      });

      const ws = MockWebSocket.getLatest();

      // Simulate disconnect (which would trigger reconnect)
      act(() => {
        ws?.close();
      });

      // Manually disconnect before reconnect timeout
      act(() => {
        result.current.disconnect();
      });

      // Advance time past reconnect delay
      act(() => {
        jest.advanceTimersByTime(6000);
      });

      // Should not have reconnected
      expect(result.current.reconnectAttempt).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle WebSocket constructor errors', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock WebSocket to throw error
      const OriginalWebSocket = global.WebSocket;
      global.WebSocket = jest.fn(() => {
        throw new Error('Connection failed');
      }) as any;

      const { result } = renderHook(() =>
        useWebSocket('ws://invalid-url')
      );

      expect(result.current.state).toBe(WebSocketState.ERROR);
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Restore
      global.WebSocket = OriginalWebSocket;
      consoleErrorSpy.mockRestore();
    });

    it('should handle infinite reconnect attempts', async () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8000/test', {
          autoReconnect: true,
          reconnectDelay: 100,
          maxReconnectAttempts: 0, // infinite
        })
      );

      act(() => {
        jest.advanceTimersByTime(20);
      });

      await waitFor(() => {
        expect(result.current.state).toBe(WebSocketState.CONNECTED);
      });

      // Simulate many disconnects
      for (let i = 0; i < 10; i++) {
        const ws = MockWebSocket.getLatest();
        act(() => {
          ws?.close();
        });

        act(() => {
          jest.advanceTimersByTime(150);
        });
      }

      // Should keep attempting
      expect(result.current.reconnectAttempt).toBeGreaterThan(5);
    });

    it('should handle rapid connect/disconnect cycles', async () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8000/test', { autoConnect: false })
      );

      // Rapid connect/disconnect
      act(() => {
        result.current.connect();
        result.current.disconnect();
        result.current.connect();
        result.current.disconnect();
      });

      expect(result.current.state).toBe(WebSocketState.DISCONNECTED);
    });
  });
});
