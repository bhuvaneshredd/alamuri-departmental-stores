import React, { useEffect, useState } from 'react';
import { Settings, Save, MapPin, Store } from 'lucide-react';
import { adminService, settingsService } from '../../services';
import { useStoreConfig } from '../../contexts/StoreConfigContext';

export const AdminSettingsPage: React.FC = () => {
  const { settings, refreshSettings } = useStoreConfig();
  const [formData, setFormData] = useState({
    storeName: '',
    storePhone: '',
    storeEmail: '',
    storeAddress: '',
    storeLatitude: 12.9716,
    storeLongitude: 77.5946,
    maxDeliveryRadiusKm: 7.5,
    minOrderAmount: 99,
    deliveryFee: 25,
    freeDeliveryThreshold: 299,
    codEnabled: true,
    maxCodAmount: 2000,
    onlinePaymentEnabled: true,
    openingTime: '06:00',
    closingTime: '23:00',
    estimatedDeliveryMinutes: 15,
  });
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        storeName: settings.storeName,
        storePhone: settings.storePhone,
        storeEmail: settings.storeEmail,
        storeAddress: settings.storeAddress,
        storeLatitude: settings.storeLatitude,
        storeLongitude: settings.storeLongitude,
        maxDeliveryRadiusKm: settings.maxDeliveryRadiusKm,
        minOrderAmount: settings.minOrderAmount,
        deliveryFee: settings.deliveryFee,
        freeDeliveryThreshold: settings.freeDeliveryThreshold,
        codEnabled: settings.codEnabled,
        maxCodAmount: settings.maxCodAmount,
        onlinePaymentEnabled: settings.onlinePaymentEnabled,
        openingTime: settings.openingTime,
        closingTime: settings.closingTime,
        estimatedDeliveryMinutes: settings.estimatedDeliveryMinutes,
      });
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMessage(false);
    try {
      await adminService.updateSettings(formData);
      await refreshSettings();
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to update store settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Store Settings & Rules</h1>
          <p className="text-xs text-gray-500 mt-1">
            Configure delivery radius, physical store location, operating hours & fees
          </p>
        </div>
        {savedMessage && (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl animate-fade-in">
            ✓ Settings Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6 text-xs">
        {/* Basic Store Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
            1. Physical Store Identity
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Store Name</label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Support Phone</label>
              <input
                type="text"
                required
                value={formData.storePhone}
                onChange={(e) => setFormData({ ...formData, storePhone: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Support Email</label>
              <input
                type="email"
                required
                value={formData.storeEmail}
                onChange={(e) => setFormData({ ...formData, storeEmail: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Store Physical Address</label>
              <input
                type="text"
                required
                value={formData.storeAddress}
                onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Geolocation & Delivery Radius */}
        <div className="pt-6 border-t border-gray-100 space-y-4">
          <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
            2. Geolocation Coordinates & Delivery Radius
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Store Latitude</label>
              <input
                type="number"
                step="any"
                required
                value={formData.storeLatitude}
                onChange={(e) => setFormData({ ...formData, storeLatitude: parseFloat(e.target.value) })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Store Longitude</label>
              <input
                type="number"
                step="any"
                required
                value={formData.storeLongitude}
                onChange={(e) => setFormData({ ...formData, storeLongitude: parseFloat(e.target.value) })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Max Delivery Radius (KM)</label>
              <input
                type="number"
                step="0.5"
                required
                value={formData.maxDeliveryRadiusKm}
                onChange={(e) => setFormData({ ...formData, maxDeliveryRadiusKm: parseFloat(e.target.value) })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none font-bold text-emerald-700"
              />
            </div>
          </div>
        </div>

        {/* Pricing, Free Delivery & Operating Hours */}
        <div className="pt-6 border-t border-gray-100 space-y-4">
          <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
            3. Order Limits, Fees & Operating Timings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Min Order Amount (₹)</label>
              <input
                type="number"
                required
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Delivery Fee (₹)</label>
              <input
                type="number"
                required
                value={formData.deliveryFee}
                onChange={(e) => setFormData({ ...formData, deliveryFee: Number(e.target.value) })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Free Delivery Above (₹)</label>
              <input
                type="number"
                required
                value={formData.freeDeliveryThreshold}
                onChange={(e) => setFormData({ ...formData, freeDeliveryThreshold: Number(e.target.value) })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold text-emerald-700"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Opening Time (24hr)</label>
              <input
                type="text"
                value={formData.openingTime}
                onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Closing Time (24hr)</label>
              <input
                type="text"
                value={formData.closingTime}
                onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Max COD Order Amount (₹)</label>
              <input
                type="number"
                value={formData.maxCodAmount}
                onChange={(e) => setFormData({ ...formData, maxCodAmount: Number(e.target.value) })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Store Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage;