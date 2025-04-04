import { ApiRequestOptions, ApiResponse } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * API client configuration
 */
interface ApiClientConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
}

/**
 * Middleware function type
 */
export type ApiMiddleware = (
  options: ApiRequestOptions
) => Promise<ApiRequestOptions> | ApiRequestOptions;

// Default configuration
const defaultConfig: ApiClientConfig = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8001/api',
  defaultHeaders: {
    'Content-Type': 'application/json',
  }
};

/**
 * Enhanced API client with middleware support and error handling
 */
export class ApiClient {
  private config: ApiClientConfig;
  private middlewares: ApiMiddleware[] = [];

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = {
      ...defaultConfig,
      ...config,
      defaultHeaders: {
        ...defaultConfig.defaultHeaders,
        ...config.defaultHeaders
      }
    };
  }

  /**
   * Add middleware to the API client
   */
  addMiddleware(middleware: ApiMiddleware): void {
    this.middlewares.push(middleware);
  }

  /**
   * Clear all middlewares
   */
  clearMiddlewares(): void {
    this.middlewares = [];
  }

  /**
   * Make a request to the API
   */
  async request<T = any>(options: ApiRequestOptions): Promise<ApiResponse<T>> {
    // Process options through middleware chain
    let processedOptions = { ...options };
    
    for (const middleware of this.middlewares) {
      processedOptions = await middleware(processedOptions);
    }

    const { method, args = {}, requiresAuth = true } = processedOptions;
    const requestId = Math.floor(Math.random() * 10000);

    try {
      // Log request in development
      if (import.meta.env.DEV) {
        console.log(`[API Request] ${method}`, args);
      }

      // Build request body
      const requestBody = {
        id: requestId,
        type: 'call',
        method,
        args,
      };

      // Make the request
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: this.config.defaultHeaders as Record<string, string>,
        body: JSON.stringify(requestBody),
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Log response in development
      if (import.meta.env.DEV) {
        console.log(`[API Response] ${method}`, data);
      }

      // Handle API error responses
      if (data.result?.status === 'error') {
        throw new Error(data.result.error || 'Unknown API error');
      }

      return data;
    } catch (error) {
      console.error(`API request failed (${method}):`, error);
      
      // Return a standardized error response
      return {
        type: 'callback',
        id: requestId,
        result: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Check if the user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const response = await this.request({
        method: 'auth/verify',
        args: {},
        requiresAuth: false // Don't require auth to check auth status
      });
      return response.result?.status === 'logged';
    } catch (error) {
      console.error('Authentication check failed:', error);
      // If cookies exist, give the benefit of the doubt rather than immediately returning false
      const hasCookies = document.cookie.includes('token') || document.cookie.includes('auth') || document.cookie.length > 0;
      if (hasCookies && error instanceof Error && error.message.includes('Network') || error.message.includes('Failed to fetch')) {
        // If there's a network error but we have cookies, assume user is authenticated
        console.warn('Network error during auth check but cookies exist - assuming authenticated');
        return true;
      }
      return false;
    }
  }
}

// Create and export a default API client instance
const apiClient = new ApiClient();

// Export the client
export { apiClient }; 