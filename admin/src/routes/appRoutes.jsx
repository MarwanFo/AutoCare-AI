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


const ForgotPasswordPlaceholder = () => (
  <div className="text-center py-6">
    <h2 className="text-xl font-bold text-white mb-2">Forgot Password</h2>
    <p className="text-sm text-zinc-400 mb-6">Enter your email to receive recovery link</p>
    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-left text-xs font-mono text-zinc-500 mb-6">
      Forgot Password screen will be generated in the next step.
    </div>
  </div>
);

const ResetPasswordPlaceholder = () => (
  <div className="text-center py-6">
    <h2 className="text-xl font-bold text-white mb-2">Reset Password</h2>
    <p className="text-sm text-zinc-400 mb-6">Set a new secure password</p>
    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-left text-xs font-mono text-zinc-500 mb-6">
      Reset Password screen will be generated in the next step.
    </div>
  </div>
);

const VerifyEmailPlaceholder = () => (
  <div className="text-center py-6">
    <h2 className="text-xl font-bold text-white mb-2">Verify Email</h2>
    <p className="text-sm text-zinc-400 mb-6">Verifying email activation token...</p>
    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-left text-xs font-mono text-zinc-500 mb-6">
      Email Verification screen will be generated in the next step.
    </div>
  </div>
);

// Admin-side placeholders
const DashboardPlaceholder = () => (
  <div className="space-y-6">
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
      <p className="text-sm text-zinc-400">Welcome to the AutoCare AI Management overview.</p>
    </div>
    <div className="grid gap-6 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
          <div className="h-4 w-24 bg-zinc-800 rounded mb-4" />
          <div className="h-8 w-16 bg-zinc-800 rounded" />
        </div>
      ))}
    </div>
  </div>
);

const ProfilePlaceholder = () => (
  <div className="space-y-6">
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold text-white tracking-tight">User Profile</h1>
      <p className="text-sm text-zinc-400">Manage account information and security details.</p>
    </div>
    <div className="p-6 max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
      <div className="space-y-4">
        <div className="h-6 w-32 bg-zinc-800 rounded" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-10 bg-zinc-800 rounded" />
          <div className="h-10 bg-zinc-800 rounded" />
        </div>
      </div>
    </div>
  </div>
);

const SessionsPlaceholder = () => (
  <div className="space-y-6">
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold text-white tracking-tight">Active Sessions</h1>
      <p className="text-sm text-zinc-400">View and revoke active device logins.</p>
    </div>
    <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
      <div className="h-32 bg-zinc-800 rounded" />
    </div>
  </div>
);





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
          { path: '/', element: <DashboardPlaceholder /> },
          { path: '/profile', element: <ProfilePlaceholder /> },
          { path: '/sessions', element: <Sessions /> },
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
