import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'card';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rectangular' }) => {
  const baseClasses = 'animate-pulse bg-surface-2 dark:bg-gray-800';

  if (variant === 'circular') {
    return <div className={`${baseClasses} rounded-full ${className}`} />;
  }

  if (variant === 'text') {
    return <div className={`${baseClasses} h-4 rounded ${className}`} />;
  }

  if (variant === 'card') {
    return (
      <div className={`p-6 bg-white dark:bg-gray-900 rounded-xl border border-farmborder/60 ${className}`}>
        <div className={`${baseClasses} h-6 w-3/4 rounded mb-4`} />
        <div className={`${baseClasses} h-4 w-1/2 rounded mb-3`} />
        <div className={`${baseClasses} h-4 w-full rounded mb-2`} />
        <div className={`${baseClasses} h-4 w-5/6 rounded`} />
      </div>
    );
  }

  return <div className={`${baseClasses} rounded-md ${className}`} />;
};
