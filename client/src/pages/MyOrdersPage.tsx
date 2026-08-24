import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Clock, ArrowRight, RefreshCw, ShoppingBag } from 'lucide-react';
import { orderService } from '../services';
import { Order } from '../types';
import { OrderStatusBadge } from '../components/tracking/OrderTimeline';
import { useAuth } from '../contexts/AuthContext';
import EmptyState from '../components/common/EmptyState';

export const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthModalOpen } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await orderService.getOrders();
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon="🔒"
        title="Sign in to View Orders"
        subtitle="Log in to track current delivery and view past grocery order receipts."
        actionText="Sign In"
        onActionClick={() => setIsAuthModalOpen(true)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Orders</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track live deliveries and reorder favorites</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 bg-gray-200 rounded-3xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon="🛍️"
          title="No Orders Yet"
          subtitle="Looks like you haven't ordered anything yet. Fresh groceries are waiting for you!"
          actionText="Start Shopping"
          actionHref="/"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                <div>
                  <span className="text-xs font-bold text-gray-900">Order #{order.orderNumber}</span>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              {/* Items List */}
              <div className="flex flex-wrap gap-2">
                {order.items.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-700 rounded-xl text-xs font-medium"
                  >
                    <span>{item.quantity}x</span>
                    <span className="truncate max-w-[150px]">{item.productName}</span>
                  </span>
                ))}
              </div>

              {/* Bottom Details & CTA */}
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400">Total:</span>
                  <span className="text-base font-extrabold text-gray-900 ml-1.5">
                    ₹{order.total.toFixed(2)}
                  </span>
                </div>

                <Link
                  to={`/orders/${order.orderNumber}/track`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <span>Track / View Receipt</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;