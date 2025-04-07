import { User } from "@/types/user";
import { api } from "@/services/api";
import {
  AuthService,
  LoginCredentials,
  RegistrationData,
  ApiUser,
} from "./types";
import { apiUserToUser } from "./adapters";

/**
 * API-based implementation of the AuthService interface
 */
export class ApiAuthService implements AuthService {
  /**
   * Login with credentials
   */
  async login(credentials: LoginCredentials): Promise<User | null> {
    try {
      const response = await api.auth.login(
        credentials.email,
        credentials.password
      );

      if (
        response.result?.status === "logged" &&
        response.result.response?.user
      ) {
        return apiUserToUser(response.result.response.user as ApiUser);
      }

      return null;
    } catch (error) {
      console.error("Login failed:", error);
      return null;
    }
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<boolean> {
    try {
      const response = await api.auth.logout();
      // Assume success unless the status is explicitly 'error'
      // This is more flexible if the backend doesn't return status: 'success'
      const isError = response?.result?.status === "error";
      if (isError) {
        console.warn("Logout API response indicated an error:", response);
        return false; // Explicit error from backend
      }
      // If no explicit error status, assume success
      return true;
    } catch (error) {
      // This catches errors during the API call itself (network, HTTP errors handled by ApiClient)
      console.error("Logout API call failed:", error);
      return false;
    }
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      // Directly call the endpoint that verifies and returns user data
      const userData = await api.auth.getCurrentUser();

      if (
        userData.result?.status === "logged" &&
        userData.result.response?.user
      ) {
        const apiUser = userData.result.response.user as ApiUser;
        
        // Ensure departmentName is set if only department object is provided
        if (!apiUser.departmentName && apiUser.department?.name) {
          apiUser.departmentName = apiUser.department.name;
        }
        
        return apiUserToUser(apiUser);
      }

      return null;
    } catch (error) {
      console.error("Get current user failed:", error);
      return null;
    }
  }

  /**
   * Check if the user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return await api.auth.verifyAuth();
  }

  /**
   * Register a new user
   */
  async register(data: RegistrationData): Promise<User | null> {
    try {
      const response = await api.auth.register(data);

      if (
        response.result?.status === "registered" &&
        response.result.response?.user
      ) {
        return apiUserToUser(response.result.response.user as ApiUser);
      }

      return null;
    } catch (error) {
      console.error("Registration failed:", error);
      return null;
    }
  }
}
