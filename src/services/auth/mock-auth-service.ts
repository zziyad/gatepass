import { User, UserRole } from '@/types/user';
import { AuthService, LoginCredentials, RegistrationData } from './types';

/**
 * Mock implementation of the AuthService interface for testing
 */
export class MockAuthService implements AuthService {
  private mockUsers: User[] = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'ADMIN' as UserRole,
      department: 'IT Department',
    },
    {
      id: '2',
      name: 'Employee User',
      email: 'employee@example.com',
      role: 'EMPLOYEE' as UserRole,
      department: 'Marketing Department',
    },
  ];
  
  private currentUser: User | null = null;
  
  /**
   * Login with credentials
   */
  async login(credentials: LoginCredentials): Promise<User | null> {
    // Simple mock login - find user by email, no password check
    const user = this.mockUsers.find(u => u.email === credentials.email);
    
    if (user) {
      this.currentUser = user;
      return user;
    }
    
    return null;
  }
  
  /**
   * Logout the current user
   */
  async logout(): Promise<boolean> {
    this.currentUser = null;
    return true;
  }
  
  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }
  
  /**
   * Check if the user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return this.currentUser !== null;
  }
  
  /**
   * Register a new user
   */
  async register(data: RegistrationData): Promise<User | null> {
    const newUser: User = {
      id: String(this.mockUsers.length + 1),
      name: data.name,
      email: data.email,
      role: (data.role || 'EMPLOYEE') as UserRole,
      department: 'New Department',
    };
    
    this.mockUsers.push(newUser);
    return newUser;
  }
} 