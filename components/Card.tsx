import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-md transition-all duration-200 ease-in-out hover:shadow-lg hover:scale-[1.02] ${className}`}>
      {children}
    </div>
  );
};

export default Card;