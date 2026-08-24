import React from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '🛒',
  title,
  subtitle,
  actionText = 'Start Shopping',
  actionHref = '/',
  onActionClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-4xl mb-4 shadow-sm">
        {icon}
      </div>
      <h3 className="text-base sm:text-lg font-extrabold text-gray-900">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-500 max-w-sm mt-1 mb-6 leading-relaxed">
        {subtitle}
      </p>
      {actionHref && !onActionClick ? (
        <Link
          to={actionHref}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-95"
        >
          {actionText}
        </Link>
      ) : onActionClick ? (
        <button
          onClick={onActionClick}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-95"
        >
          {actionText}
        </button>
      ) : null}
    </div>
  );
};

export default EmptyState;