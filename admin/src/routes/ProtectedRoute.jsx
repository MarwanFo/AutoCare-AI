import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../features/auth/stores/authStore';

/**
 * ProtectedRoute — enforces authentication AND ROLE_ADMIN access for the admin panel.
 *
 * All routes in the Admin application require ROLE_ADMIN. A user who is
 * authenticated but holds only ROLE_USER (e.g. a mobile consumer) will be
 * rejected and redirected to /unauthorized.
 *
 * Additional fine-grained roles can be passed via `requiredRoles` for
 * specific sub-sections (e.g. ROLE_SUPER_ADMIN for user management).
 */
const ProtectedRoute = ({ requiredRoles = ['ROLE_ADMIN'] }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  // Wait for auth bootstrap to complete before making routing decisions
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-800 border-t-zinc-200" />
          <p className="text-sm font-medium text-zinc-400">Loading session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — redirect to login, preserving intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but missing required role — redirect to unauthorized
  const userRoles = user?.roles ?? new Set();
  const hasRequiredRole = requiredRoles.some((role) =>
    userRoles instanceof Set ? userRoles.has(role) : userRoles.includes(role)
  );

  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
