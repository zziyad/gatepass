import { ApiClient } from './client';

/**
 * Factory function to create the appropriate API client
 */
export function createApiClient(): ApiClient {
  console.log('Using ApiClient');
  return new ApiClient();
} 