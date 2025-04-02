import { v4 as uuidv4 } from 'uuid';
import { ApiRequestOptions, ApiResponse } from './types';
import { ApiClient } from './client';

// Import mock data
import { mockDepartments, mockRemovalReasons, mockUsers } from '@/lib/mockData';

/**
 * Create a mock API response
 */
function createMockResponse<T>(data: T, status = 'success'): ApiResponse {
  return {
    type: 'callback',
    id: Math.floor(Math.random() * 10000),
    result: {
      status,
      response: { data }
    }
  };
}

/**
 * Mock API Client for development and testing
 * Simulates API responses without making network requests
 */
export class MockApiClient extends ApiClient {
  /**
   * Override the request method to return mock data
   */
  async request<T = any>(options: ApiRequestOptions): Promise<ApiResponse> {
    const { method, args = {} } = options;
    
    // Log mock request
    console.log(`[MOCK API] ${method}`, args);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Handle different API endpoints
      switch (method) {
        // Department endpoints
        case 'admin/departments':
        case 'department/list':
          return createMockResponse(mockDepartments);
          
        case 'admin/createDepartment':
          return createMockResponse({
            id: Math.floor(Math.random() * 1000),
            name: args?.name,
          });
          
        case 'admin/updateDepartment':
          return createMockResponse({
            id: args?.id,
            name: args?.name,
          });
          
        case 'admin/deleteDepartment':
          return createMockResponse({ success: true });
          
        // Removal Reason endpoints
        case 'admin/removalReasons':
          return createMockResponse(mockRemovalReasons);
          
        case 'admin/createRemovalReason':
          return createMockResponse({
            id: String(Math.floor(Math.random() * 1000)),
            name: args?.name,
          });
          
        case 'admin/updateRemovalReason':
          return createMockResponse({
            id: args?.id,
            name: args?.name,
          });
          
        case 'admin/deleteRemovalReason':
          return createMockResponse({ success: true });
          
        // User management endpoints
        case 'admin/users':
          return createMockResponse(mockUsers.map(user => ({
            id: parseInt(user.id),
            name: user.name,
            email: user.email,
            role: user.role,
            department: {
              id: 1, // Mock ID
              name: user.department
            }
          })));
          
        case 'admin/createUser':
          return createMockResponse({
            id: Math.floor(Math.random() * 1000),
            name: args?.name,
            email: args?.email,
            role: args?.role,
            department: {
              id: args?.departmentId,
              name: mockDepartments.find(d => d.id === args?.departmentId)?.name || 'Unknown'
            }
          }, 'created');
          
        case 'admin/resetPassword':
          return createMockResponse({ success: true });
          
        case 'admin/deleteUser':
          return createMockResponse({ success: true });
          
        // Auth endpoints    
        case 'auth/register':
          if (!args?.email || !args?.password || !args?.name) {
            return {
              type: 'callback',
              id: Math.floor(Math.random() * 10000),
              result: {
                status: 'error',
                error: 'Missing required fields'
              }
            };
          }
          return {
            type: 'callback',
            id: Math.floor(Math.random() * 10000),
            result: {
              status: 'registered',
              response: {
                user: {
                  id: Math.floor(Math.random() * 1000),
                  email: args.email,
                  name: args.name,
                  role: args.role || 'EMPLOYEE',
                  department: {
                    id: parseInt(args.departmentId as string, 10),
                    name: mockDepartments.find(d => d.id === parseInt(args.departmentId as string, 10))?.name || 'Unknown'
                  }
                },
                msg: 'User registered successfully'
              }
            }
          };
          
        case 'auth/signin':
          if (!args?.email || !args?.password) {
            return {
              type: 'callback',
              id: Math.floor(Math.random() * 10000),
              result: {
                status: 'error',
                error: 'Email and password are required'
              }
            };
          }
          
          // Admin login detection (for testing admin features)
          const isAdminLogin = (args.email as string).includes('admin');
          
          // Mock successful login 
          return {
            type: 'callback',
            id: Math.floor(Math.random() * 10000),
            result: {
              status: 'logged',
              response: {
                msg: 'Login successful',
                user: {
                  id: 123,
                  email: args.email,
                  name: isAdminLogin ? 'Admin User' : 'Test User',
                  role: isAdminLogin ? 'ADMIN' : 'EMPLOYEE',
                  department: {
                    id: 1,
                    name: 'IT Department'
                  }
                },
                sessionId: uuidv4()
              }
            }
          };
          
        case 'auth/verify':
          return {
            type: 'callback',
            id: Math.floor(Math.random() * 10000),
            result: {
              status: 'logged',
              response: {
                user: {
                  id: 123,
                  email: 'user@example.com',
                  name: 'Test User',
                  role: 'EMPLOYEE',
                  department: {
                    id: 1,
                    name: 'IT Department'
                  }
                }
              }
            }
          };
          
        case 'auth/signout':
          return {
            type: 'callback',
            id: Math.floor(Math.random() * 10000),
            result: {
              status: 'success',
              response: {
                msg: 'Logged out successfully'
              }
            }
          };
          
        default:
          console.warn(`[MOCK API] Endpoint not implemented: ${method}`);
          return {
            type: 'callback',
            id: Math.floor(Math.random() * 10000),
            result: {
              status: 'error',
              error: `Mock API endpoint not implemented: ${method}`
            }
          };
      }
    } catch (error) {
      console.error(`[MOCK API] Error:`, error);
      return {
        type: 'callback',
        id: Math.floor(Math.random() * 10000),
        result: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
  
  /**
   * Override isAuthenticated to return mock value
   */
  async isAuthenticated(): Promise<boolean> {
    return true; // Always authenticated in mock mode
  }
} 