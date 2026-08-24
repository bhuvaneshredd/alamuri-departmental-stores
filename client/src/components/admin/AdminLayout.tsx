import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Grid,
  AlertTriangle,
  Users,
  Tag,
  Settings,
  LogOut,
  ExternalLink,
  Power,
  Store,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStoreConfig } from '../../contexts/StoreConfigContext';
import { adminService } from '../../services';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { settings, isStoreOpen, refreshSettings } = useStoreConfig();
  const [togglingStore, setTogglingStore] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleStore = async () => {
    setTogglingStore(true);
    try {
      await adminService.toggleStoreStatus();
      await refreshSettings();
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingStore(false);
    }
  };

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/orders', label: 'Orders Management', icon: ShoppingBag },
    { to: '/admin/products', label: 'Products Catalog', icon: Package },
    { to: '/admin/categories', label: 'Categories', icon: Grid },
    { to: '/admin/inventory', label: 'Low Stock Alerts', icon: AlertTriangle },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/coupons', label: 'Coupons & Discounts', icon: Tag },
    { to: '/admin/settings', label: 'Store Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Mobile top navigation */}
      <div className="md:hidden bg-gray-900 text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Alamuri Departmental Stores"
            className="w-8 h-8 object-contain bg-white rounded-lg p-0.5"
          />
          <span className="font-extrabold text-sm tracking-tight">Alamuri Stores Admin</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 text-gray-300">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-40 w-64 bg-gray-900 text-gray-300 flex flex-col justify-between p-5 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo & Store Title */}
          <div className="flex items-center gap-3 pb-6 mb-4 border-b border-gray-800">
            <img
              src="/logo.png"
              alt="Alamuri Departmental Stores"
              className="w-11 h-11 object-contain bg-white rounded-xl p-1 shadow-md shrink-0"
            />
            <div className="min-w-0">
              <h2 className="font-extrabold text-white text-xs sm:text-sm tracking-tight leading-tight truncate">
                {settings?.storeName || 'Alamuri Departmental Stores'}
              </h2>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mt-0.5">
                Store Owner Portal
              </span>
            </div>
          </div>

          {/* Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const ItemIcon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`
                  }
                >
                  <ItemIcon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Action buttons */}
        <div className="pt-4 border-t border-gray-800 space-y-2 text-xs">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-400" />
              <span>Customer Website</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/40 transition font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Store Status Toggle */}
            <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
              <span className="text-xs font-bold text-gray-700">Store Status:</span>
              <button
                onClick={handleToggleStore}
                disabled={togglingStore}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black transition ${
                  isStoreOpen
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-red-600 text-white shadow-sm'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{isStoreOpen ? 'OPEN FOR ORDERS' : 'STORE CLOSED'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-900">{user?.name || 'Store Administrator'}</p>
              <p className="text-[10px] text-gray-400">{user?.email || 'admin@quickstore.com'}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm border border-purple-200">
              👑
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;