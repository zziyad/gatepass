/**
 * User-related type definitions
 */

/**
 * User roles in the application
 */
export type UserRole = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4' | 'SECURITY' | 'ADMIN';

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
 * This is the standard user object to be used across the entire application
 */
export interface User extends BaseUser {
  id: string | number;
  fullName: string;
  email: string;
  role: UserRole;
  position?: string;
  departmentName?: string;
}

/**
 * API user model from server responses
 * This represents what the server sends in API responses
 */
export interface ApiUser extends BaseUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  position?: string;
  departmentName?: string;
  // Legacy field - will be transformed to departmentName by adapters
  department?: {
    id: number;
    name: string;
  };
} 