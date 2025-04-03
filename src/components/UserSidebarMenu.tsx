import React from "react";
import { useNavigate } from "react-router-dom";
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
  TestTube,
  Shield, // Keep Shield if needed for the conditional Admin link
} from "lucide-react";
import { useAuth } from "@/contexts"; // Import useAuth to check for admin role

const UserSidebarMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user to check role
  const isAdmin = user?.role === "ADMIN"; // Check if the current user is admin

  return (
    <SidebarMenu className="py-2">
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => navigate("/dashboard")}
          tooltip="Dashboard"
          className="py-3 px-4 hover:bg-gray-100 text-base"
        >
          <Home className="h-5 w-5 mr-3" />
          <span>Dashboard</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => navigate("/new-request")}
          tooltip="New Request"
          className="py-3 px-4 hover:bg-gray-100 text-base"
        >
          <Plus className="h-5 w-5 mr-3" />
          <span>New Request</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => navigate("/my-requests")}
          tooltip="My Requests"
          className="py-3 px-4 hover:bg-gray-100 text-base"
        >
          <FileText className="h-5 w-5 mr-3" />
          <span>My Requests</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => navigate("/approvals")}
          tooltip="Approvals"
          className="py-3 px-4 hover:bg-gray-100 text-base"
        >
          <ClipboardCheck className="h-5 w-5 mr-3" />
          <span>Approvals</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => navigate("/profile")}
          tooltip="Profile"
          className="py-3 px-4 hover:bg-gray-100 text-base"
        >
          <UserCircle className="h-5 w-5 mr-3" />
          <span>Profile</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => navigate("/api-test")}
          tooltip="API Test"
          className="py-3 px-4 hover:bg-gray-100 text-base"
        >
          <TestTube className="h-5 w-5 mr-3" />
          <span>API Test</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
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
