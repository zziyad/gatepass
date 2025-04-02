import { apiClient } from './client';
import { AdminApiInterface, ApiResponse } from './types';

/**
 * Admin API service for handling administrative operations
 */
class AdminApi implements AdminApiInterface {
  /**
   * Get all departments
   */
  async getDepartments(): Promise<ApiResponse> {
    return apiClient.request({
      method: 'admin/departments',
    });
  }

  /**
   * Create a new department
   */
  async createDepartment(name: string): Promise<ApiResponse> {
    return apiClient.request({
      method: 'admin/createDepartment',
      args: { name },
    });
  }

  /**
   * Update an existing department
   */
  async updateDepartment(id: number, name: string): Promise<ApiResponse> {
    return apiClient.request({
      method: 'admin/updateDepartment',
      args: { id, name },
    });
  }

  /**
   * Delete a department
   */
  async deleteDepartment(id: number): Promise<ApiResponse> {
    return apiClient.request({
      method: 'admin/deleteDepartment',
      args: { id },
    });
  }

  /**
   * Get all removal reasons
   */
  async getRemovalReasons(): Promise<ApiResponse> {
    return apiClient.request({
      method: 'admin/removalReasons',
    });
  }

  /**
   * Create a new removal reason
   */
  async createRemovalReason(name: string): Promise<ApiResponse> {
    return apiClient.request({
      method: 'admin/createRemovalReason',
      args: { name },
    });
  }

  /**
   * Update an existing removal reason
   */
  async updateRemovalReason(id: string, name: string): Promise<ApiResponse> {
    return apiClient.request({
      method: 'admin/updateRemovalReason',
      args: { id, name },
    });
  }

  /**
   * Delete a removal reason
   */
  async deleteRemovalReason(id: string): Promise<ApiResponse> {
    return apiClient.request({
      method: 'admin/deleteRemovalReason',
      args: { id },
    });
  }

  /**
   * Get all users
   */
  async getUsers(): Promise<ApiResponse> {
    return apiClient.request({
      method: 'admin/users',
    });
  }

  /**
   * Create a new user
   */
  async createUser(userData: Record<string, any>): Promise<ApiResponse> {
    return apiClient.request({
      method: 'admin/createUser',
      args: userData,
    });
  }

  /**
   * Update an existing user
   */
  async updateUser(id: number, userData: Record<string, any>): Promise<ApiResponse> {
    return apiClient.request({
      method: 'admin/updateUser',
      args: { id, ...userData },
    });
  }

  /**
   * Delete a user
   */
  async deleteUser(id: number): Promise<ApiResponse> {
    return apiClient.request({
      method: 'admin/deleteUser',
      args: { id },
    });
  }

  /**
   * Reset a user's password
   */
  async resetPassword(id: number): Promise<ApiResponse> {
    return apiClient.request({
      method: 'admin/resetPassword',
      args: { id },
    });
  }
}

// Create and export singleton instance
export const adminApi = new AdminApi(); 