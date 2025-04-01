import { v4 as uuidv4 } from "uuid";
import { mockDepartments, mockRemovalReasons, mockUsers, createMockApiResponse } from "@/lib/mockData";

const API_BASE_URL = "http://localhost:8001/api"; // Use environment variable in production
const USE_MOCK_API = false; // Set to false when real API is available

interface ApiCallOptions {
  method: string; // e.g., 'auth/signin'
  args?: Record<string, unknown>;
  requiresAuth?: boolean; // Flag to determine if auth token is needed
}

// Define the callback response type that matches the API's format
interface ApiCallbackResponse<T = any> {
  type: string; // 'callback'
  id: number;
  result: {
    status: string; // e.g., 'logged', 'error'
    response?: T;
    error?: string; // Error message from backend
  };
}

// Legacy response type for backward compatibility
interface ApiResponse<T = any> {
  status: string; // e.g., 'logged', 'error'
  response?: T;
  error?: string; // Error message from backend
}

// Mock API handler for development - remove or disable in production
async function handleMockApi<T>(options: ApiCallOptions): Promise<ApiResponse<T>> {
  const { method, args } = options;
  console.log(`[MOCK API] ${method}`, args);
  
  // Add a slight delay to simulate network
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Handle different API endpoints
  switch (method) {
    // Department endpoints
    case "department/list":
      return createMockApiResponse(mockDepartments as unknown as T);
      
    case "admin/departments":
      return createMockApiResponse(mockDepartments as unknown as T);
    
    case "admin/adddep":
      return createMockApiResponse({
        id: Math.floor(Math.random() * 1000),
        name: args?.name as string,
      } as unknown as T);
    
    case "admin/createDepartment":
      return createMockApiResponse({
        id: Math.floor(Math.random() * 1000),
        name: args?.name as string,
      } as unknown as T);
    
    case "admin/updateDepartment":
      return createMockApiResponse({
        id: args?.id as number,
        name: args?.name as string,
      } as unknown as T);
    
    case "admin/deleteDepartment":
      return createMockApiResponse({ success: true } as unknown as T);
      
    // Removal Reason endpoints
    case "admin/removalReasons":
      return createMockApiResponse(mockRemovalReasons as unknown as T);
    
    case "admin/createRemovalReason":
      return createMockApiResponse({
        id: String(Math.floor(Math.random() * 1000)),
        name: args?.name as string,
      } as unknown as T);
    
    case "admin/updateRemovalReason":
      return createMockApiResponse({
        id: args?.id as string,
        name: args?.name as string,
      } as unknown as T);
    
    case "admin/deleteRemovalReason":
      return createMockApiResponse({ success: true } as unknown as T);
      
    // User management endpoints
    case "admin/users":
      return createMockApiResponse(mockUsers.map(user => ({
        id: parseInt(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        department: {
          id: 1, // Mock ID
          name: user.department
        }
      })) as unknown as T);
    
    case "admin/createUser":
      return createMockApiResponse({
        id: Math.floor(Math.random() * 1000),
        name: args?.name as string,
        email: args?.email as string,
        role: args?.role as string,
        department: {
          id: args?.departmentId as number,
          name: mockDepartments.find(d => d.id === args?.departmentId)?.name || "Unknown"
        }
      } as unknown as T, "created");
    
    case "admin/resetPassword":
      return createMockApiResponse({ success: true } as unknown as T);
    
    case "admin/deleteUser":
      return createMockApiResponse({ success: true } as unknown as T);
      
    // Auth endpoints    
    case "auth/register":
      if (!args?.email || !args?.password || !args?.name) {
        return {
          status: "error",
          error: "Missing required fields"
        };
      }
      return {
        status: "registered",
        response: {
          id: Math.floor(Math.random() * 1000),
          email: args.email as string,
          name: args.name as string,
          role: args.role || "EMPLOYEE",
          department: {
            id: parseInt(args.departmentId as string, 10),
            name: mockDepartments.find(d => d.id === parseInt(args.departmentId as string, 10))?.name || "Unknown"
          }
        } as T
      };
      
    case "auth/signin":
      if (!args?.email || !args?.password) {
        return {
          status: "error",
          error: "Email and password are required"
        };
      }
      
      // Admin login detection (for testing admin features)
      const isAdminLogin = (args.email as string).includes("admin");
      
      // Mock successful login 
      return {
        status: "logged",
        response: {
          id: 123,
          email: args.email as string,
          name: isAdminLogin ? "Admin User" : "Test User",
          role: isAdminLogin ? "ADMIN" : "EMPLOYEE",
          department: {
            id: 1,
            name: "IT Department"
          },
          sessionId: uuidv4()
        } as unknown as T
      };
      
    case "auth/verify":
      return {
        status: "valid",
        response: {
          id: 123,
          email: "user@example.com",
          name: "Test User",
          role: "EMPLOYEE",
          department: {
            id: 1,
            name: "IT Department"
          }
        } as unknown as T
      };
      
    case "auth/logout":
      return {
        status: "success"
      };
      
    default:
      return {
        status: "error",
        error: `Mock API endpoint not implemented: ${method}`
      };
  }
}

export const apiClient = async <TResponse = any>(
  options: ApiCallOptions
): Promise<ApiCallbackResponse<TResponse>> => {
  // Use mock API in development if enabled
  if (USE_MOCK_API) {
    // Convert mock response to callback format
    const mockRes = await handleMockApi<TResponse>(options);
    return {
      type: 'callback',
      id: Math.floor(Math.random() * 1000),
      result: mockRes
    };
  }
  
  const { method, args, requiresAuth = true } = options;
  const requestId = Math.floor(Math.random() * 10000); // Generate a simple numeric ID

  try {
    // Build the headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Format request body according to API specifications
    const requestBody = {
      id: requestId,
      type: "call",
      method: method,
      args: args || {}, // Ensure args is always an object
    };

    console.log("API Request:", API_BASE_URL, requestBody);

    // Include credentials: 'include' to send and receive cookies
    const response = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
      credentials: 'include', // This is the key setting for cookie-based auth
    });

    const responseData = await response.json();
    console.log("API Response:", responseData);

    // Handle HTTP errors
    if (!response.ok) {
      const errorMsg = responseData.result?.error || responseData.error || `HTTP error! status: ${response.status}`;
      console.error(`API Error (${method}):`, errorMsg, responseData);
      throw new Error(errorMsg);
    }

    // Handle API-specific errors
    if (responseData.result?.status === "error") {
      const errorMsg = responseData.result.error || `API error with status: ${responseData.result.status}`;
      console.error(`API Business Error (${method}):`, errorMsg, responseData);
      throw new Error(errorMsg);
    }

    return responseData as ApiCallbackResponse<TResponse>;
  } catch (error) {
    console.error(`API Request Failed (${method}):`, error);
    
    // Re-throw the error so useMutation can handle it
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unknown API error occurred");
    }
  }
};

// Utility function to check if user is authenticated
// For cookie-based auth, we can't directly check if cookies exist from JavaScript
// So we'll need to make a verification request to the server
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    // Instead of explicitly checking for a token cookie, we'll let the server verify
    // it based on the cookie that's automatically sent with credentials: 'include'
    const response = await apiClient({
      method: "auth/verify",
      requiresAuth: false,
    });
    return response.result?.status === "valid";
  } catch (error) {
    console.error("Authentication check failed:", error);
    return false;
  }
};

// Utility function to logout - makes a logout API call and removes the cookie
export const logout = async (): Promise<void> => {
  try {
    // The server will handle removing the cookie by setting an expired date
    await apiClient({ 
      method: 'auth/logout',
      requiresAuth: false,
    });
  } catch (err) {
    console.error('Logout API call failed:', err);
  }
};
