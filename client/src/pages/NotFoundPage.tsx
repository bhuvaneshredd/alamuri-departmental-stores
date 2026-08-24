import React from 'react';
import EmptyState from '../components/common/EmptyState';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-16">
      <EmptyState
        icon="🚀"
        title="404 - Page Not Found"
        subtitle="The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."
        actionText="Return to Home"
        actionHref="/"
      />
    </div>
  );
};

export default NotFoundPage;