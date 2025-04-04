import { AuthService } from './types';
import { ApiAuthService } from './api-auth-service';

// Re-export types for convenience
export * from './types';

/**
 * Factory function to create the appropriate auth service instance
 */
export function createAuthService(): AuthService {
  console.log('Using API authentication service');
  return new ApiAuthService();
}

/**
 * Default auth service instance
 */
const authService = createAuthService();

export default authService; 