import { User } from '@/types/user';
import { ApiUser } from '@/types/user';
import { adaptApiUserToUser, userToApiUser } from '@/adapters/userAdapter';

/**
 * Convert API user data to our application User model
 */
export function apiUserToUser(apiUser: ApiUser): User {
  return adaptApiUserToUser(apiUser);
}

/**
 * Re-export the userToApiUser function for consistency
 */
export { userToApiUser }; 