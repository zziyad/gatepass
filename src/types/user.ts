/**
 * User-related type definitions
 */

/**
 * User roles in the application
 */
export type UserRole = 'EMPLOYEE' | 'HOD' | 'FINANCE' | 'MOD' | 'SECURITY' | 'ADMIN';

/**
 * Base user properties
 */
export interface BaseUser {
  id: string | number;
  email: string;
  role: UserRole;
}

/**
 * Client-side user model
 */
export interface User extends BaseUser {
  id: string;
  name: string;
  department: string;
}

/**
 * API user model from server responses
 */
export interface ApiUser extends BaseUser {
  id: number;
  name: string;
  departmentId?: number;
  department?: {
    id: number;
    name: string;
  };
} 