import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useStoreConfig } from '../../contexts/StoreConfigContext';
import { couponService } from '../../services';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    itemCount,
    subtotal,
    grandTotal,
    pricing,
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    removeItem,
    clearCart,
    appliedCoupon,
    setAppliedCoupon,
  } = useCart();

  const { isAuthenticated, setIsAuthModalOpen } = useAuth();
  const { settings } = useStoreConfig();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  if (!isDrawerOpen) return null;

  const freeDeliveryThreshold = pricing?.freeDeliveryThreshold || settings?.freeDeliveryThreshold || 299;
  const amountNeeded = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponError(null);
    setCouponSuccess(null);
    setApplyingCoupon(true);

    try {
      const res = await couponService.validateCoupon(couponInput.trim(), subtotal);
      if (res.data.success) {
        setAppliedCoupon(res.data.data.code);
        setCouponSuccess(`Coupon ${res.data.data.code} applied! Saved ₹${res.data.data.discountAmount}`);
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleProceedToCheckout = () => {
    setIsDrawerOpen(false);
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* 1. Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                🛒
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-900 leading-tight">My Cart</h2>
                <span className="text-xs text-gray-500 font-medium">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="p-1.5 text-gray-400 hover:text-red-600 text-xs font-semibold flex items-center gap-1 rounded-lg hover:bg-gray-50 transition"
                  title="Clear Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. Scrollable Body */}
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-4xl mb-4">
                🛍️
              </div>
              <h3 className="text-base font-bold text-gray-900">Your cart is empty</h3>
              <p className="text-xs text-gray-500 max-w-xs mt-1 mb-6">
                Add fresh fruits, veggies, milk, snacks and more to get them delivered in 10 minutes!
              </p>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-95"
              >
                Browse Daily Essentials
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Free delivery progress bar */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900 mb-1.5">
                  <span>
                    {amountNeeded === 0
                      ? '🎉 You have unlocked FREE delivery!'
                      : `Add ₹${amountNeeded.toFixed(0)} more for FREE delivery`}
                  </span>
                  <span className="text-[10px] text-emerald-700">₹{freeDeliveryThreshold}</span>
                </div>
                <div className="w-full h-2 bg-emerald-200/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                    style={{ width: `${freeDeliveryProgress}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-100 bg-white rounded-2xl border border-gray-100 p-2">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3 first:pt-1 last:pb-1">
                    <img
                      src={item.product?.image || 'https://placehold.co/100x100?text=Product'}
                      alt={item.product?.name}
                      className="w-14 h-14 object-cover rounded-xl bg-gray-50 border border-gray-100 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        {item.product?.name}
                      </h4>
                      <p className="text-[11px] text-gray-500">{item.product?.unit}</p>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-xs font-extrabold text-gray-900">
                          ₹{item.product?.price}
                        </span>
                        {item.product?.mrp > item.product?.price && (
                          <span className="text-[10px] text-gray-400 line-through">
                            ₹{item.product?.mrp}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center bg-emerald-600 text-white rounded-xl shadow-sm text-xs font-bold shrink-0">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1.5 hover:bg-emerald-700 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 min-w-[20px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1.5 hover:bg-emerald-700 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter Coupon Code (e.g. WELCOME50)"
                      className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 focus:border-emerald-500 rounded-xl text-xs uppercase font-bold text-gray-900 outline-none"
                    />
                    <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  </div>
                  <button
                    type="submit"
                    disabled={applyingCoupon || !couponInput.trim()}
                    className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition disabled:opacity-40"
                  >
                    {applyingCoupon ? '...' : 'Apply'}
                  </button>
                </form>

                {couponSuccess && (
                  <p className="text-[11px] font-bold text-emerald-600 mt-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {couponSuccess}
                  </p>
                )}
                {couponError && (
                  <p className="text-[11px] font-semibold text-red-600 mt-2">
                    {couponError}
                  </p>
                )}
              </div>

              {/* Bill Details Breakdown */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2 text-xs">
                <h4 className="font-extrabold text-gray-900 uppercase tracking-wider text-[11px] mb-2">
                  Bill Summary
                </h4>

                <div className="flex justify-between text-gray-600">
                  <span>Item Subtotal</span>
                  <span className="font-bold text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>

                {pricing?.totalProductSavings ? (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Product Savings</span>
                    <span>-₹{pricing.totalProductSavings.toFixed(2)}</span>
                  </div>
                ) : null}

                {pricing?.couponDiscount ? (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon ({pricing.couponCode})</span>
                    <span>-₹{pricing.couponDiscount.toFixed(2)}</span>
                  </div>
                ) : null}

                <div className="flex justify-between text-gray-600">
                  <span>Delivery Partner Fee</span>
                  <span>
                    {pricing?.deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      `₹${(pricing?.deliveryFee || 25).toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Taxes & Charges (5%)</span>
                  <span>₹{(pricing?.tax || 0).toFixed(2)}</span>
                </div>

                <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-black text-gray-900">
                  <span>To Pay</span>
                  <span className="text-emerald-700">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. Bottom Checkout Trigger */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-white shadow-lg">
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-between transition duration-200 active:scale-95"
              >
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-xs opacity-90">{itemCount} items</span>
                  <span className="text-base font-black">₹{grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;