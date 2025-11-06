import React from 'react';

export const LogoIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 30V10C10 7.79086 11.7909 6 14 6H26C28.2091 6 30 7.79086 30 10V30C30 32.2091 28.2091 34 26 34H14C11.7909 34 10 32.2091 10 30Z" fill="#3b82f6"/>
        <path d="M15 25V15" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M20 25V20" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M25 25V18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
);

export const LogoFull: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`flex items-center space-x-2 ${className}`}>
        <LogoIcon />
        <span className="text-2xl font-bold text-white">IBRA-COMPTA</span>
    </div>
);
