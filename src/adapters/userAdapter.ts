import { ApiUser, User } from "../types/user";

/**
 * Converts an API user model to a client-side user model
 * 
 * @param apiUser - The user data from the API
 * @returns A client-side user model
 */
export function adaptApiUserToUser(apiUser: ApiUser): User {
  return {
    id: String(apiUser.id),
    email: apiUser.email,
    role: apiUser.role,
    name: apiUser.name || '',
    department: apiUser.department?.name || '',
  };
}

/**
 * Converts multiple API users to client user models
 * 
 * @param apiUsers - Array of API users
 * @returns Array of client-side user models
 */
export function adaptApiUsersToUsers(apiUsers: ApiUser[]): User[] {
  return apiUsers.map(adaptApiUserToUser);
} 