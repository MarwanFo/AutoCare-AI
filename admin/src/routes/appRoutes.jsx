import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';

import { Login } from '../features/auth/components/Login';
import { ForgotPassword } from '../features/auth/components/ForgotPassword';
import { ResetPassword } from '../features/auth/components/ResetPassword';
import { VerifyEmail } from '../features/auth/components/VerifyEmail';
import { Sessions } from '../features/auth/components/Sessions';
import { Unauthorized } from '../features/auth/components/Unauthorized';
import { NotFound } from '../features/auth/components/NotFound';

import { DashboardPage } from '../features/dashboard/DashboardPage';
import { UsersPage } from '../features/users/UsersPage';
import { VehiclesPage } from '../features/vehicles/VehiclesPage';
import { JobsPage } from '../features/jobs/JobsPage';
import { ProfilePage } from '../features/profile/ProfilePage';

export const appRoutes = createBrowserRouter([
  // Guest-Only Authentication Pages
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <Login /> },
          // /register is intentionally removed — admin accounts are provisioned by Super Admins only
          { path: '/register', element: <Navigate to="/login" replace /> },
          { path: '/forgot-password', element: <ForgotPassword /> },
          { path: '/reset-password', element: <ResetPassword /> },
          { path: '/verify-email', element: <VerifyEmail /> },
        ],
      },
    ],
  },
  
  // Protected Management Dashboard Pages
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/users', element: <UsersPage /> },
          { path: '/vehicles', element: <VehiclesPage /> },
          { path: '/jobs', element: <JobsPage /> },
          { path: '/sessions', element: <Sessions /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/unauthorized', element: <Unauthorized /> },
        ],
      },
    ],
  },
  
  // Global 404 handler
  {
    path: '*',
    element: <NotFound />,
  },
]);
