import { AuthApiInterface, ApiResponse } from './types';
import  {ApiClient}  from './client';

const apiClient = new ApiClient();


/**
 * Auth API service for handling authentication-related requests
 */
class AuthApi implements AuthApiInterface {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<ApiResponse> {
    return apiClient.request({
      method: 'auth/signin',
      args: { email, password },
      requiresAuth: false,
    });
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<ApiResponse> {
    return apiClient.request({
      method: 'auth/signout',
      args: {},
    });
  }

  /**
   * Check if user is authenticated
   */
  async verifyAuth(): Promise<boolean> {
    return apiClient.isAuthenticated();
  }

  /**
   * Register a new user
   */
  async register(userData: {
    fullName: string;
    email: string;
    password: string;
    role?: string;
    departmentId?: string | number;
    position?: string;
  }): Promise<ApiResponse> {
    return apiClient.request({
      method: 'auth/register',
      args: userData,
      requiresAuth: false,
    });
  }
  
  /**
   * Get current user details
   */
  async getCurrentUser(): Promise<ApiResponse> {
    return apiClient.request({
      method: 'auth/verify',
      args: {},
    });
  }
  
  /**
   * Reset a user's password (self)
   */
  async resetPassword(oldPassword: string, newPassword: string): Promise<ApiResponse> {
    return apiClient.request({
      method: 'auth/resetPassword',
      args: { oldPassword, newPassword },
    });
  }
}

// Create and export singleton instance
export const authApi = new AuthApi(); 