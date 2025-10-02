/**
 * Custom React Hooks
 *
 * This module exports all custom hooks for the Content Generator Dashboard.
 *
 * @module hooks
 */

// API Hooks
export {
  useHealthCheck,
  useJobs,
  useJob,
  useCacheStats,
  useGenerateContent,
  useBatchGenerate,
  useInvalidateCache,
  useClearCache,
  API_QUERY_KEYS,
} from './use-api';

// WebSocket Hook
export {
  useWebSocket,
  WebSocketState,
  type UseWebSocketOptions,
  type UseWebSocketReturn,
} from './use-websocket';

// LocalStorage Hooks
export {
  useLocalStorage,
  useLocalStorageBoolean,
  useLocalStorageNumber,
  useLocalStorageString,
  useLocalStorageArray,
  useLocalStorageObject,
  type UseLocalStorageOptions,
} from './use-local-storage';
