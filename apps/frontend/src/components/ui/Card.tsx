import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  featured?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, featured = false, className = '', ...props }) => {
  return (
    <div
      className={`card-farm ${featured ? 'featured' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
