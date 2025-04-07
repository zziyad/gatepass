import { UserRole } from "@/types";

/**
 * Converts a role code to a user-friendly display name
 */
export function getRoleDisplayName(role?: UserRole | string): string {
  if (!role) return "User";
  
  console.log("Converting role:", role);
  
  switch(role) {
    case "LEVEL_1": return "Requester";
    case "LEVEL_2": return "Department Approval";
    case "LEVEL_3": return "Finance Approval";
    case "LEVEL_4": return "Management Approval";
    case "SECURITY": return "Security Approval";
    case "ADMIN": return "Administrator";
    // Legacy role support
    case "EMPLOYEE": return "Employee (Legacy)";
    case "HOD": return "Head of Dept (Legacy)";
    case "FINANCE": return "Finance (Legacy)";
    case "MOD": return "Moderator (Legacy)";
    default: return role;
  }
}

/**
 * Gets the role badge color class based on role
 */
export function getRoleBadgeColor(role?: UserRole | string): string {
  if (!role) return "bg-gray-100 text-gray-800";
  
  switch(role) {
    case "LEVEL_1": return "bg-gray-100 text-gray-800";
    case "LEVEL_2": return "bg-blue-100 text-blue-800";
    case "LEVEL_3": return "bg-indigo-100 text-indigo-800";
    case "LEVEL_4": return "bg-purple-100 text-purple-800";
    case "SECURITY": return "bg-amber-100 text-amber-800";
    case "ADMIN": return "bg-red-100 text-red-800";
    // Legacy role support
    case "EMPLOYEE": return "bg-gray-100 text-gray-800";
    case "HOD": return "bg-blue-100 text-blue-800";
    case "FINANCE": return "bg-indigo-100 text-indigo-800";
    case "MOD": return "bg-purple-100 text-purple-800";
    default: return "bg-gray-100 text-gray-800";
  }
} 