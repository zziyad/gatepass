import { apiClient } from './client';
import { RequestsApiInterface, ApiResponse } from './types';

/**
 * Requests API service for handling removal request operations
 */
class RequestsApi implements RequestsApiInterface {
  /**
   * Get all requests
   */
  async getRequests(): Promise<ApiResponse> {
    return apiClient.request({
      method: 'requests/list',
    });
  }

  /**
   * Get a specific request by ID
   */
  async getRequest(id: string): Promise<ApiResponse> {
    return apiClient.request({
      method: 'requests/get',
      args: { id },
    });
  }

  /**
   * Create a new request
   */
  async createRequest(data: Record<string, any>): Promise<ApiResponse> {
    return apiClient.request({
      method: 'requests/create',
      args: data,
    });
  }

  /**
   * Update an existing request
   */
  async updateRequest(id: string, data: Record<string, any>): Promise<ApiResponse> {
    return apiClient.request({
      method: 'requests/update',
      args: { id, ...data },
    });
  }

  /**
   * Delete a request
   */
  async deleteRequest(id: string): Promise<ApiResponse> {
    return apiClient.request({
      method: 'requests/delete',
      args: { id },
    });
  }

  /**
   * Approve a request
   */
  async approveRequest(id: string, data: Record<string, any>): Promise<ApiResponse> {
    return apiClient.request({
      method: 'requests/approve',
      args: { id, ...data },
    });
  }

  /**
   * Reject a request
   */
  async rejectRequest(id: string, data: Record<string, any>): Promise<ApiResponse> {
    return apiClient.request({
      method: 'requests/reject',
      args: { id, ...data },
    });
  }
}

// Create and export singleton instance
export const requestsApi = new RequestsApi(); 