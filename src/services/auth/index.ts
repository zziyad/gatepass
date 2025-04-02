import { AuthService } from './types';
import { ApiAuthService } from './api-auth-service';
import { MockAuthService } from './mock-auth-service';

// Re-export types for convenience
export * from './types';

/**
 * Environment configuration to determine which auth service to use
 */
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

/**
 * Factory function to create the appropriate auth service instance
 */
export function createAuthService(): AuthService {
  if (USE_MOCK_AUTH) {
    console.log('Using mock authentication service');
    return new MockAuthService();
  }

  console.log('Using API authentication service');
  return new ApiAuthService();
}

/**
 * Default auth service instance
 */
const authService = createAuthService();

export default authService; 