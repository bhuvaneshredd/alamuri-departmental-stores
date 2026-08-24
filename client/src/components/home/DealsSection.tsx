import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame } from 'lucide-react';
import { Product } from '../../types';
import ProductCard from '../common/ProductCard';

interface DealsSectionProps {
  products: Product[];
}

export const DealsSection: React.FC<DealsSectionProps> = ({ products }) => {
  if (products.length === 0) return null;

  return (
    <section className="py-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-tight">
              Best Deals & Steal Prices
            </h2>
            <p className="text-xs text-gray-500">Save big on daily essentials today</p>
          </div>
        </div>
        <Link
          to="/search?hasDiscount=true"
          className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition"
        >
          <span>See all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {products.slice(0, 6).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default DealsSection;