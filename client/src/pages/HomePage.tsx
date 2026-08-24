import React, { useEffect, useState } from 'react';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { DealsSection } from '../components/home/DealsSection';
import { FeaturedSection } from '../components/home/FeaturedSection';
import { CategoryGridSkeleton, ProductCardSkeleton } from '../components/common/SkeletonLoader';
import { productService, categoryService } from '../services';
import { Category, Product } from '../types';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [deals, setDeals] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, featRes, dealsRes, recRes] = await Promise.all([
          categoryService.getCategories(),
          productService.getFeatured(),
          productService.getDeals(),
          productService.getRecommendations(),
        ]);

        if (catRes.data.success) setCategories(catRes.data.data);
        if (featRes.data.success) setFeaturedProducts(featRes.data.data);
        if (dealsRes.data.success) setDeals(dealsRes.data.data);
        if (recRes.data.success) setRecommendations(recRes.data.data);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Hero Carousel */}
      <HeroCarousel />

      {/* 2. Categories Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-tight">
              Explore Categories
            </h2>
            <p className="text-xs text-gray-500">Fresh vegetables, dairy, snacks, cold drinks & more</p>
          </div>
        </div>
        {loading ? (
          <CategoryGridSkeleton />
        ) : (
          <CategoryGrid categories={categories} />
        )}
      </section>

      {/* 3. Best Deals */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <DealsSection products={deals} />
      )}

      {/* 4. Popular Daily Essentials */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <FeaturedSection
          title="Daily Essentials"
          subtitle="Top household groceries delivered in 10 minutes"
          products={featuredProducts}
        />
      )}

      {/* 5. Recommended For You */}
      {!loading && recommendations.length > 0 && (
        <FeaturedSection
          title="Recommended For You"
          subtitle="Handpicked fresh items suited to your kitchen"
          products={recommendations}
        />
      )}
    </div>
  );
};

export default HomePage;