import { lazy, ReactNode, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { AuthGuard, AdminGuard } from "@/components/AuthGuard";

// Loading fallback component (can be shared or defined here)
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

// Helper for protected routes
const protectedRoute = (
  component: ReactNode,
  requireAdmin: boolean = false
): ReactNode => {
  return requireAdmin ? (
    <AdminGuard>{component}</AdminGuard>
  ) : (
    <AuthGuard>{component}</AuthGuard>
  );
};

// Define route configuration
export interface RouteConfig {
  path: string;
  element: ReactNode;
  // Add other properties like isProtected, layout, etc. if needed later
}

export const routes: RouteConfig[] = [
  // Redirect root to login
  { path: "/", element: <Navigate replace to="/login" /> },

  // Auth routes (public)
  { path: "/login", element: lazyLoad(() => import("./pages/Login")) },
  { path: "/forbidden", element: lazyLoad(() => import("./pages/Forbidden")) },
  { path: "/unauthorized", element: lazyLoad(() => import("./pages/Unauthorized")) },
  { path: "/api-test", element: lazyLoad(() => import("./pages/ApiTest")) },
  
  // Admin routes (protected)
  { 
    path: "/admin", 
    element: protectedRoute(lazyLoad(() => import("./pages/admin/Dashboard")), true) 
  },
  { 
    path: "/admin/users", 
    element: protectedRoute(lazyLoad(() => import("./pages/admin/Users")), true) 
  },
  { 
    path: "/admin/departments", 
    element: protectedRoute(lazyLoad(() => import("./pages/admin/Departments")), true) 
  },
  { 
    path: "/admin/removal-reasons", 
    element: protectedRoute(lazyLoad(() => import("./pages/admin/RemovalReasons")), true) 
  },
  { 
    path: "/admin/register-user", 
    element: protectedRoute(lazyLoad(() => import("./pages/admin/RegisterUser")), true) 
  },

  // Main application routes (protected)
  { 
    path: "/dashboard", 
    element: protectedRoute(lazyLoad(() => import("./pages/Dashboard"))) 
  },
  {
    path: "/new-request",
    element: protectedRoute(lazyLoad(() => import("./pages/NewRequest")))
  },
  {
    path: "/my-requests",
    element: protectedRoute(lazyLoad(() => import("./pages/MyRequests")))
  },
  { 
    path: "/approvals", 
    element: protectedRoute(lazyLoad(() => import("./pages/Approvals"))) 
  },
  { 
    path: "/profile", 
    element: protectedRoute(lazyLoad(() => import("./pages/Profile"))) 
  },
  {
    path: "/request/:id",
    element: protectedRoute(lazyLoad(() => import("./pages/RequestDetail")))
  },

  // Catch-all route (must be last)
  { path: "*", element: lazyLoad(() => import("./pages/NotFound")) },
];
