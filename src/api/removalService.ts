import { apiClient } from '../services/api/client';
import { ApiResponse } from '../services/api/types';

// API base URL - should be configured from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Types for removal requests
export interface CreateRemovalRequest {
  removalTerms: 'returnable' | 'non-returnable';
  dateFrom: string;      // ISO date format
  dateTo?: string;       // Required if returnable
  employee: string;      
  departmentId: number;
  itemDescription: string;
  removalReasonId: number;
  customReason?: string; // Required if "Other" is selected
  images: string[];      // Base64 encoded image strings
}

export interface RemovalImage {
  id: number;
  url: string;
}

export interface RemovalResponse {
  id: number;
  userId: number;
  status: string;
  createdAt: string;
  removalTerms: string;
  dateFrom: string;
  dateTo: string | null;
  employee: string;
  departmentId: number;
  itemDescription: string;
  removalReasonId: number;
  customReason: string | null;
  images: RemovalImage[];
}

export interface CreateRemovalResponse {
  status: 'success' | 'error';
  response?: {
    msg: string;
    removal: RemovalResponse;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Create a new removal request
 * @param removalData - The removal request data
 * @returns Promise with the API response
 */
export async function createRemovalRequest(removalData: CreateRemovalRequest): Promise<ApiResponse<RemovalResponse>> {
  try {
    // Validate data before sending
    if (removalData.removalTerms === 'returnable' && !removalData.dateTo) {
      throw new Error('Return date is required for returnable items');
    }

    // Use custom API path as specified (removal/add)
    return await apiClient.request({
      method: 'removal/add',
      args: removalData
    });
  } catch (error) {
    // Already handled by ApiClient - just pass through
    return error as ApiResponse<RemovalResponse>;
  }
}

/**
 * Upload an image for a removal request
 * This is a separate function to handle image uploads independently
 * 
 * @param removalId - The ID of the removal request
 * @param imageData - Base64 encoded image string
 * @returns Promise with the API response
 */
export async function uploadRemovalImage(removalId: number, imageData: string): Promise<ApiResponse<any>> {
  return apiClient.request({
    method: 'removals/uploadImage',
    args: {
      removalId,
      image: imageData
    }
  });
}

/**
 * Delete an image from a removal request
 * 
 * @param removalId - The ID of the removal request
 * @param imageId - The ID of the image to delete
 * @returns Promise with the API response
 */
export async function deleteRemovalImage(removalId: number, imageId: number): Promise<ApiResponse<any>> {
  return apiClient.request({
    method: 'removals/deleteImage',
    args: {
      removalId,
      imageId
    }
  });
}

/**
 * Example of a returnable removal request object
 */
export const returnableRemovalExample = {
  removalTerms: 'returnable' as const,
  dateFrom: new Date().toISOString(), // Current date
  dateTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  employee: 'John Doe',
  departmentId: 1,
  itemDescription: 'Company Laptop',
  removalReasonId: 2, // Assuming 2 is "Temporary Use"
  customReason: undefined, // Not needed unless "Other" reason is selected
  images: ['base64EncodedImageString1', 'base64EncodedImageString2'] // Base64 encoded images
};

/**
 * Example of a non-returnable removal request object
 */
export const nonReturnableRemovalExample = {
  removalTerms: 'non-returnable' as const,
  dateFrom: new Date().toISOString(), // Current date
  dateTo: undefined, // Not required for non-returnable items
  employee: 'Jane Smith',
  departmentId: 2,
  itemDescription: 'Damaged Office Chair',
  removalReasonId: 1, // Assuming 1 is "Damaged"
  customReason: undefined, // Not needed unless "Other" reason is selected
  images: ['base64EncodedImageString1'] // Base64 encoded images
};

/**
 * Get removal requests with optional filtering
 * 
 * @param filters - Optional filters (status, userId, departmentId, etc.)
 * @param page - Page number for pagination
 * @param limit - Items per page
 */
export async function getRemovalRequests(
  filters?: {
    status?: string;
    userId?: number;
    departmentId?: number;
  }, 
  page = 1, 
  limit = 10
): Promise<ApiResponse<any>> {
  return apiClient.request({
    method: 'removal/removals',
    args: {
      // ...filters,
      page,
      limit
    }
  });
}

/**
 * Get a single removal request by ID
 * 
 * @param id - Removal request ID
 */
export async function getRemovalRequestById(id: number): Promise<ApiResponse<RemovalResponse>> {
  return apiClient.request({
    method: 'removal/id',
    args: { id }
  });
}

/**
 * Helper function to create a returnable removal request
 * This is a convenience wrapper with proper typings
 */
export function createReturnableRemoval({
  dateFrom,
  dateTo,
  departmentId,
  employee,
  itemDescription,
  removalReasonId,
  customReason,
  images
}: Omit<CreateRemovalRequest, 'removalTerms' | 'dateTo'> & { dateTo: string }): Promise<ApiResponse<RemovalResponse>> {
  return createRemovalRequest({
    removalTerms: 'returnable',
    dateFrom,
    dateTo,
    departmentId,
    employee,
    itemDescription,
    removalReasonId,
    customReason,
    images
  });
}

/**
 * Helper function to create a non-returnable removal request
 * This is a convenience wrapper with proper typings
 */
export function createNonReturnableRemoval({
  dateFrom,
  departmentId,
  employee,
  itemDescription,
  removalReasonId,
  customReason,
  images
}: Omit<CreateRemovalRequest, 'removalTerms' | 'dateTo'>): Promise<ApiResponse<RemovalResponse>> {
  return createRemovalRequest({
    removalTerms: 'non-returnable',
    dateFrom,
    departmentId,
    employee,
    itemDescription,
    removalReasonId,
    customReason,
    images
  });
} 