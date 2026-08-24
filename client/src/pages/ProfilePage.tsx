import React, { useState, useEffect } from 'react';
import { User, MapPin, Lock, LogOut, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { addressService, authService } from '../services';
import { Address } from '../types';
import EmptyState from '../components/common/EmptyState';

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, logout, updateUserProfile, setIsAuthModalOpen } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const fetchAddresses = async () => {
    try {
      const res = await addressService.getAddresses();
      if (res.data.success) {
        setAddresses(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon="🔒"
        title="Sign in to View Profile"
        subtitle="Manage your personal details and delivery addresses."
        actionText="Sign In"
        onActionClick={() => setIsAuthModalOpen(true)}
      />
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      await updateUserProfile({ name, phone: phone || undefined });
      alert('Profile updated successfully!');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess(null);
    setPassError(null);
    try {
      const res = await authService.changePassword({ currentPassword, newPassword });
      if (res.data.success) {
        setPassSuccess('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (e: any) {
      setPassError(e.response?.data?.message || 'Failed to change password');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await addressService.deleteAddress(id);
      fetchAddresses();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Account & Addresses</h1>
        <p className="text-xs text-gray-500 mt-0.5">Manage your personal information and delivery locations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Details */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
            Personal Information
          </h2>
          <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-600 font-bold mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-bold mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full p-2.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-xl cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-bold mb-1">Phone Number (10 Digits)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition"
            >
              {updatingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>

          {/* Change Password */}
          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-3">
              Change Password
            </h3>
            {passSuccess && <p className="text-xs text-emerald-600 font-bold mb-2">{passSuccess}</p>}
            {passError && <p className="text-xs text-red-600 font-bold mb-2">{passError}</p>}
            <form onSubmit={handleChangePassword} className="space-y-2.5 text-xs">
              <input
                type="password"
                required
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500"
              />
              <input
                type="password"
                required
                minLength={6}
                placeholder="New Password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="w-full py-2 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* Saved Addresses */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
            Saved Delivery Addresses
          </h2>
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {addresses.map((addr) => (
              <div key={addr.id} className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 flex justify-between items-start">
                <div className="text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-800 text-[10px] font-bold rounded">
                      {addr.addressType}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] text-emerald-600 font-bold">Default</span>
                    )}
                  </div>
                  <p className="font-bold text-gray-900">{addr.fullName} ({addr.phone})</p>
                  <p className="text-gray-600 mt-0.5">{addr.house}, {addr.street}</p>
                  <p className="text-gray-600">{addr.area}, {addr.city} - {addr.pincode}</p>
                </div>
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition"
                  title="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;