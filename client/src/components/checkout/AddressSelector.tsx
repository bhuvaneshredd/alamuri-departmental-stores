import React, { useState } from 'react';
import { MapPin, Plus, CheckCircle2 } from 'lucide-react';
import { Address } from '../../types';
import { addressService } from '../../services';

interface AddressSelectorProps {
  addresses: Address[];
  selectedAddressId: string | null;
  onSelectAddress: (addr: Address) => void;
  onAddressAdded: () => void;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddressAdded,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    house: '',
    street: '',
    area: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    landmark: '',
    addressType: 'HOME' as const,
  });
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await addressService.createAddress(formData);
      if (res.data.success) {
        onAddressAdded();
        onSelectAddress(res.data.data);
        setShowAddForm(false);
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
          1. Delivery Address
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Cancel' : 'Add New Address'}</span>
        </button>
      </div>

      {/* Add Address Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
          <h4 className="text-xs font-bold text-gray-900">Add New Delivery Address</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div>
              <label className="block text-gray-600 font-medium mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full p-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">10-Digit Mobile</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className="w-full p-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-gray-600 font-medium mb-1">Flat / House No / Building</label>
              <input
                type="text"
                required
                value={formData.house}
                onChange={(e) => setFormData({ ...formData, house: e.target.value })}
                className="w-full p-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-gray-600 font-medium mb-1">Street / Locality</label>
              <input
                type="text"
                required
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full p-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Area</label>
              <input
                type="text"
                required
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full p-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Pincode (6 Digits)</label>
              <input
                type="text"
                required
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                className="w-full p-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition"
          >
            {saving ? 'Saving...' : 'Save & Select Address'}
          </button>
        </form>
      )}

      {/* Address cards list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {addresses.map((addr) => {
          const isSelected = selectedAddressId === addr.id;
          return (
            <div
              key={addr.id}
              onClick={() => onSelectAddress(addr)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[10px] font-bold uppercase">
                    {addr.addressType}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <h4 className="text-xs font-bold text-gray-900">{addr.fullName}</h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {addr.house}, {addr.street}, {addr.area}, {addr.city} - {addr.pincode}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">Phone: {addr.phone}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};