import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'primary' | 'gold' | 'white';
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '', color = 'primary' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }[size];

  const colorClasses = {
    primary: 'border-primary/20 border-t-primary',
    gold: 'border-gold/20 border-t-gold',
    white: 'border-white/25 border-t-white',
  }[color];

  return (
    <div
      role="status"
      aria-label="Loading..."
      className={`inline-block rounded-full animate-spin ${sizeClasses} ${colorClasses} ${className}`}
    />
  );
};
