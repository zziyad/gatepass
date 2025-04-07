// Export all API interfaces
export * from './types';

// Export API client class
export { ApiClient } from './client';

// Import service implementations
import { authApi } from './auth';
import { adminApi } from './admin';
import { requestsApi } from './requests';

// Re-export service implementations
export { authApi, adminApi, requestsApi };

// Create API client instance using factory
import { createApiClient } from './factory';

// Create the API client instance
const apiClient = createApiClient();

// Re-export the API client instance
export { apiClient };

// Create a unified API object for convenience
export const api = {
  client: apiClient,
  auth: authApi,
  admin: adminApi,
  requests: requestsApi
}; 