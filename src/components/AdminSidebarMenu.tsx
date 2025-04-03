import React from "react";
import { useNavigate } from "react-router-dom";
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
  TestTube,
  Home,
} from "lucide-react";

const AdminSidebarMenu: React.FC = () => {
  const navigate = useNavigate();

  return (
    <SidebarMenu className="py-2">
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => navigate("/admin")}
          tooltip="Admin Dashboard"
          className="py-3 px-4 hover:bg-gray-100 text-base"
        >
          <Shield className="h-5 w-5 mr-3" />
          <span>Admin Dashboard</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => navigate("/admin/users")}
          tooltip="Manage Users"
          className="py-3 px-4 hover:bg-gray-100 text-base"
        >
          <Users className="h-5 w-5 mr-3" />
          <span>Manage Users</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => navigate("/admin/departments")}
          tooltip="Manage Departments"
          className="py-3 px-4 hover:bg-gray-100 text-base"
        >
          <Building2 className="h-5 w-5 mr-3" />
          <span>Manage Departments</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => navigate("/admin/removal-reasons")}
          tooltip="Manage Removal Reasons"
          className="py-3 px-4 hover:bg-gray-100 text-base"
        >
          <FileText className="h-5 w-5 mr-3" />
          <span>Manage Reasons</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => navigate("/api-test")}
          tooltip="API Test"
          className="py-3 px-4 hover:bg-gray-100 text-base text-purple-600"
        >
          <TestTube className="h-5 w-5 mr-3" />
          <span>API Test</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => navigate("/dashboard")}
          tooltip="Standard Dashboard"
          className="py-3 px-4 hover:bg-gray-100 text-base text-blue-600"
        >
          <Home className="h-5 w-5 mr-3" />
          <span>Item Removal System</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default AdminSidebarMenu;
