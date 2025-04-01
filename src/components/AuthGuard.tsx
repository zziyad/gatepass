import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";

interface AuthGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

/**
 * Auth guard component for protected routes
 * Redirects to login if not authenticated
 * Redirects to dashboard if not admin but trying to access admin routes
 */
export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { user } = useApp();
  const location = useLocation();

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "ADMIN";

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route requires admin access but user is not admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise render children
  return <>{children}</>;
}

/**
 * Admin guard component specifically for admin routes
 * Redirects to dashboard if user is not admin
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  return <AuthGuard requireAdmin>{children}</AuthGuard>;
} 