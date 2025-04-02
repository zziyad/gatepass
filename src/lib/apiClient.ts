/**
 * This file exists for backward compatibility.
 * It re-exports the new API client and provides a facade over it.
 * New code should directly import from '@/services/api' instead.
 *
 * @deprecated Use the new API client from '@/services/api'
 */

import { apiClient as client } from '@/services/api/client';
import { authApi } from '@/services/api/auth';
import { ApiRequestOptions, ApiResponse } from '@/services/api/types';

/**
 * Legacy function interface for backward compatibility
 */
export const apiClient = async <TResponse = any>(
  options: ApiRequestOptions
): Promise<ApiResponse<TResponse>> => {
  // Forward to new client
  return client.request<TResponse>(options);
};

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  return authApi.verifyAuth();
};

/**
 * Login with email and password
 */
export const login = async (email: string, password: string): Promise<ApiResponse> => {
  return authApi.login(email, password);
};

/**
 * Logout the current user
 */
export const logout = async (): Promise<ApiResponse> => {
  return authApi.logout();
};
