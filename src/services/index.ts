// Export API services
export * from './api';

// Export Auth services
export * from './auth';

// Create a unified services object
import { api } from './api';
import authService from './auth';

// Export all services from a single point
export const services = {
  api,
  auth: authService
}; 