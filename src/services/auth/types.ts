import { User, ApiUser as GlobalApiUser, UserRole } from '@/types/user';

// Re-export the ApiUser type from our global types
export type { ApiUser } from '@/types/user';

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegistrationData {
  fullName: string;
  email: string;
  password: string;
  role?: UserRole;
  departmentId?: string | number;
  position?: string;
}

/**
 * Auth service interface
 */
export interface AuthService {
  /**
   * Login with credentials
   */
  login(credentials: LoginCredentials): Promise<User | null>;
  
  /**
   * Logout the current user
   */
  logout(): Promise<boolean>;
  
  /**
   * Get the current authenticated user
   */
  getCurrentUser(): Promise<User | null>;
  
  /**
   * Check if the user is authenticated
   */
  isAuthenticated(): Promise<boolean>;
  
  /**
   * Register a new user
   */
  register(data: RegistrationData): Promise<User | null>;
} 