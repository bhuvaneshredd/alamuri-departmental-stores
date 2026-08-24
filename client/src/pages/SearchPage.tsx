import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ArrowUpDown, SlidersHorizontal } from 'lucide-react';
import { productService } from '../services';
import { Product } from '../types';
import ProductCard from '../components/common/ProductCard';
import { ProductCardSkeleton } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const hasDiscountParam = searchParams.get('hasDiscount') === 'true';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('popularity');
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await productService.getProducts({
          search: query || undefined,
          hasDiscount: hasDiscountParam ? 'true' : undefined,
          inStock: inStockOnly ? 'true' : undefined,
          sortBy,
          limit: 50,
        });

        if (res.data.success) {
          setProducts(res.data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, hasDiscountParam, inStockOnly, sortBy]);

  return (
    <div className="pb-16">
      {/* Header & Controls */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            {query ? `Search Results for "${query}"` : hasDiscountParam ? 'Discounted Deals & Offers' : 'Browse All Products'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Found {products.length} matching products
          </p>
        </div>

        {/* Sort & Filter Controls */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <span>In Stock Only</span>
          </label>

          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-semibold text-gray-800 outline-none cursor-pointer"
            >
              <option value="popularity">Popularity</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
              <option value="newest">Newly Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon="🔍"
          title={`No products found for "${query}"`}
          subtitle="Check for typos or try searching with generic terms like 'milk', 'chips', 'bread', 'oil'."
          actionText="Browse Categories"
          actionHref="/"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;