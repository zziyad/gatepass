import { ReactNode } from "react";
import ProtectedRoute from "./ProtectedRoute";
import { UserRole } from '@/types/user';

interface GuardProps {
  children: ReactNode;
}

/**
 * Auth guard component for protected routes
 * Redirects to login if not authenticated
 * Redirects to dashboard if not admin but trying to access admin routes
 */
export function AuthGuard({ children }: GuardProps) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

/**
 * Admin guard component specifically for admin routes
 * Redirects to dashboard if user is not admin
 */
export function AdminGuard({ children }: GuardProps) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Guard component that requires HOD authentication
 */
export function HeadOfDepartmentGuard({ children }: GuardProps) {
  return (
    <ProtectedRoute allowedRoles={['HOD', 'ADMIN']}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Guard component that requires Finance authentication
 */
export function FinanceGuard({ children }: GuardProps) {
  return (
    <ProtectedRoute allowedRoles={['FINANCE', 'ADMIN']}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Guard component that requires Security authentication
 */
export function SecurityGuard({ children }: GuardProps) {
  return (
    <ProtectedRoute allowedRoles={['SECURITY', 'ADMIN']}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Guard component that requires Moderator authentication
 */
export function ModeratorGuard({ children }: GuardProps) {
  return (
    <ProtectedRoute allowedRoles={['MOD', 'ADMIN']}>
      {children}
    </ProtectedRoute>
  );
} 