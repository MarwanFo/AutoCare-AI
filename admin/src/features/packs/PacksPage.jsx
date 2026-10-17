import React, { useEffect, useState } from 'react';
import { packService } from '../../services/packService';
import { PackModal } from './PackModal';
import { GrantCreditsModal } from './GrantCreditsModal';
import {
  Package,
  Plus,
  Coins,
  Check,
  Edit2,
  Trash2,
  Power,
  Sparkles,
  Car,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export const PacksPage = () => {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'SUBSCRIPTION', 'CREDIT_PACK'
  const [selectedPack, setSelectedPack] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchPacks = async () => {
    setLoading(true);
    try {
      const data = await packService.getPacks();
      setPacks(data || []);
    } catch (err) {
      console.error('Failed to load packs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, []);

  const handleToggleStatus = async (pack) => {
    setActionLoadingId(pack.id);
    try {
      await packService.togglePackStatus(pack.id);
      await fetchPacks();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to toggle pack status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeletePack = async (pack) => {
    if (!confirm(`Are you sure you want to delete pack "${pack.name}"? This action cannot be undone.`)) {
      return;
    }
    setActionLoadingId(pack.id);
    try {
      await packService.deletePack(pack.id);
      await fetchPacks();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete pack.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSavePack = async (payload) => {
    try {
      if (selectedPack?.id) {
        await packService.updatePack(selectedPack.id, payload);
      } else {
        await packService.createPack(payload);
      }
      setIsModalOpen(false);
      setSelectedPack(null);
      await fetchPacks();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save pack.');
    }
  };

  const filteredPacks = packs.filter((p) => {
    if (filterType === 'ALL') return true;
    return p.packType === filterType;
  });

  const subscriptionCount = packs.filter((p) => p.packType === 'SUBSCRIPTION').length;
  const creditPackCount = packs.filter((p) => p.packType === 'CREDIT_PACK').length;
  const activeCount = packs.filter((p) => p.isActive).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            Packs & Pricing Management
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-normal">
              {packs.length} packs
            </span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Configure subscription tiers, vehicle quotas, and AI credit packages dynamically for mobile & web.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreditModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-amber-400 text-sm font-medium transition-colors"
          >
            <Coins className="w-4 h-4" />
            <span>Grant Credits</span>
          </button>

          <button
            onClick={() => {
              setSelectedPack(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold shadow-lg shadow-red-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Pack</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Packs</span>
            <Layers className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-white">{packs.length}</div>
          <p className="text-xs text-zinc-500 mt-1">{activeCount} currently live in store</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Subscription Tiers</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{subscriptionCount}</div>
          <p className="text-xs text-blue-400/80 mt-1">Monthly & Annual driver plans</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Credit Top-ups</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{creditPackCount}</div>
          <p className="text-xs text-amber-400/80 mt-1">Pay-as-you-go diagnostic tokens</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Live Store Sync</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-Time
          </div>
          <p className="text-xs text-zinc-500 mt-1">Instant mobile & admin synchronization</p>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        {[
          { label: 'All Packs', value: 'ALL' },
          { label: 'Subscriptions (Monthly/Annual)', value: 'SUBSCRIPTION' },
          { label: 'Credit Top-ups (One-Time)', value: 'CREDIT_PACK' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterType(tab.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterType === tab.value
                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-red-500 border-r-2 border-r-transparent"></div>
          <p className="text-sm text-zinc-400 mt-3">Loading pricing packages...</p>
        </div>
      ) : filteredPacks.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20">
          <Package className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-200">No packs found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Get started by creating your first subscription tier or AI credit package.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPacks.map((pack) => {
            let featuresList = [];
            try {
              featuresList = typeof pack.features === 'string' ? JSON.parse(pack.features) : pack.features || [];
            } catch (e) {
              featuresList = pack.features ? pack.features.split('\n') : [];
            }

            const isSub = pack.packType === 'SUBSCRIPTION';

            return (
              <div
                key={pack.id}
                className={`relative rounded-2xl border flex flex-col justify-between transition-all duration-200 bg-zinc-900/40 backdrop-blur-sm ${
                  pack.isActive
                    ? 'border-zinc-800 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/50'
                    : 'border-zinc-800/40 opacity-60'
                }`}
              >
                {/* Card Top */}
                <div className="p-6">
                  {/* Badge & Status Indicator */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md border ${
                        isSub
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {isSub ? 'Subscription' : 'Credit Top-Up'}
                    </span>

                    {pack.badge && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-sm">
                        {pack.badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Code */}
                  <h3 className="text-xl font-bold text-white mb-1">{pack.name}</h3>
                  <p className="text-[11px] font-mono text-zinc-500 mb-3">{pack.code}</p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-4">
                    <span className="text-3xl font-extrabold text-white">
                      {pack.price === 0 ? 'Gratuit (0 DH)' : `${pack.price} ${pack.currency === 'MAD' ? 'DH' : pack.currency}`}
                    </span>
                    {pack.price > 0 && isSub && (
                      <span className="text-xs text-zinc-400 font-medium">
                        / {pack.billingPeriod?.toLowerCase() || 'mo'}
                      </span>
                    )}
                  </div>

                  {pack.description && (
                    <p className="text-xs text-zinc-400 mb-4 line-clamp-2 leading-relaxed">
                      {pack.description}
                    </p>
                  )}

                  {/* Quotas Badges */}
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    <div className="px-3 py-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                      <div className="text-[10px] uppercase font-semibold text-zinc-500 flex items-center gap-1.5 mb-0.5">
                        <Car className="w-3 h-3 text-zinc-400" />
                        Vehicles
                      </div>
                      <div className="text-xs font-bold text-zinc-200">
                        {pack.vehicleLimit === -1 ? 'Unlimited' : `${pack.vehicleLimit} Car${pack.vehicleLimit > 1 ? 's' : ''}`}
                      </div>
                    </div>

                    <div className="px-3 py-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                      <div className="text-[10px] uppercase font-semibold text-zinc-500 flex items-center gap-1.5 mb-0.5">
                        <Coins className="w-3 h-3 text-amber-400" />
                        AI Credits
                      </div>
                      <div className="text-xs font-bold text-zinc-200">
                        {pack.aiCredits} {isSub ? '/ mo' : 'Tokens'}
                      </div>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2 pt-3 border-t border-zinc-800/80">
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                      Included Capabilities:
                    </span>
                    {featuresList.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-6 py-4 bg-zinc-950/60 border-t border-zinc-800 flex items-center justify-between rounded-b-2xl">
                  {/* Active Toggle Switch */}
                  <button
                    onClick={() => handleToggleStatus(pack)}
                    disabled={actionLoadingId === pack.id}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                      pack.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700/50 hover:bg-zinc-700'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {pack.isActive ? 'Active' : 'Disabled'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedPack(pack);
                        setIsModalOpen(true);
                      }}
                      className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      title="Edit Pack"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePack(pack)}
                      className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/20 transition-colors"
                      title="Delete Pack"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit/Create Pack Modal */}
      <PackModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPack(null);
        }}
        onSave={handleSavePack}
        pack={selectedPack}
      />

      {/* Manual Credit Grant Modal */}
      <GrantCreditsModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
      />
    </div>
  );
};
