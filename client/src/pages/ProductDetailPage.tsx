import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  ChevronRight,
  Share2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { productService } from '../services';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/common/ProductCard';
import EmptyState from '../components/common/EmptyState';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem, updateQuantity, getItemQuantity, setIsDrawerOpen } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productService.getBySlug(slug || '');
        if (res.data.success && res.data.data) {
          setProduct(res.data.data.product);
          setRelatedProducts(res.data.data.relatedProducts || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-3xl border border-gray-100">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-10 bg-gray-200 rounded w-1/2 mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <EmptyState
        icon="🔍"
        title="Product Not Found"
        subtitle="The product you are looking for may have been moved or is currently unavailable."
        actionText="Back to Store"
        actionHref="/"
      />
    );
  }

  const quantityInCart = getItemQuantity(product.id);
  const isOutOfStock = product.stockQuantity <= 0 || !product.isAvailable;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBuyNow = () => {
    if (!isOutOfStock) {
      if (quantityInCart === 0) {
        addItem(product, 1);
      }
      setIsDrawerOpen(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <Link to="/" className="hover:text-gray-900 transition">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        {product.category && (
          <>
            <Link to={`/categories/${product.category.slug}`} className="hover:text-gray-900 transition">
              {product.category.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
        <span className="text-gray-900 font-bold truncate">{product.name}</span>
      </div>

      {/* Main Product Card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Product Image Column */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
            <img
              src={product.image || 'https://placehold.co/600x600?text=Product'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider shadow-md">
                {product.discount}% OFF
              </span>
            )}
          </div>

          {/* Product Info Column */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              {/* Brand & Share */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                  {product.brand || 'Alamuri Essentials'}
                </span>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition"
                  title="Share link"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-[11px]">{copied ? 'Copied!' : 'Share'}</span>
                </button>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Unit/Weight */}
              <div className="mt-1.5 inline-block px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg">
                Net Qty: {product.unit}
              </div>

              {/* Price Block */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-gray-900">
                  ₹{product.price}
                </span>
                {product.mrp > product.price && (
                  <div className="flex items-center gap-2">
                    <span className="text-base text-gray-400 line-through">
                      MRP ₹{product.mrp}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">
                      Save ₹{product.mrp - product.price}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">(Inclusive of all taxes)</p>

              {/* Delivery Assurance */}
              <div className="mt-5 p-3.5 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-emerald-950 uppercase">
                    Delivery in 10-15 Minutes
                  </h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Order now & our delivery partner will drop it fresh at your door.
                  </p>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                    Product Description
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* Cart & Buy Buttons */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-3">
              {isOutOfStock ? (
                <button
                  disabled
                  className="w-full py-3.5 bg-gray-100 text-gray-400 font-bold text-sm rounded-2xl cursor-not-allowed"
                >
                  Currently Unavailable
                </button>
              ) : quantityInCart === 0 ? (
                <>
                  <button
                    onClick={() => addItem(product, 1)}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-extrabold text-sm rounded-2xl transition active:scale-95"
                  >
                    Buy Now
                  </button>
                </>
              ) : (
                <div className="w-full flex items-center justify-between gap-4">
                  <div className="flex items-center bg-emerald-600 text-white rounded-2xl shadow-md p-1 font-bold text-sm">
                    <button
                      onClick={() => updateQuantity(product.id, quantityInCart - 1)}
                      className="p-2 px-3 hover:bg-emerald-700 rounded-xl transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-base font-extrabold">{quantityInCart}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantityInCart + 1)}
                      className="p-2 px-3 hover:bg-emerald-700 rounded-xl transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="flex-1 py-3.5 bg-gray-900 hover:bg-black text-white font-bold text-xs sm:text-sm rounded-2xl transition text-center"
                  >
                    View in Cart →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-extrabold text-gray-900">Similar & Related Items</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;