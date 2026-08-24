import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Clock, Phone, Mail, MapPin, Heart } from 'lucide-react';
import { useStoreConfig } from '../../contexts/StoreConfigContext';

export const Footer: React.FC = () => {
  const { settings } = useStoreConfig();

  return (
    <footer className="bg-white border-t border-gray-100 pt-12 pb-20 md:pb-12 text-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value features grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase">10-15 Min Delivery</h4>
              <p className="text-xs text-gray-500 mt-0.5">Superfast doorstep drop</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase">100% Quality Fresh</h4>
              <p className="text-xs text-gray-500 mt-0.5">Handpicked farm produce</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase">Free Delivery</h4>
              <p className="text-xs text-gray-500 mt-0.5">On orders above ₹{settings?.freeDeliveryThreshold || 299}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <span className="text-xl">💳</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase">Secure Payments</h4>
              <p className="text-xs text-gray-500 mt-0.5">Razorpay & Cash on Delivery</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <img
                src="/logo.png"
                alt="Alamuri Departmental Stores"
                className="h-10 w-auto object-contain bg-white rounded-lg p-0.5"
              />
              <span className="text-xl font-black text-gray-900 tracking-tight">
                {settings?.storeName || 'Alamuri Departmental Stores'}
              </span>
            </div>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed mb-4">
              Alamuri Departmental Stores — Your trusted neighborhood store for fresh groceries, vegetables, dairy, and household essentials delivered to your doorstep in minutes.
            </p>
            <div className="flex flex-col gap-1.5 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{settings?.storeAddress || 'Indiranagar, Bengaluru, Karnataka 560038'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{settings?.storePhone || '+91 98765 43210'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{settings?.storeEmail || 'support@alamuristores.com'}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
              Popular Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/categories/fruits-vegetables" className="hover:text-emerald-600 transition">
                  Fruits & Vegetables
                </Link>
              </li>
              <li>
                <Link to="/categories/dairy-bread-eggs" className="hover:text-emerald-600 transition">
                  Dairy, Bread & Eggs
                </Link>
              </li>
              <li>
                <Link to="/categories/snacks-munchies" className="hover:text-emerald-600 transition">
                  Snacks & Munchies
                </Link>
              </li>
              <li>
                <Link to="/categories/cold-drinks-juices" className="hover:text-emerald-600 transition">
                  Cold Drinks & Juices
                </Link>
              </li>
              <li>
                <Link to="/categories/atta-rice-dals" className="hover:text-emerald-600 transition">
                  Atta, Rice & Dals
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
              Store Timings & Info
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">
              Operating Hours:<br />
              <strong className="text-gray-800">{settings?.openingTime || '06:00'} - {settings?.closingTime || '23:00'}</strong> (Everyday)
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Delivery Radius: <strong className="text-gray-800">{settings?.maxDeliveryRadiusKm || 7.5} km</strong> around our store.
            </p>
            <div className="mt-4">
              <Link to="/admin/login" className="text-[11px] text-gray-400 hover:text-purple-600 transition">
                Store Owner / Admin Login →
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-3">
          <p>© {new Date().getFullYear()} {settings?.storeName || 'Alamuri Departmental Stores'}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for instant local delivery
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;