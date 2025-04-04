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
 */
export interface User extends BaseUser {
  id: string | number;
  fullName: string;
  department?: string;
  departmentName?: string;
  position?: string;
}

/**
 * API user model from server responses
 */
export interface ApiUser extends BaseUser {
  id: number;
  fullName: string;
  position?: string;
  departmentId?: number;
  department?: {
    id: number;
    name: string;
  };
  departmentName?: string;
} 