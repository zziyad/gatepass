/**
 * API types for service layer
 */

// Basic request types
export interface ApiRequestOptions {
  method: string;
  args?: Record<string, any>;
  requiresAuth?: boolean;
}

// Standard response structure from our backend
export interface ApiResponse<T = any> {
  type: string; // 'callback'
  id: number;
  result: {
    status: string; // e.g., 'logged', 'error'
    response?: {
      msg?: string;
      user?: T;
      [key: string]: any;
    };
    error?: string; // Error message from backend
  };
}

// Type for auth-related API interfaces
export interface AuthApiInterface {
  login(email: string, password: string): Promise<ApiResponse>;
  logout(): Promise<ApiResponse>;
  verifyAuth(): Promise<boolean>;
  register(userData: {
    fullName: string;
    email: string;
    password: string;
    role?: string;
    departmentId?: string | number;
  }): Promise<ApiResponse>;
}

// Type for requests-related API interfaces
export interface RequestsApiInterface {
  getRequests(): Promise<ApiResponse>;
  getRequest(id: string): Promise<ApiResponse>;
  createRequest(data: Record<string, any>): Promise<ApiResponse>;
  updateRequest(id: string, data: Record<string, any>): Promise<ApiResponse>;
  deleteRequest(id: string): Promise<ApiResponse>;
  approveRequest(id: string, data: Record<string, any>): Promise<ApiResponse>;
  rejectRequest(id: string, data: Record<string, any>): Promise<ApiResponse>;
}

// Type for admin-related API interfaces
export interface AdminApiInterface {
  getDepartments(): Promise<ApiResponse>;
  // Uses endpoint 'admin/adddep'
  createDepartment(name: string): Promise<ApiResponse>;
  updateDepartment(id: number, name: string): Promise<ApiResponse>;
  deleteDepartment(id: number): Promise<ApiResponse>;
  getRemovalReasons(): Promise<ApiResponse>;
  createRemovalReason(name: string): Promise<ApiResponse>;
  updateRemovalReason(id: string, name: string): Promise<ApiResponse>;
  deleteRemovalReason(id: string): Promise<ApiResponse>;
  getUsers(): Promise<ApiResponse>;
  createUser(userData: Record<string, any>): Promise<ApiResponse>;
  updateUser(id: number, email: string, role: string, departmentId: number, position?: string): Promise<ApiResponse>;
  deleteUser(id: number): Promise<ApiResponse>;
  resetPassword(id: number, newPassword: string): Promise<ApiResponse>;
} 