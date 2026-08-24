import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3.5 animate-pulse flex flex-col justify-between">
      <div>
        <div className="w-full aspect-square bg-gray-200 rounded-xl mb-3" />
        <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-full mb-1" />
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/4" />
      </div>
      <div className="mt-4 pt-2 border-t border-gray-50 flex items-center justify-between">
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="h-8 bg-gray-200 rounded-xl w-16" />
      </div>
    </div>
  );
};

export const CategoryGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center p-3 bg-white rounded-2xl border border-gray-100">
          <div className="w-14 h-14 bg-gray-200 rounded-full mb-2" />
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
      ))}
    </div>
  );
};