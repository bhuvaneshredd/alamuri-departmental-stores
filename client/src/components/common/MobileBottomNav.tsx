import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Search, Package, User } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const { itemCount, setIsDrawerOpen } = useCart();
  const { isAuthenticated, setIsAuthModalOpen } = useAuth();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition ${
              isActive ? 'text-emerald-600 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          Home
        </NavLink>

        <NavLink
          to="/store"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition ${
              isActive ? 'text-emerald-600 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`
          }
        >
          <Grid className="w-5 h-5 mb-0.5" />
          Store
        </NavLink>

        <NavLink
          to="/search"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition ${
              isActive ? 'text-emerald-600 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`
          }
        >
          <Search className="w-5 h-5 mb-0.5" />
          Search
        </NavLink>

        <NavLink
          to="/orders"
          onClick={(e) => {
            if (!isAuthenticated) {
              e.preventDefault();
              setIsAuthModalOpen(true);
            }
          }}
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition ${
              isActive ? 'text-emerald-600 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`
          }
        >
          <Package className="w-5 h-5 mb-0.5" />
          Orders
        </NavLink>

        <NavLink
          to="/profile"
          onClick={(e) => {
            if (!isAuthenticated) {
              e.preventDefault();
              setIsAuthModalOpen(true);
            }
          }}
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition ${
              isActive ? 'text-emerald-600 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`
          }
        >
          <User className="w-5 h-5 mb-0.5" />
          Profile
        </NavLink>
      </div>
    </div>
  );
};

export default MobileBottomNav;