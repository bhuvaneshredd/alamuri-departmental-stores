import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Clock,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowRight,
  MapPin,
  Flame,
  CheckCircle2,
  ChevronRight,
  Phone,
  Store,
} from 'lucide-react';
import { categoryService, productService } from '../services';
import { Category, Product } from '../types';
import { useStoreConfig } from '../contexts/StoreConfigContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings, isStoreOpen } = useStoreConfig();
  const [categories, setCategories] = useState<Category[]>([]);
  const [deals, setDeals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, dealsRes] = await Promise.all([
          categoryService.getCategories(),
          productService.getDeals(),
        ]);
        if (catRes.data.success) setCategories(catRes.data.data);
        if (dealsRes.data.success) setDeals(dealsRes.data.data.slice(0, 4));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      {/* 1. HERO GREETING SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-12 md:p-16 shadow-2xl border border-emerald-800/30 text-center">
        {/* Background glow effects */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          {/* Official Logo Display */}
          <div className="mb-6 p-3 bg-white rounded-3xl shadow-2xl shadow-emerald-500/20 transform hover:scale-105 transition-transform duration-300">
            <img
              src="/logo.png"
              alt="Alamuri Departmental Stores"
              className="h-20 sm:h-24 md:h-28 w-auto object-contain"
            />
          </div>

          {/* Micro pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black tracking-widest uppercase mb-4 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>10-15 MINUTE LOCAL DOORSTEP DELIVERY</span>
          </div>

          {/* Warm Welcome Greeting */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-4">
            Welcome to <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              Metro Retail Supermarket
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed mb-8">
            Your trusted neighborhood superstore. Farm fresh vegetables, fruits, daily dairy, breakfast essentials, kitchen staples, snacks, and household care delivered in minutes or ready for store pickup.
          </p>

          {/* Big ORDER NOW Action Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              to="/store"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-emerald-600/40 hover:shadow-emerald-500/60 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
            >
              <ShoppingBag className="w-6 h-6 animate-bounce" />
              <span>ORDER NOW</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/categories/fruits-vegetables"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm rounded-2xl backdrop-blur transition active:scale-95"
            >
              <span>Explore Categories</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Highlights Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 pt-8 border-t border-white/10 w-full text-xs font-semibold text-slate-300">
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>10-15 Min Drop</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Fresh Quality</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Free Drop &gt; ₹299</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-emerald-400 font-bold">💳</span>
              <span>UPI / COD Accepted</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR CATEGORIES QUICK ACCESS */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Browse Everyday Aisles
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">Pick items and get them delivered to your kitchen</p>
          </div>
          <Link
            to="/store"
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition"
          >
            <span>View All Aisles</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              to={`/categories/${cat.slug}`}
              className="group flex flex-col items-center text-center p-4 rounded-3xl bg-white border border-gray-100 hover:border-emerald-400 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-50/70 p-2 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                <img
                  src={cat.image || 'https://placehold.co/100x100?text=Category'}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-gray-800 group-hover:text-emerald-700 transition leading-tight line-clamp-2">
                {cat.name}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Shop Now →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. PROMOTIONAL OFFERS BANNER */}
      <section className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-black uppercase">
            <Flame className="w-3.5 h-3.5" />
            <span>SPECIAL WELCOME OFFER</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black">
            Get Flat 50% Off On Your First Order!
          </h3>
          <p className="text-xs sm:text-sm text-white/90 max-w-lg">
            Use promo code <span className="font-mono font-black bg-white text-orange-600 px-2 py-0.5 rounded-md">WELCOME50</span> at checkout on orders above ₹199.
          </p>
        </div>
        <Link
          to="/store"
          className="px-8 py-3.5 bg-white text-gray-900 font-black text-sm rounded-xl hover:bg-gray-100 shadow-lg active:scale-95 transition shrink-0"
        >
          Claim Offer & Order Now
        </Link>
      </section>

      {/* 4. WHY CHOOSE ALAMURI DEPARTMENTAL STORES */}
      <section className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-sm">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">
            Why Shop at Alamuri Stores?
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Bringing your neighborhood supermarket online with lightning-fast convenience
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-600/20">
              ⚡
            </div>
            <h4 className="text-sm font-extrabold text-gray-900">10-15 Min Superfast Drop</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Orders are picked and packed immediately at our store counter and dispatched instantly.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-600/20">
              🥬
            </div>
            <h4 className="text-sm font-extrabold text-gray-900">Farm Fresh & Handpicked</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Crisp seasonal vegetables, fruits, and dairy products sourced fresh daily from verified farms.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-purple-600/20">
              🏷️
            </div>
            <h4 className="text-sm font-extrabold text-gray-900">Best Neighborhood Prices</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Fair MRP discounts on daily staples, pulses, spices, packaged snacks, and personal care.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-amber-600/20">
              💳
            </div>
            <h4 className="text-sm font-extrabold text-gray-900">Easy Online UPI & COD</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Pay securely via Razorpay (UPI, Google Pay, Cards) or simply pay cash at your doorstep.
            </p>
          </div>
        </div>
      </section>

      {/* 5. STORE INFO & LOCATION CARD */}
      <section className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-3 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Store className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg sm:text-xl font-black">
              {settings?.storeName || 'Metro Retail Supermarket'} — Physical Superstore & Quick Fulfillment
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            📍 {settings?.storeAddress || 'Shop 4, Green Avenue, 100ft Road, Indiranagar, Bengaluru, Karnataka 560038'}
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400">
            <span>⏰ Hours: <strong>{settings?.openingTime || '06:00'} - {settings?.closingTime || '23:00'}</strong></span>
            <span>🛵 Delivery Zone: <strong>Within {settings?.maxDeliveryRadiusKm || 7.5} km radius</strong></span>
          </div>
        </div>

        <Link
          to="/store"
          className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-500/30 active:scale-95 transition shrink-0"
        >
          Start Your Order Now →
        </Link>
      </section>
    </div>
  );
};

export default LandingPage;