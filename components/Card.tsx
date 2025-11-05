
import React from 'react';

interface CardProps {
  title: string;
  value: string;
  children?: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, value, children, className = '' }) => {
  return (
    <div className={`bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 ${className}`}>
      <div className="flex items-center">
        {children && <div className="mr-4">{children}</div>}
        <div>
          <h4 className="text-sm font-medium text-gray-400">{title}</h4>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default Card;
