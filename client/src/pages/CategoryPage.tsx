import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Filter, ArrowUpDown, ChevronRight } from 'lucide-react';
import { productService, categoryService } from '../services';
import { Category, Product } from '../types';
import ProductCard from '../components/common/ProductCard';
import { ProductCardSkeleton } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('popularity');
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        const res = await productService.getProducts({
          categorySlug: slug,
          sortBy,
          inStock: inStockOnly ? 'true' : undefined,
          limit: 50,
        });

        if (res.data.success) {
          setProducts(res.data.data);
        }

        const catRes = await categoryService.getBySlug(slug || '');
        if (catRes.data.success) {
          setCurrentCategory(catRes.data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategoryProducts();
    }
  }, [slug, sortBy, inStockOnly]);

  return (
    <div className="pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
        <Link to="/" className="hover:text-gray-900 transition">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-bold">{currentCategory?.name || 'Category'}</span>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sidebar: Categories Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-24">
            <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-3">
              All Categories
            </h3>
            <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isActive = cat.slug === slug;
                return (
                  <Link
                    key={cat.id}
                    to={`/categories/${cat.slug}`}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 font-bold shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {cat._count?.products !== undefined && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full ml-1">
                        {cat._count.products}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Main Content */}
        <main className="flex-1 min-w-0">
          {/* Header & Controls */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">
                {currentCategory?.name || 'Category Products'}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {currentCategory?.description || `Fresh and high quality products delivered in 10 minutes`}
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

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No products found in this category"
              subtitle="Try adjusting your filters or browse another category for daily groceries."
              actionText="View All Categories"
              actionHref="/"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CategoryPage;