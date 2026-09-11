import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefixText?: string;
  suffixText?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefixText, suffixText, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
            {label}
          </label>
        )}
        <div className="relative flex items-center rounded-md">
          {prefixText && (
            <span className="inline-flex items-center px-3 py-2.5 rounded-l-md border border-r-0 border-farmborder bg-surface-2 text-sm font-semibold text-text-muted">
              {prefixText}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`input-farm ${prefixText ? 'rounded-l-none' : ''} ${suffixText ? 'rounded-r-none' : ''} ${
              error ? 'error' : ''
            } ${className}`}
            {...props}
          />
          {suffixText && (
            <span className="inline-flex items-center px-3 py-2.5 rounded-r-md border border-l-0 border-farmborder bg-surface-2 text-sm font-semibold text-text-muted">
              {suffixText}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-text-muted">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
