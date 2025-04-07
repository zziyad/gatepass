import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";
import AdminSidebarMenu from "./AdminSidebarMenu"; // Import new component
import UserSidebarMenu from "./UserSidebarMenu"; // Import new component
import { getRoleDisplayName } from "@/utils/roleUtils";
import { UserCard } from "./UserCard";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout, loading } = useAuth(); // Get loading state
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Only redirect if loading is finished and there's no user
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      // The logout function in AppContext will handle navigation and toast
    } catch (error) {
      // Show fallback error message if the AppContext logout fails
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show loading indicator while checking auth status
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Loading...
      </div>
    );
  }

  // If loading is finished and still no user, redirect (handled by useEffect)
  // or render nothing briefly before redirect happens.
  if (!user) {
    return null;
  }

  // User is loaded and authenticated, proceed with layout
  const isAdmin = user.role === "ADMIN";

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b py-3 px-4 flex justify-between items-center md:hidden">
          <div className="flex items-center">
            <SidebarTrigger className="mr-3" />
            <h1 className="text-lg font-bold text-gray-900">
              {isAdmin ? "Admin Console" : "Item Removal"}
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-1"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        {/* Sidebar */}
        <Sidebar className="border-r shadow-sm bg-white">
          <SidebarHeader className="p-4 border-b">
            <h2 className="text-xl font-bold px-2 mb-4">
              {isAdmin ? "Admin Console" : "Item Removal System"}
            </h2>
            <UserCard user={user} className="shadow-sm" />
          </SidebarHeader>
          <SidebarContent>
            {/* Render the appropriate menu component based on user role */}
            {isAdmin ? <AdminSidebarMenu /> : <UserSidebarMenu />}
          </SidebarContent>
          <div className="mt-auto p-5 border-t">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full flex items-center justify-center h-10 gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </Sidebar>

        {/* Content */}
        <SidebarInset>
          <div
            className={
              isMobile
                ? "h-full overflow-y-auto pt-14"
                : "h-full overflow-y-auto"
            }
          >
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
