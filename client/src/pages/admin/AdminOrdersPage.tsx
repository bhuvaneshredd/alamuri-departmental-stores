import React, { useEffect, useState } from 'react';
import { Search, Filter, Clock, Eye, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { adminService } from '../../services';
import { Order, OrderStatus } from '../../types';
import { OrderStatusBadge } from '../../components/tracking/OrderTimeline';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminService.getOrders({
        status: statusFilter || undefined,
        search: search || undefined,
      });
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
    fetchOrders();
  }, [statusFilter, search]);

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await adminService.updateOrderStatus(orderId, nextStatus);
      if (res.data.success) {
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(res.data.data);
        }
        fetchOrders();
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Helper for determining next transition buttons
  const getNextAction = (status: OrderStatus) => {
    switch (status) {
      case 'PLACED':
        return { label: 'Accept & Confirm', next: 'CONFIRMED' as OrderStatus, color: 'bg-indigo-600' };
      case 'CONFIRMED':
        return { label: 'Start Packing', next: 'PACKING' as OrderStatus, color: 'bg-amber-600' };
      case 'PACKING':
        return { label: 'Mark Ready', next: 'READY_FOR_DELIVERY' as OrderStatus, color: 'bg-cyan-600' };
      case 'READY_FOR_DELIVERY':
        return { label: 'Dispatch (Out for Delivery)', next: 'OUT_FOR_DELIVERY' as OrderStatus, color: 'bg-orange-600' };
      case 'OUT_FOR_DELIVERY':
        return { label: 'Mark Delivered', next: 'DELIVERED' as OrderStatus, color: 'bg-emerald-600' };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Order Management</h1>
        <p className="text-xs text-gray-500 mt-1">Accept incoming orders, update packing & dispatch statuses</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, customer name, phone..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 outline-none"
        >
          <option value="">All Statuses</option>
          <option value="PLACED">Placed</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PACKING">Packing</option>
          <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => {
                const action = getNextAction(order.status);
                return (
                  <tr key={order.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3 px-4 font-extrabold text-gray-900">{order.orderNumber}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-gray-900">{order.user?.name || 'Customer'}</p>
                      <p className="text-[10px] text-gray-400">{order.user?.phone || order.user?.email}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-medium">{order.items?.length || 0} items</td>
                    <td className="py-3 px-4 font-black text-gray-900">₹{order.total.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.paymentStatus === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'COD' : 'Paid Online'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {action && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, action.next)}
                            disabled={updatingStatus}
                            className={`px-3 py-1.5 ${action.color} text-white font-bold rounded-xl text-[11px] shadow-sm transition active:scale-95`}
                          >
                            {action.label}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setInspectModalOpen(true);
                          }}
                          className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
                          title="Inspect order"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Order Modal */}
      {inspectModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 animate-slide-up space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-base font-extrabold text-gray-900">
                  Order Details #{selectedOrder.orderNumber}
                </h2>
                <p className="text-xs text-gray-400">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <OrderStatusBadge status={selectedOrder.status} />
            </div>

            {/* Customer & Address */}
            <div className="bg-gray-50 rounded-2xl p-4 text-xs space-y-1">
              <p className="font-bold text-gray-900">Delivery Address:</p>
              <p className="text-gray-600">{selectedOrder.addressSnapshot}</p>
              {selectedOrder.deliveryNotes && (
                <p className="text-amber-700 font-medium mt-1">
                  Note: {selectedOrder.deliveryNotes}
                </p>
              )}
            </div>

            {/* Items */}
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                Order Items ({selectedOrder.items?.length})
              </h4>
              <div className="divide-y divide-gray-100 text-xs max-h-48 overflow-y-auto pr-1">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold">{item.quantity}x</span> {item.productName} ({item.unit})
                    </div>
                    <span className="font-extrabold">₹{item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-gray-100 flex justify-between text-sm font-black text-gray-900">
              <span>Grand Total:</span>
              <span className="text-emerald-700">₹{selectedOrder.total.toFixed(2)}</span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              {['PLACED', 'CONFIRMED', 'PACKING'].includes(selectedOrder.status) && (
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                  className="text-xs font-bold text-red-600 hover:text-red-700"
                >
                  Cancel Order & Restore Stock
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => setInspectModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 font-bold text-xs rounded-xl hover:bg-gray-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;