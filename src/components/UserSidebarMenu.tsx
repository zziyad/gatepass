import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Home,
  Plus,
  FileText,
  ClipboardCheck,
  UserCircle,
  Shield, // Keep Shield if needed for the conditional Admin link
  List, // Add List icon for removals
} from "lucide-react";
import { useAuth } from "@/contexts"; // Import useAuth to check for admin role
import { getUserRoutes } from "@/routes";

// Map path to icon
const pathToIcon: Record<string, React.ReactNode> = {
  "/dashboard": <Home className="h-5 w-5 mr-3" />,
  "/new-request": <Plus className="h-5 w-5 mr-3" />,
  "/my-requests": <FileText className="h-5 w-5 mr-3" />,
  "/removals": <List className="h-5 w-5 mr-3" />,
  "/approvals": <ClipboardCheck className="h-5 w-5 mr-3" />,
  "/profile": <UserCircle className="h-5 w-5 mr-3" />,
};

const UserSidebarMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); // Get user to check role
  const isAdmin = user?.role === "ADMIN"; // Check if the current user is admin
  
  // Get all user routes
  const userRoutes = getUserRoutes();
  
  // Filter out routes with dynamic parameters (like :id)
  const navigationRoutes = userRoutes.filter(route => !route.path.includes(':'));

  return (
    <SidebarMenu className="py-2">
      {navigationRoutes.map(route => (
        <SidebarMenuItem key={route.path}>
          <SidebarMenuButton
            onClick={() => navigate(route.path)}
            tooltip={route.title || route.path}
            className={`py-3 px-4 hover:bg-gray-100 text-base ${
              location.pathname === route.path ? 'bg-gray-100 font-medium' : ''
            }`}
          >
            {pathToIcon[route.path] || <FileText className="h-5 w-5 mr-3" />}
            <span>{route.title || route.path.replace('/', '')}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
      {/* Conditionally show Admin Console link if user is Admin */}
      {isAdmin && (
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => navigate("/admin")}
            tooltip="Admin Console"
            className="py-3 px-4 hover:bg-gray-100 text-base text-red-600 mt-4"
          >
            <Shield className="h-5 w-5 mr-3" />
            <span>Admin Console</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
};

export default UserSidebarMenu;
