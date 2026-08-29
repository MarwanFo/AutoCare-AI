import React from 'react';
import { useAuthStore } from '../auth/stores/authStore';
import { User, ShieldCheck, Mail, Phone, Calendar, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProfilePage = () => {
  const { user } = useAuthStore();

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          Admin Profile
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified Admin
          </span>
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Your personal account details, system credentials, and active sessions.
        </p>
      </div>

      <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-zinc-800">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-red-500/20">
            {user?.fullName?.charAt(0) || 'A'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{user?.fullName}</h2>
            <p className="text-xs text-zinc-400">{user?.email}</p>
            <div className="flex gap-2 mt-2">
              {user?.roles?.map((r) => (
                <span
                  key={r}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 font-mono"
                >
                  {r.replace('ROLE_', '')}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60 space-y-1">
            <span className="text-xs text-zinc-500 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email Address
            </span>
            <p className="text-sm font-semibold text-white">{user?.email}</p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60 space-y-1">
            <span className="text-xs text-zinc-500 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> Phone Number
            </span>
            <p className="text-sm font-semibold text-white">{user?.phoneNumber || 'Not configured'}</p>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-zinc-800">
          <div className="text-xs text-zinc-400">
            Need to manage connected devices or revoke logins?
          </div>
          <Link
            to="/sessions"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 transition-colors"
          >
            <KeyRound className="h-4 w-4 text-red-400" />
            Manage Active Sessions
          </Link>
        </div>
      </div>
    </div>
  );
};
