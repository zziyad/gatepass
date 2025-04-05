import { lazy, ReactNode, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { AuthGuard, AdminGuard } from "@/components/AuthGuard";

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
  </div>
);

// Helper function for lazy loading with Suspense
const lazyLoad = (
  factory: () => Promise<{ default: React.ComponentType<any> }>
): ReactNode => {
  const LazyComponent = lazy(factory);
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent />
    </Suspense>
  );
};

// Enhanced route configuration with role-based access
export interface RouteConfig {
  path: string;
  element: ReactNode;
  roles?: ('admin' | 'user')[];
  title?: string;
  description?: string;
}

// User (regular employee) routes
const userRoutes: RouteConfig[] = [
  { 
    path: "/dashboard", 
    element: lazyLoad(() => import("./pages/Dashboard")),
    roles: ['user', 'admin'],
    title: "Dashboard",
    description: "Overview of your removal requests and activities"
  },
  {
    path: "/new-request",
    element: lazyLoad(() => import("./pages/NewRequest")),
    roles: ['user', 'admin'],
    title: "New Request",
    description: "Create a new item removal request"
  },
  {
    path: "/my-requests",
    element: lazyLoad(() => import("./pages/MyRequests")),
    roles: ['user', 'admin'],
    title: "My Requests",
    description: "View and manage your removal requests"
  },
  {
    path: "/removals",
    element: lazyLoad(() => import("./pages/Removals")),
    roles: ['user', 'admin'],
    title: "All Removals",
    description: "View and manage all removal requests"
  },
  { 
    path: "/approvals", 
    element: lazyLoad(() => import("./pages/Approvals")),
    roles: ['user', 'admin'],
    title: "Approvals",
    description: "Review and approve pending requests"
  },
  { 
    path: "/profile", 
    element: lazyLoad(() => import("./pages/Profile")),
    roles: ['user', 'admin'],
    title: "Profile",
    description: "Manage your account profile"
  },
  {
    path: "/request/:id",
    element: lazyLoad(() => import("./pages/RequestDetail")),
    roles: ['user', 'admin'],
    title: "Request Details",
    description: "View request details and status"
  }
];

// Admin-only routes
const adminRoutes: RouteConfig[] = [
  { 
    path: "/admin", 
    element: lazyLoad(() => import("./pages/admin/Dashboard")),
    roles: ['admin'],
    title: "Admin Dashboard",
    description: "System overview and management"
  },
  { 
    path: "/admin/users", 
    element: lazyLoad(() => import("./pages/admin/Users")),
    roles: ['admin'],
    title: "User Management",
    description: "Manage system users"
  },
  { 
    path: "/admin/departments", 
    element: lazyLoad(() => import("./pages/admin/Departments")),
    roles: ['admin'],
    title: "Department Management",
    description: "Manage organizational departments"
  },
  { 
    path: "/admin/removal-reasons", 
    element: lazyLoad(() => import("./pages/admin/RemovalReasons")),
    roles: ['admin'],
    title: "Removal Reasons",
    description: "Manage removal reason categories"
  }
];

// Public routes that don't require authentication
const publicRoutes: RouteConfig[] = [
  { path: "/login", element: lazyLoad(() => import("./pages/Login")) },
  { path: "/forbidden", element: lazyLoad(() => import("./pages/Forbidden")) },
  { path: "/unauthorized", element: lazyLoad(() => import("./pages/Unauthorized")) },
  { path: "*", element: lazyLoad(() => import("./pages/NotFound")) }
];

// Apply protection to routes based on their roles
const applyRouteProtection = (routes: RouteConfig[]): RouteConfig[] => {
  return routes.map(route => {
    // Skip protection for routes without roles (like 404)
    if (!route.roles) return route;
    
    // Apply AdminGuard to admin-only routes
    if (route.roles.includes('admin') && !route.roles.includes('user')) {
      return {
        ...route,
        element: <AdminGuard>{route.element}</AdminGuard>
      };
    }
    
    // Apply AuthGuard to user routes
    return {
      ...route,
      element: <AuthGuard>{route.element}</AuthGuard>
    };
  });
};

// Combine all routes with appropriate protection
export const routes: RouteConfig[] = [
  // Redirect root to login
  { path: "/", element: <Navigate replace to="/login" /> },
  
  // Add all route types
  ...publicRoutes,
  ...applyRouteProtection(userRoutes),
  ...applyRouteProtection(adminRoutes)
];

// Helper functions to get routes for navigation menus
export const getUserRoutes = () => userRoutes;
export const getAdminRoutes = () => adminRoutes;
