import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { 
  Cpu, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  Activity
} from 'lucide-react';

export const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 15,
        status: statusFilter || undefined,
      };
      const data = await adminService.getJobs(params);
      setJobs(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            AI Background Jobs
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-normal">
              {totalElements} total
            </span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Monitor asynchronous Gemini AI Digital Twin generation jobs and execution statuses.
          </p>
        </div>

        <button
          onClick={fetchJobs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-sm font-medium text-zinc-300 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-red-500' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex justify-end">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className="px-4 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-sm text-zinc-300 focus:outline-none focus:border-red-500/50 transition-colors cursor-pointer"
        >
          <option value="">All Job Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="RUNNING">Running</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* Jobs Table */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-950/60 text-xs uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Job ID & Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Current Stage</th>
                <th className="px-6 py-4">Retries</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-red-500 mb-2" />
                    Loading job history...
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No background jobs found.
                  </td>
                </tr>
              ) : (
                jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{j.type}</div>
                      <div className="font-mono text-[11px] text-zinc-500">{j.id}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          j.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : j.status === 'RUNNING'
                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                            : j.status === 'FAILED'
                            ? 'bg-red-500/10 border-red-500/20 text-red-400'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}
                      >
                        {j.status === 'COMPLETED' && <CheckCircle2 className="h-3 w-3" />}
                        {j.status === 'FAILED' && <XCircle className="h-3 w-3" />}
                        {j.status === 'RUNNING' && <Activity className="h-3 w-3 animate-pulse" />}
                        {j.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-zinc-300">
                      {j.currentStage || 'PENDING'}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-zinc-400">
                      {j.retryCount || 0}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-500">
                      {j.createdAt ? new Date(j.createdAt).toLocaleTimeString() + ' ' + new Date(j.createdAt).toLocaleDateString() : '—'}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      {j.errorMessage ? (
                        <span className="text-red-400 font-mono truncate max-w-xs block" title={j.errorMessage}>
                          {j.errorMessage}
                        </span>
                      ) : (
                        <span className="text-zinc-500">None</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="p-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
