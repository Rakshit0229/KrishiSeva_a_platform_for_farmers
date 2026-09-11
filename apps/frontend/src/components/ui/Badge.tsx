import React from 'react';

export type BadgeVariant = 'success' | 'pending' | 'process' | 'error' | 'gold' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  status?: string;
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, status, children, className = '' }) => {
  let resolvedVariant: BadgeVariant = variant || 'neutral';

  if (!variant && status) {
    const s = status.toLowerCase();
    if (['confirmed', 'credited', 'approved', 'resolved', 'done', 'online', 'active'].includes(s)) {
      resolvedVariant = 'success';
    } else if (['pending', 'waiting', 'in_review'].includes(s)) {
      resolvedVariant = 'pending';
    } else if (['processing', 'in_service', 'called'].includes(s)) {
      resolvedVariant = 'process';
    } else if (['cancelled', 'rejected', 'failed', 'skipped', 'escalated', 'no_show'].includes(s)) {
      resolvedVariant = 'error';
    } else if (['msp', 'gold', 'featured'].includes(s)) {
      resolvedVariant = 'gold';
    }
  }

  const variantClasses = {
    success: 'badge-success',
    pending: 'badge-pending',
    process: 'badge-process',
    error: 'badge-error',
    gold: 'badge-gold',
    neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  }[resolvedVariant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-semibold uppercase tracking-wider ${variantClasses} ${className}`}
    >
      {resolvedVariant === 'success' && <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>}
      {resolvedVariant === 'process' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>}
      {resolvedVariant === 'pending' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
      {resolvedVariant === 'error' && <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>}
      <span>{children || status}</span>
    </span>
  );
};
