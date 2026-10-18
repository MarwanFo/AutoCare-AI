import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, Sparkles } from 'lucide-react';

export const PackModal = ({ isOpen, onClose, onSave, pack = null, isLoading = false }) => {
  const isEditing = Boolean(pack?.id);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    packType: 'SUBSCRIPTION',
    price: 99.00,
    currency: 'MAD',
    billingPeriod: 'MONTHLY',
    vehicleLimit: 3,
    aiCredits: 100,
    badge: '',
    isActive: true,
    displayOrder: 1,
    featuresList: [],
  });

  const [newFeatureText, setNewFeatureText] = useState('');

  useEffect(() => {
    if (pack) {
      const parsedFeatures = (() => { try { return typeof pack.features === 'string' ? JSON.parse(pack.features) : (pack.features || []); } catch (e) { return pack.features ? pack.features.split('\n').filter(Boolean) : []; } })();

      setFormData({
        code: pack.code || '',
        name: pack.name || '',
        description: pack.description || '',
        packType: pack.packType || 'SUBSCRIPTION',
        price: pack.price !== undefined ? pack.price : 99.00,
        currency: pack.currency || 'MAD',
        billingPeriod: pack.billingPeriod || (pack.packType === 'CREDIT_PACK' ? 'ONE_TIME' : 'MONTHLY'),
        vehicleLimit: pack.vehicleLimit !== undefined ? pack.vehicleLimit : 1,
        aiCredits: pack.aiCredits || 0,
        badge: pack.badge || '',
        isActive: pack.isActive !== undefined ? pack.isActive : true,
        displayOrder: pack.displayOrder || 1,
        featuresList: Array.isArray(parsedFeatures) ? parsedFeatures : [],
      });
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        packType: 'SUBSCRIPTION',
        price: 99.00,
        currency: 'MAD',
        billingPeriod: 'MONTHLY',
        vehicleLimit: 3,
        aiCredits: 100,
        badge: '',
        isActive: true,
        displayOrder: 1,
        featuresList: ['1 Registered Vehicle', '10 AI Diagnosis Credits / mo'],
      });
    }
    setNewFeatureText('');
  }, [pack, isOpen]);

  if (!isOpen) return null;

  const handleAddFeature = (e) => {
    e.preventDefault();
    if (newFeatureText.trim()) {
      setFormData((prev) => ({
        ...prev,
        featuresList: [...prev.featuresList, newFeatureText.trim()],
      }));
      setNewFeatureText('');
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      featuresList: prev.featuresList.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      description: formData.description,
      packType: formData.packType,
      price: parseFloat(formData.price) || 0,
      currency: formData.currency.toUpperCase(),
      billingPeriod: formData.packType === 'CREDIT_PACK' ? 'ONE_TIME' : formData.billingPeriod,
      vehicleLimit: parseInt(formData.vehicleLimit, 10) || 0,
      aiCredits: parseInt(formData.aiCredits, 10) || 0,
      features: JSON.stringify(formData.featuresList),
      badge: formData.badge.trim() || null,
      isActive: formData.isActive,
      displayOrder: parseInt(formData.displayOrder, 10) || 0,
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-500" />
              {isEditing ? `Edit Pack: ${pack.name}` : 'Create New Pricing Pack'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Configure pricing, AI credit allowances, and features displayed to users.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Pack Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Pro Driver"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Unique Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. PRO_MONTHLY"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500 uppercase"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief summary of what this tier offers..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pack Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Pack Type</label>
              <select
                value={formData.packType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    packType: e.target.value,
                    billingPeriod: e.target.value === 'CREDIT_PACK' ? 'ONE_TIME' : 'MONTHLY',
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="SUBSCRIPTION">Subscription Plan</option>
                <option value="CREDIT_PACK">Credit Top-Up Pack</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="MAD">MAD (DH - Moroccan Dirham)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Billing Period */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Billing Interval</label>
              <select
                disabled={formData.packType === 'CREDIT_PACK'}
                value={formData.billingPeriod}
                onChange={(e) => setFormData({ ...formData, billingPeriod: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500 disabled:opacity-50 cursor-pointer"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="ANNUAL">Annual</option>
                <option value="ONE_TIME">One Time</option>
              </select>
            </div>

            {/* Vehicle Limit */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Vehicle Limit <span className="text-slate-400 dark:text-zinc-500">(-1 for unl.)</span>
              </label>
              <input
                type="number"
                value={formData.vehicleLimit}
                onChange={(e) => setFormData({ ...formData, vehicleLimit: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
              />
            </div>

            {/* AI Credits */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">AI Credits Granted</label>
              <input
                type="number"
                min="0"
                value={formData.aiCredits}
                onChange={(e) => setFormData({ ...formData, aiCredits: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Badge */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Badge Tag (Optional)</label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="e.g. Most Popular, Best Value"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Display Order */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Display Sort Order</label>
              <input
                type="number"
                min="0"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Features Builder */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">Features Included in Pack</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature(e);
                  }
                }}
                placeholder="Type a feature and press Enter (e.g. AI Invoice OCR Scanner)"
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-sm font-medium text-slate-800 dark:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            {formData.featuresList.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-zinc-500 italic">No features added yet.</p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {formData.featuresList.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800/80 text-xs text-slate-700 dark:text-zinc-300"
                  >
                    <span className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                      {feat}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="text-slate-400 dark:text-zinc-500 hover:text-red-500 p-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active status checkbox */}
          <div className="pt-2 border-t border-slate-200 dark:border-zinc-800/80 flex items-center gap-3">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded text-red-600 bg-slate-100 dark:bg-zinc-950 border-slate-300 dark:border-zinc-800 focus:ring-red-500"
            />
            <label htmlFor="isActiveCheck" className="text-sm font-medium text-slate-700 dark:text-zinc-200 cursor-pointer">
              Active & Available in Mobile Store
            </label>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Pack'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
