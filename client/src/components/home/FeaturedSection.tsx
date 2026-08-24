import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import ProductCard from '../common/ProductCard';

interface FeaturedSectionProps {
  title?: string;
  subtitle?: string;
  products: Product[];
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({
  title = 'Popular Daily Essentials',
  subtitle = 'Most ordered fresh items this week',
  products,
}) => {
  if (products.length === 0) return null;

  return (
    <section className="py-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-tight">
              {title}
            </h2>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedSection;