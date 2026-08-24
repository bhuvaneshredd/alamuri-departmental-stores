import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  IndianRupee,
  Users,
  Package,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { adminService } from '../../services';
import { OrderStatusBadge } from '../../components/tracking/OrderTimeline';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await adminService.getDashboardStats();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-3xl border border-gray-100" />
          ))}
        </div>
        <div className="h-72 bg-white rounded-3xl border border-gray-100" />
      </div>
    );
  }

  const metrics = data?.metrics || {
    todayOrders: 0,
    todayRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    lowStockCount: 0,
    pendingOrders: 0,
  };

  const salesTrend = data?.salesTrend || [];
  const recentOrders = data?.recentOrders || [];

  const kpis = [
    { label: "Today's Orders", value: metrics.todayOrders, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: "Today's Revenue", value: `₹${metrics.todayRevenue.toFixed(0)}`, icon: IndianRupee, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { label: 'Pending Orders', value: metrics.pendingOrders, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { label: 'Total Customers', value: metrics.totalCustomers, icon: Users, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { label: 'Total Products', value: metrics.totalProducts, icon: Package, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { label: 'Low Stock Alerts', value: metrics.lowStockCount, icon: AlertTriangle, color: 'text-red-600 bg-red-50 border-red-200' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Store Operations Dashboard
        </h1>
        <p className="text-xs text-gray-500 mt-1">Real-time orders, revenue trends, and inventory health</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-400">{kpi.label}</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <span className="text-xl font-black text-gray-900">{kpi.value}</span>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Revenue Trend */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                Sales Revenue Trend (Past 7 Days)
              </h3>
              <p className="text-xs text-gray-400">Daily store order totals</p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`₹${val}`, 'Revenue']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#059669"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Summary Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-4">
            Quick Operations
          </h3>
          <div className="space-y-3 text-xs">
            <Link
              to="/admin/orders"
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-blue-50 text-blue-900 hover:bg-blue-100 transition font-bold"
            >
              <span>Manage Incoming Orders</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/admin/products"
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-50 text-emerald-900 hover:bg-emerald-100 transition font-bold"
            >
              <span>Add / Edit Store Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/admin/inventory"
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-50 text-amber-900 hover:bg-amber-100 transition font-bold"
            >
              <span>Restock Low Inventory</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/admin/settings"
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-purple-50 text-purple-900 hover:bg-purple-100 transition font-bold"
            >
              <span>Store Timings & Delivery Radius</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
            Recent Orders
          </h3>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>View all orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px]">
                <th className="pb-3">Order Number</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Items</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50/60 transition">
                  <td className="py-3 font-bold text-gray-900">{order.orderNumber}</td>
                  <td className="py-3 text-gray-600">{order.user?.name || 'Customer'}</td>
                  <td className="py-3 text-gray-500">{order.items?.length || 0} items</td>
                  <td className="py-3 font-extrabold text-gray-900">₹{order.total.toFixed(2)}</td>
                  <td className="py-3 text-[11px] font-semibold text-gray-600">
                    {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'COD' : 'Razorpay'}
                  </td>
                  <td className="py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      to="/admin/orders"
                      className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg font-bold text-[11px] transition"
                    >
                      Inspect →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;