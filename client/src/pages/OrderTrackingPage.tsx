import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Phone, RefreshCw, XCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { orderService } from '../services';
import { Order } from '../types';
import { OrderTimeline, OrderStatusBadge } from '../components/tracking/OrderTimeline';
import EmptyState from '../components/common/EmptyState';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [reordering, setReordering] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await orderService.getOrderById(id || '');
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
      // Poll order status every 8 seconds for live delivery experience
      const timer = setInterval(fetchOrder, 8000);
      return () => clearInterval(timer);
    }
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setCancelling(true);
    try {
      const res = await orderService.cancelOrder(order.id, 'Customer requested cancellation');
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleReorder = async () => {
    if (!order) return;
    setReordering(true);
    try {
      const res = await orderService.reorder(order.id);
      if (res.data.success) {
        alert(`${res.data.data.addedCount} items added to your cart!`);
        navigate('/');
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to reorder');
    } finally {
      setReordering(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4" />
        <div className="h-64 bg-gray-200 rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <EmptyState
        icon="📦"
        title="Order Not Found"
        subtitle="We couldn't find the requested order details."
        actionText="View My Orders"
        actionHref="/orders"
      />
    );
  }

  const isCancellable = ['PLACED', 'CONFIRMED', 'PACKING'].includes(order.status);
  let parsedAddress: any = {};
  try {
    parsedAddress = JSON.parse(order.addressSnapshot);
  } catch (e) {}

  return (
    <div className="max-w-3xl mx-auto pb-16 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/orders" className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </Link>
        <button
          onClick={fetchOrder}
          className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Status Tracker Card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-gray-100">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Order #{order.orderNumber}
            </span>
            <h1 className="text-xl font-extrabold text-gray-900 mt-0.5">Live Delivery Tracking</h1>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Timeline */}
        <OrderTimeline currentStatus={order.status} history={order.statusHistory} />

        {/* Cancellation option */}
        {isCancellable && (
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="text-xs font-bold text-red-600 hover:text-red-700 transition"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          </div>
        )}
      </div>

      {/* Delivery Address & Order Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Address Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-3">
          <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
            Delivery Address
          </h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p className="font-bold text-gray-900">{parsedAddress.fullName}</p>
            <p>{parsedAddress.house}, {parsedAddress.street}</p>
            <p>{parsedAddress.area}, {parsedAddress.city} - {parsedAddress.pincode}</p>
            <p className="text-gray-400">Phone: {parsedAddress.phone}</p>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-3">
          <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
            Items Ordered ({order.items.length})
          </h3>
          <div className="divide-y divide-gray-50 text-xs space-y-1 max-h-36 overflow-y-auto pr-1">
            {order.items.map((item) => (
              <div key={item.id} className="py-1.5 flex items-center justify-between">
                <span className="truncate max-w-[180px]">
                  {item.quantity}x {item.productName}
                </span>
                <span className="font-bold text-gray-900">₹{item.total}</span>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-extrabold text-gray-900">
            <span>Total Paid</span>
            <span className="text-emerald-700">₹{order.total.toFixed(2)}</span>
          </div>

          <button
            onClick={handleReorder}
            disabled={reordering}
            className="w-full mt-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition"
          >
            {reordering ? 'Adding to cart...' : '🔁 Reorder All Items'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;