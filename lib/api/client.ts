/**
 * Content Generator API Client
 * Centralized API client configuration using environment variables
 */

import { ContentGeneratorAPI } from './api-client';

// Get API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

/**
 * Default API client instance
 * Uses environment variable configuration
 */
export const apiClient = new ContentGeneratorAPI(API_URL);

/**
 * Create a custom API client with specific configuration
 * @param baseUrl - Custom base URL for the API
 * @returns Configured API client instance
 */
export function createApiClient(baseUrl: string): ContentGeneratorAPI {
  return new ContentGeneratorAPI(baseUrl);
}

/**
 * Get WebSocket URL for real-time connections
 * @param endpoint - WebSocket endpoint path
 * @returns Full WebSocket URL
 */
export function getWebSocketUrl(endpoint: string): string {
  return `${WS_URL}${endpoint}`;
}

/**
 * API configuration
 */
export const API_CONFIG = {
  baseUrl: API_URL,
  wsUrl: WS_URL,
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
} as const;

export { ContentGeneratorAPI };
