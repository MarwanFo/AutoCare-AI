import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../features/auth/stores/authStore';
import { useLogout } from '../features/auth/hooks/useAuthMutations';
import { 
  LayoutDashboard, 
  User, 
  Settings, 
  LogOut, 
  ShieldAlert, 
  Menu, 
  Bell, 
  KeyRound
} from 'lucide-react';

const AdminLayout = () => {
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const location = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Active Sessions', path: '/sessions', icon: KeyRound },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-50 font-sans antialiased">
      {/* Sidebar navigation */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900/40 backdrop-blur-md hidden md:flex flex-col">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-zinc-800">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center font-bold text-white shadow-md shadow-red-500/20">
            A
          </div>
          <span className="font-bold tracking-tight text-white">AutoCare Admin</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-zinc-800 text-white font-semibold shadow-sm border border-zinc-700/50'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-red-500' : 'text-zinc-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 mb-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-200 truncate">{user?.fullName}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
            </div>
            <span className="shrink-0 inline-flex items-center justify-center rounded-full bg-red-500/10 px-2 py-0.5 text-[9px] font-medium text-red-400 border border-red-500/20">
              Admin
            </span>
          </div>

          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:bg-red-950/20 hover:text-red-400 border border-transparent hover:border-red-900/30 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>{logoutMutation.isPending ? 'Logging out...' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 shrink-0 border-b border-zinc-800/80 bg-zinc-900/20 backdrop-blur-md flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200">
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-sm font-semibold text-zinc-200">
              {navItems.find((item) => item.path === location.pathname)?.name || 'Admin Panel'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors relative">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-zinc-950" />
            </button>

            <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-300">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
