import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { 
  Car, 
  Search, 
  RefreshCw, 
  Calendar, 
  Gauge, 
  Fuel, 
  Hash,
  ShieldCheck
} from 'lucide-react';

export const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 15,
        query: query.trim() || undefined,
      };
      const data = await adminService.getVehicles(params);
      setVehicles(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch fleet vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchVehicles();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            Global Fleet Vehicles
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-normal">
              {totalElements} active
            </span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Browse all user-registered digital twins, VIN numbers, and odometer readings.
          </p>
        </div>

        <button
          onClick={fetchVehicles}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-sm font-medium text-zinc-300 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-red-500' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search Toolbar */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search by Brand, Model, VIN, License Plate..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50 transition-colors"
        />
      </form>

      {/* Vehicles Table */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-950/60 text-xs uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Identifiers (VIN / Plate)</th>
                <th className="px-6 py-4">Odometer</th>
                <th className="px-6 py-4">Specs</th>
                <th className="px-6 py-4">Digital Twin Health</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-red-500 mb-2" />
                    Loading fleet vehicles...
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No vehicles found.
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center">
                          <Car className="h-5 w-5 text-red-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">
                            {v.year} {v.brandName} {v.modelName}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {v.nickname ? `"${v.nickname}" • ` : ''}
                            {v.trimConfiguration || 'Standard'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                      <div className="text-zinc-200">VIN: {v.vin || '—'}</div>
                      <div className="text-zinc-500">Plate: {v.licensePlate || '—'}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-zinc-200 font-semibold">
                        <Gauge className="h-4 w-4 text-zinc-500" />
                        {v.currentMileage?.toLocaleString() || 0} {v.mileageUnit}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-400">
                      <div>{v.fuelType}</div>
                      <div className="text-zinc-500">{v.transmission}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${v.completenessScore || 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-emerald-400">
                          {v.completenessScore || 100}%
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        {v.status}
                      </span>
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
