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
    fullName: apiUser.fullName,
    email: apiUser.email,
    role: apiUser.role,
    departmentName: apiUser.departmentName || apiUser.department?.name,
    position: apiUser.position
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

/**
 * Convert our application User model to API user data
 * 
 * @param user - Client-side user model
 * @returns API user model (partial)
 */
export function userToApiUser(user: User): ApiUser {
  return {
    id: typeof user.id === 'string' ? parseInt(user.id, 10) : user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    position: user.position,
    departmentName: user.departmentName
  };
} 