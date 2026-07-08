import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../features/auth/stores/authStore';

const GuestRoute = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

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

  if (isAuthenticated) {
    // Redirect to where they came from or default to dashboard
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
