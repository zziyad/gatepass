/**
 * API utility functions for backward compatibility with the old API structure.
 * New code should use the API client from '@/services/api' instead.
 * 
 * @deprecated Use the new API client from '@/services/api'
 */

import { apiClient } from '@/services/api';
import { api } from '@/services/api';
import { ApiRequestOptions, ApiResponse } from '@/services/api/types';

/**
 * Make an authenticated API request
 */
export async function apiRequest<T = any>({ method, args = {} }: ApiRequestOptions): Promise<ApiResponse<T>> {
  return apiClient.request<T>({ method, args });
}

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<ApiResponse> {
  return api.auth.login(email, password);
}

/**
 * Check if user is authenticated
 */
export async function verifyAuth(): Promise<boolean> {
  return api.auth.verifyAuth();
}

/**
 * Logout the current user
 */
export async function logout(): Promise<ApiResponse> {
  return api.auth.logout();
} 