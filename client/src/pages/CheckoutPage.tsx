import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, AlertTriangle, Sparkles, CreditCard, Banknote } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { useStoreConfig } from '../contexts/StoreConfigContext';
import { addressService, orderService, paymentService, couponService } from '../services';
import { Address } from '../types';
import { AddressSelector } from '../components/checkout/AddressSelector';
import BillSummary from '../components/cart/BillSummary';
import EmptyState from '../components/common/EmptyState';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, grandTotal, pricing, clearCart, appliedCoupon, setAppliedCoupon, refreshCart } = useCart();
  const { isAuthenticated, setIsAuthModalOpen } = useAuth();
  const { selectedAddress, setSelectedAddress, isDeliverable, deliveryMessage, checkDeliveryLocation } = useLocation();
  const { settings, isStoreOpen } = useStoreConfig();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE_RAZORPAY' | 'CASH_ON_DELIVERY'>('ONLINE_RAZORPAY');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = async () => {
    try {
      const res = await addressService.getAddresses();
      if (res.data.success) {
        setAddresses(res.data.data);
        if (!selectedAddress && res.data.data.length > 0) {
          const defaultAddr = res.data.data.find((a) => a.isDefault) || res.data.data[0];
          setSelectedAddress(defaultAddr);
          checkDeliveryLocation(defaultAddr.latitude || undefined, defaultAddr.longitude || undefined, defaultAddr.id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      fetchAddresses();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon="🔒"
        title="Sign in to Checkout"
        subtitle="Please log in to your account to select delivery address and place your order."
        actionText="Sign In"
        onActionClick={() => setIsAuthModalOpen(true)}
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon="🛒"
        title="Your Cart is Empty"
        subtitle="Please add products to your cart before proceeding to checkout."
        actionText="Browse Groceries"
        actionHref="/"
      />
    );
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError('Please select a delivery address');
      return;
    }

    if (!isDeliverable) {
      setError('Your delivery address is outside our delivery zone.');
      return;
    }

    if (!isStoreOpen) {
      setError('Store is currently closed. Please order during operating hours.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      if (paymentMethod === 'CASH_ON_DELIVERY') {
        const res = await orderService.createOrder({
          addressId: selectedAddress.id,
          paymentMethod: 'CASH_ON_DELIVERY',
          deliveryNotes: deliveryNotes.trim() || undefined,
          couponCode: appliedCoupon || undefined,
        });

        if (res.data.success) {
          await clearCart();
          navigate(`/orders/${res.data.data.orderNumber}/confirmed`, {
            state: { order: res.data.data },
          });
        }
      } else {
        // Online Razorpay Flow
        // 1. Create order on backend
        const orderRes = await orderService.createOrder({
          addressId: selectedAddress.id,
          paymentMethod: 'ONLINE_RAZORPAY',
          deliveryNotes: deliveryNotes.trim() || undefined,
          couponCode: appliedCoupon || undefined,
        });

        if (!orderRes.data.success) {
          throw new Error(orderRes.data.message || 'Failed to initialize order');
        }

        const createdOrder = orderRes.data.data;

        // 2. Initiate Razorpay Order
        const payRes = await paymentService.initiatePayment(appliedCoupon || undefined);
        const { razorpayOrderId, isMock } = payRes.data.data;

        if (isMock || !(window as any).Razorpay) {
          // Development simulated Razorpay verification
          const verifyRes = await paymentService.verifyPayment({
            orderId: createdOrder.id,
            razorpayOrderId: razorpayOrderId || `order_mock_${Date.now()}`,
            razorpayPaymentId: `pay_mock_${Date.now()}`,
            razorpaySignature: 'mock_signature_valid',
          });

          await clearCart();
          navigate(`/orders/${createdOrder.orderNumber}/confirmed`, {
            state: { order: verifyRes.data.data || createdOrder },
          });
        } else {
          // Live Razorpay Checkout
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SAMPLE',
            amount: payRes.data.data.amount,
            currency: payRes.data.data.currency,
            name: settings?.storeName || 'Alamuri Departmental Stores',
            description: `Order #${createdOrder.orderNumber}`,
            order_id: razorpayOrderId,
            handler: async (response: any) => {
              try {
                const verifyRes = await paymentService.verifyPayment({
                  orderId: createdOrder.id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                });
                await clearCart();
                navigate(`/orders/${createdOrder.orderNumber}/confirmed`, {
                  state: { order: verifyRes.data.data || createdOrder },
                });
              } catch (verErr: any) {
                setError('Payment verification failed: ' + verErr.message);
              }
            },
            prefill: {
              name: selectedAddress.fullName,
              contact: selectedAddress.phone,
            },
            theme: {
              color: '#059669',
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Checkout & Order Placement</h1>
        <p className="text-xs text-gray-500 mt-1">Review your address, payment method & items</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Address & Payment Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Address Section */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <AddressSelector
              addresses={addresses}
              selectedAddressId={selectedAddress?.id || null}
              onSelectAddress={(addr) => {
                setSelectedAddress(addr);
                checkDeliveryLocation(addr.latitude || undefined, addr.longitude || undefined, addr.id);
              }}
              onAddressAdded={fetchAddresses}
            />

            {!isDeliverable && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                ⚠️ {deliveryMessage}
              </div>
            )}
          </div>

          {/* 2. Payment Method Section */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
              2. Select Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Online Payment */}
              <div
                onClick={() => setPaymentMethod('ONLINE_RAZORPAY')}
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                  paymentMethod === 'ONLINE_RAZORPAY'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Razorpay Online Payment</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">UPI, Debit/Credit Card, NetBanking</p>
                </div>
              </div>

              {/* Cash On Delivery */}
              <div
                onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Cash on Delivery (COD)</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Pay in cash when order arrives</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Delivery Instructions */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-2">
              3. Delivery Instructions (Optional)
            </h3>
            <textarea
              rows={2}
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="e.g. Leave at door, call when outside, don't ring the bell..."
              className="w-full p-3 bg-gray-50 border border-gray-200 focus:bg-white focus:border-emerald-500 rounded-xl text-xs sm:text-sm text-gray-900 outline-none transition"
            />
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order CTA */}
        <div className="space-y-6">
          <BillSummary pricing={pricing} subtotal={subtotal} />

          {/* Order Items Preview */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Items in Order ({items.length})
            </h4>
            <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.id} className="py-2 flex items-center justify-between text-xs">
                  <span className="truncate max-w-[170px] text-gray-700 font-medium">
                    {i.quantity}x {i.product.name}
                  </span>
                  <span className="font-bold text-gray-900">
                    ₹{(i.product.price * i.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={submitting || !selectedAddress || !isDeliverable}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition duration-200 active:scale-95 disabled:opacity-50"
          >
            <span>
              {submitting
                ? 'Placing Order...'
                : paymentMethod === 'ONLINE_RAZORPAY'
                ? `Pay ₹${grandTotal.toFixed(2)} & Place Order`
                : `Confirm Order (Pay ₹${grandTotal.toFixed(2)} on Delivery)`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;