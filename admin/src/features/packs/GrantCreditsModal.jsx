import React, { useState } from 'react';
import { X, Coins, Sparkles } from 'lucide-react';
import { packService } from '../../services/packService';

export const GrantCreditsModal = ({ isOpen, onClose, onSuccess }) => {
  const [userId, setUserId] = useState('');
  const [credits, setCredits] = useState(50);
  const [reason, setReason] = useState('Promotional Bonus');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId.trim()) {
      setError('Please provide a valid User ID');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await packService.grantUserCredits(userId.trim(), parseInt(credits, 10), reason);
      alert(`Success! User now has ${res.totalCredits} AI Credits.`);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to adjust user credits.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Manual AI Credit Grant</h3>
              <p className="text-xs text-zinc-400">Award or deduct credits directly for any user.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-red-950/40 border border-red-800 text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">User UUID</label>
            <input
              type="text"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. 88f395f2-bb3a-42fe-931b-..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Credits Amount <span className="text-zinc-500">(use negative to deduct)</span>
            </label>
            <input
              type="number"
              required
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Reason / Note</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Compensation for downtime, Support ticket #412"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-zinc-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Apply Credit Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
