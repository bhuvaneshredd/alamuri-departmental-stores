import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  User as UserIcon,
  MapPin,
  Clock,
  ShieldCheck,
  LogOut,
  Package,
  Heart,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useLocation } from '../../contexts/LocationContext';
import { useStoreConfig } from '../../contexts/StoreConfigContext';
import SearchBar from './SearchBar';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout, setIsAuthModalOpen, setAuthModalMode } = useAuth();
  const { itemCount, subtotal, setIsDrawerOpen } = useCart();
  const { selectedAddress, isDeliverable, estimatedMinutes, setIsLocationModalOpen } = useLocation();
  const { settings, isStoreOpen } = useStoreConfig();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm transition-all">
      {/* Top micro bar: Store status notification if closed */}
      {!isStoreOpen && (
        <div className="bg-amber-500 text-white text-xs font-semibold py-1 px-4 text-center">
          ⚠️ Store is currently closed. Opening soon at {settings?.openingTime || '06:00 AM'}. You can still browse products!
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* 1. Logo & Brand */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="Metro Retail Supermarket"
                className="h-10 sm:h-12 w-auto max-w-[52px] object-contain group-hover:scale-105 transition shrink-0"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-sm sm:text-base md:text-lg tracking-tight text-gray-900 leading-tight">
                  {settings?.storeName || 'Metro Retail Supermarket'}
                </span>
                <span className="text-[10px] font-black tracking-wider text-emerald-700 uppercase">
                  10-15 MIN DELIVERY
                </span>
              </div>
            </Link>

            {/* Delivery Location Selector Chip */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden md:flex items-center gap-2 text-left px-3 py-1.5 rounded-xl hover:bg-gray-50 border border-gray-100 transition"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex flex-col max-w-[170px] truncate">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                  <span>Delivery in {estimatedMinutes} mins</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </div>
                <span className="text-[11px] text-gray-500 truncate">
                  {selectedAddress
                    ? `${selectedAddress.house}, ${selectedAddress.street}`
                    : 'Select delivery location'}
                </span>
              </div>
            </button>
          </div>

          {/* 2. Search Bar (Desktop) */}
          <div className="hidden sm:flex flex-1 max-w-xl">
            <SearchBar />
          </div>

          {/* 3. Right Actions: Store CTA, Profile & Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Order Now Link */}
            <Link
              to="/store"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition border border-emerald-200"
            >
              <span>⚡ Store & Aisles</span>
            </Link>

            {/* Admin shortcut if logged in as Admin */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-700 bg-purple-50 rounded-xl hover:bg-purple-100 transition border border-purple-200"
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin Panel
              </Link>
            )}

            {/* User Profile / Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl text-gray-700 hover:bg-gray-100 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-bold text-gray-900 leading-tight">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-gray-500">My Account</span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition"
                      >
                        <Package className="w-4 h-4 text-gray-400" />
                        My Orders & Reorder
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition"
                      >
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        Profile & Addresses
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-purple-700 hover:bg-purple-50 transition font-medium"
                        >
                          <LayoutDashboard className="w-4 h-4 text-purple-600" />
                          Admin Dashboard
                        </Link>
                      )}
                      <div className="border-t border-gray-100 mt-1">
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          Log out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-100 transition"
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2.5 px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition group active:scale-95"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-6 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-gray-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[10px] opacity-80 hidden sm:inline">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
                <span className="font-extrabold">₹{subtotal.toFixed(0)}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile search bar visible on mobile below header */}
        <div className="sm:hidden pb-3">
          <SearchBar />
        </div>
      </div>
    </header>
  );
};

export default Navbar;