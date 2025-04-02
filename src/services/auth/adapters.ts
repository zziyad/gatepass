import { User } from '@/types/user';
import { ApiUser } from '@/types/user';
import { adaptApiUserToUser } from '@/adapters/userAdapter';

/**
 * Convert API user data to our application User model
 */
export function apiUserToUser(apiUser: ApiUser): User {
  return adaptApiUserToUser(apiUser);
}

/**
 * Convert our application User model to API user data
 */
export function userToApiUser(user: User): Partial<ApiUser> {
  return {
    id: parseInt(user.id, 10),
    email: user.email,
    role: user.role,
    name: user.name,
    // Department is handled differently in the API, so we don't convert it directly
  };
} 