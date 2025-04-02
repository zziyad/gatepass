import { ApiClient } from './client';
import { MockApiClient } from './mock-client';

/**
 * Factory function to create the appropriate API client
 * based on environment configuration
 */
export function createApiClient(): ApiClient {
  // Check environment variable for mock API
  const useMockApi = import.meta.env.VITE_USE_MOCK_API === 'true';
  
  if (useMockApi) {
    console.log('Using MockApiClient for development');
    return new MockApiClient();
  }
  
  console.log('Using real ApiClient for production');
  return new ApiClient();
} 