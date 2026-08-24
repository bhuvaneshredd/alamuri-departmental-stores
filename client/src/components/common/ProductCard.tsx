import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Clock } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const quantityInCart = getItemQuantity(product.id);
  const isOutOfStock = product.stockQuantity <= 0 || !product.isAvailable;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addItem(product, 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, quantityInCart + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, quantityInCart - 1);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden p-3 sm:p-3.5">
      <Link to={`/products/${product.slug}`} className="block">
        {/* Top Badges: Discount & Delivery Time */}
        <div className="flex items-center justify-between gap-1 mb-2">
          {product.discount > 0 ? (
            <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
              {product.discount}% OFF
            </span>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-md">
            <Clock className="w-3 h-3 text-emerald-600" />
            <span>12 MINS</span>
          </div>
        </div>

        {/* Product Image */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center mb-2.5">
          <img
            src={product.image || 'https://placehold.co/300x300?text=Product'}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="min-h-[64px] flex flex-col justify-start">
          {product.brand && (
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider truncate">
              {product.brand}
            </span>
          )}
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-emerald-700 transition">
            {product.name}
          </h3>
          <span className="text-[11px] text-gray-500 font-medium mt-0.5">{product.unit}</span>
        </div>
      </Link>

      {/* Pricing & Add to Cart Button */}
      <div className="mt-3 pt-2.5 border-t border-gray-50 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-extrabold text-gray-900">
              ₹{product.price}
            </span>
            {product.mrp > product.price && (
              <span className="text-[11px] text-gray-400 line-through">
                ₹{product.mrp}
              </span>
            )}
          </div>
        </div>

        {/* Action Button: Add or Stepper */}
        {isOutOfStock ? (
          <button
            disabled
            className="px-3 py-1.5 bg-gray-100 text-gray-400 text-xs font-bold rounded-xl cursor-not-allowed"
          >
            Unavailable
          </button>
        ) : quantityInCart === 0 ? (
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-1 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-300 hover:border-emerald-600 rounded-xl text-xs font-bold transition duration-200 shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ADD</span>
          </button>
        ) : (
          <div className="flex items-center bg-emerald-600 text-white rounded-xl shadow-sm overflow-hidden text-xs font-bold">
            <button
              onClick={handleDecrement}
              className="p-1.5 sm:px-2 hover:bg-emerald-700 transition active:scale-90"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-2 min-w-[20px] text-center font-extrabold">
              {quantityInCart}
            </span>
            <button
              onClick={handleIncrement}
              className="p-1.5 sm:px-2 hover:bg-emerald-700 transition active:scale-90"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;