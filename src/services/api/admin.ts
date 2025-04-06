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
      method: 'admin/department/departments',
      args: {},
    });
  }

  /**
   * Create a new department
   */
  async createDepartment(name: string): Promise<ApiResponse> {
    return apiClient.request({
      method: 'admin/department/add',
      args: { name },
    });
  }

  /**
   * Update an existing department
   */
  async updateDepartment(id: number, name: string): Promise<ApiResponse> {
    return apiClient.request({
      method: 'admin/department/update',
      args: { id, name },
    });
  }

  /**
   * Delete a department
   */
  async deleteDepartment(id: number): Promise<ApiResponse> {
    return apiClient.request({
      method: 'admin/department/delete',
      args: { id },
    });
  }

  /**
   * Get all removal reasons
   */
  async getRemovalReasons(): Promise<ApiResponse> {
    return apiClient.request({
      method: 'admin/removalreason/removalreasons',
    });
  }

  /**
   * Create a new removal reason
   */
  async createRemovalReason(name: string): Promise<ApiResponse> {
    return apiClient.request({
      method: 'admin/removalreason/add',
      args: { name },
    });
  }

  /**
   * Update an existing removal reason
   */
  async updateRemovalReason(id: string, name: string): Promise<ApiResponse> {
    return apiClient.request({
      method: 'admin/removalreason/update',
      args: { id, name },
    });
  }

  /**
   * Delete a removal reason
   */
  async deleteRemovalReason(id: string): Promise<ApiResponse> {
    return apiClient.request({
      method: 'admin/removalreason/delete',
      args: { id },
    });
  }

  /**
   * Get all users
   */
  async getUsers(): Promise<ApiResponse> {
    return apiClient.request({
      method: 'user/users',
    });
  }

  /**
   * Create a new user
   */
  async createUser(userData: Record<string, any>): Promise<ApiResponse> {
    return apiClient.request({
      method: 'auth/register',
      args: userData,
    });
  }

  /**
   * Update an existing user
   */
  async updateUser(id: number, email: string, role: string, departmentId: number, position?: string): Promise<ApiResponse> {
    return apiClient.request({
      method: 'user/update',
      args: { id, email, role, departmentId, position },
    });
  }

  /**
   * Delete a user
   */
  async deleteUser(id: number): Promise<ApiResponse> {
    return apiClient.request({
      method: 'user/delete',
      args: { id },
    });
  }

  /**
   * Reset a user's password
   */
  async resetPassword(id: number, newPassword: string): Promise<ApiResponse> {
    return apiClient.request({
      method: 'user/passwordreset',
      args: { id, newPassword },
    });
  }
}

// Create and export singleton instance
export const adminApi = new AdminApi(); 