import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import BillSummary from '../components/cart/BillSummary';
import EmptyState from '../components/common/EmptyState';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, itemCount, subtotal, grandTotal, pricing, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated, setIsAuthModalOpen } = useAuth();

  if (items.length === 0) {
    return (
      <EmptyState
        icon="🛒"
        title="Your Cart is Empty"
        subtitle="Add items from our catalog to receive fresh grocery delivery at your door."
        actionText="Browse Categories"
        actionHref="/"
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">Your Cart ({itemCount} items)</h1>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-600 hover:text-red-700 transition"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-4 shadow-sm"
            >
              <img
                src={item.product?.image || 'https://placehold.co/100x100?text=Product'}
                alt={item.product?.name}
                className="w-16 h-16 object-cover rounded-xl bg-gray-50 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                  {item.product?.name}
                </h3>
                <p className="text-xs text-gray-500">{item.product?.unit}</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-sm font-extrabold text-gray-900">₹{item.product?.price}</span>
                  {item.product?.mrp > item.product?.price && (
                    <span className="text-xs text-gray-400 line-through">₹{item.product?.mrp}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center bg-emerald-600 text-white rounded-xl shadow-sm text-xs font-bold">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="p-1.5 px-2 hover:bg-emerald-700 transition"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-2">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="p-1.5 px-2 hover:bg-emerald-700 transition"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <BillSummary pricing={pricing} subtotal={subtotal} />
          <button
            onClick={() => {
              if (!isAuthenticated) setIsAuthModalOpen(true);
              else navigate('/checkout');
            }}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;