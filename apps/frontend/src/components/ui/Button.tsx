import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'gold' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-medium',
    md: 'px-5 py-2.5 text-sm font-semibold',
    lg: 'px-7 py-3.5 text-base font-semibold',
  }[size];

  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg disabled:opacity-50',
    secondary: 'bg-surface-2 hover:bg-farmborder text-text-primary dark:bg-gray-800 dark:text-white',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    gold: 'bg-gold hover:bg-gold-light text-text-primary font-bold shadow-md hover:shadow-gold-glow',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'bg-transparent hover:bg-surface-2 text-text-primary dark:text-white',
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-pill transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:pointer-events-none disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
