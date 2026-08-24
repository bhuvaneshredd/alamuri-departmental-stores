import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../types';

interface CategoryGridProps {
  categories: Category[];
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/categories/${category.slug}`}
          className="group flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all duration-200"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-50/70 p-2 flex items-center justify-center mb-2 overflow-hidden group-hover:scale-105 transition-transform duration-300">
            <img
              src={category.image || 'https://placehold.co/100x100?text=Category'}
              alt={category.name}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <span className="text-xs font-bold text-gray-800 group-hover:text-emerald-700 transition leading-tight line-clamp-2">
            {category.name}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default CategoryGrid;