import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { 
  Users, 
  Car, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  TrendingUp, 
  ShieldCheck 
} from 'lucide-react';

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch platform metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers ?? '—',
      subtitle: `${stats?.activeUsers ?? 0} active, ${stats?.suspendedUsers ?? 0} suspended`,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Total Vehicles',
      value: stats?.totalVehicles ?? '—',
      subtitle: `${stats?.activeVehicles ?? 0} active in fleet`,
      icon: Car,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Digital Twin Templates',
      value: stats?.totalTemplates ?? '—',
      subtitle: `${stats?.totalBrands ?? 0} brands, ${stats?.totalModels ?? 0} models`,
      icon: Layers,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'AI Background Jobs',
      value: stats?.totalJobs ?? '—',
      subtitle: `${stats?.completedJobs ?? 0} completed, ${stats?.failedJobs ?? 0} failed`,
      icon: Cpu,
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            System Overview
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Healthy
            </span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time platform statistics, vehicle fleet analytics, and background workers.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-sm font-medium text-zinc-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-red-500' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-sm flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md relative overflow-hidden group hover:border-zinc-700/80 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-xl border ${card.bg}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white tracking-tight">
                {loading ? (
                  <div className="h-8 w-16 bg-zinc-800 animate-pulse rounded-lg" />
                ) : (
                  card.value
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-2">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Secondary Status Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Workers Status */}
        <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Cpu className="h-4.5 w-4.5 text-red-400" />
            Background Workers & Job Queue
          </h3>
          <p className="text-xs text-zinc-400">
            Monitors asynchronous Gemini AI vehicle profile and digital twin generation jobs.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
              <span className="text-xs text-zinc-300">Completed Jobs</span>
              <span className="text-xs font-bold text-emerald-400">
                {stats?.completedJobs ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
              <span className="text-xs text-zinc-300">Active / Pending Queue</span>
              <span className="text-xs font-bold text-amber-400">
                {stats?.pendingJobs ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
              <span className="text-xs text-zinc-300">Failed / Retried</span>
              <span className="text-xs font-bold text-red-400">
                {stats?.failedJobs ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Security & Access Policy */}
        <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-blue-400" />
            User Status Distribution
          </h3>
          <p className="text-xs text-zinc-400">
            Account security states and email verification metrics.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
              <span className="text-xs text-zinc-300">Active & Verified Accounts</span>
              <span className="text-xs font-bold text-blue-400">
                {stats?.activeUsers ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
              <span className="text-xs text-zinc-300">Suspended / Blocked</span>
              <span className="text-xs font-bold text-red-400">
                {stats?.suspendedUsers ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
              <span className="text-xs text-zinc-300">Unverified Email Pending</span>
              <span className="text-xs font-bold text-zinc-400">
                {stats?.unverifiedUsers ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
