import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Shield,
  Users,
  Building2,
  FileText,
  Home,
} from "lucide-react";
import { getAdminRoutes } from "@/routes";

// Map path to icon
const pathToIcon: Record<string, React.ReactNode> = {
  "/admin": <Shield className="h-5 w-5 mr-3" />,
  "/admin/users": <Users className="h-5 w-5 mr-3" />,
  "/admin/departments": <Building2 className="h-5 w-5 mr-3" />,
  "/admin/removal-reasons": <FileText className="h-5 w-5 mr-3" />,
};

const AdminSidebarMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get all admin routes
  const adminRoutes = getAdminRoutes();

  return (
    <SidebarMenu className="py-2">
      {adminRoutes.map(route => (
        <SidebarMenuItem key={route.path}>
          <SidebarMenuButton
            onClick={() => navigate(route.path)}
            tooltip={route.title || route.path}
            className={`py-3 px-4 hover:bg-gray-100 text-base ${
              location.pathname === route.path ? 'bg-gray-100 font-medium' : ''
            }`}
          >
            {pathToIcon[route.path] || <FileText className="h-5 w-5 mr-3" />}
            <span>{route.title || route.path.split('/').pop()}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
      
      {/* Return to user dashboard */}
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => navigate("/dashboard")}
          tooltip="Standard Dashboard"
          className="py-3 px-4 hover:bg-gray-100 text-base text-blue-600 mt-4"
        >
          <Home className="h-5 w-5 mr-3" />
          <span>Item Removal System</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default AdminSidebarMenu;
