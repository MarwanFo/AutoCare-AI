import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { 
  Users, 
  Search, 
  Shield, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  MoreVertical, 
  RefreshCw,
  Car
} from 'lucide-react';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 15,
        query: query.trim() || undefined,
        status: statusFilter || undefined,
      };
      const data = await adminService.getUsers(params);
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    setActionLoading(user.id);
    try {
      await adminService.updateUserStatus(user.id, newStatus);
      await fetchUsers();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleRole = async (user) => {
    const hasAdmin = user.roles?.includes('ROLE_ADMIN');
    const newRole = hasAdmin ? 'ROLE_USER' : 'ROLE_ADMIN';
    if (!confirm(`Are you sure you want to change role for ${user.fullName} to ${newRole}?`)) {
      return;
    }
    setActionLoading(user.id);
    try {
      await adminService.updateUserRole(user.id, newRole);
      await fetchUsers();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update user role');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            User Management
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-normal">
              {totalElements} total
            </span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Search, view profiles, manage security roles, and suspend/activate accounts.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-sm font-medium text-zinc-300 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-red-500' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50 transition-colors"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className="px-4 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-sm text-zinc-300 focus:outline-none focus:border-red-500/50 transition-colors cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="UNVERIFIED">Unverified</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-950/60 text-xs uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Roles</th>
                <th className="px-6 py-4">Vehicles</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-red-500 mb-2" />
                    Loading accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSuspended = u.status === 'SUSPENDED';
                  const isAdmin = u.roles?.includes('ROLE_ADMIN') || u.roles?.includes('ROLE_SUPER_ADMIN');

                  return (
                    <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-200">
                            {u.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-white">{u.fullName}</div>
                            <div className="text-xs text-zinc-500">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : u.status === 'SUSPENDED'
                              ? 'bg-red-500/10 border-red-500/20 text-red-400'
                              : 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-1.5 flex-wrap">
                          {u.roles?.map((role) => (
                            <span
                              key={role}
                              className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-medium border ${
                                role.includes('ADMIN')
                                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                  : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                              }`}
                            >
                              {role.replace('ROLE_', '')}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <Car className="h-4 w-4 text-zinc-500" />
                          <span className="font-semibold">{u.vehicleCount}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={actionLoading === u.id}
                          className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer disabled:opacity-50 ${
                            isSuspended
                              ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300 hover:bg-emerald-900/50'
                              : 'bg-red-950/30 border-red-800 text-red-300 hover:bg-red-900/50'
                          }`}
                        >
                          {isSuspended ? 'Reactivate' : 'Suspend'}
                        </button>

                        <button
                          onClick={() => handleToggleRole(u)}
                          disabled={actionLoading === u.id}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isAdmin ? 'Demote' : 'Promote Admin'}
                        </button>
                      </td>
                    </tr>
                  );
                })
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
