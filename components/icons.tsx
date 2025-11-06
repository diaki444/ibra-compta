import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement> & { className?: string };

// Duotone style: one path with fill="currentColor" (will be text-gray-400), another with a specific color like the brand blue.

export const DashboardIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <path fillRule="evenodd" clipRule="evenodd" d="M4 4H10V10H4V4ZM4 14H10V20H4V14Z" fill="#3b82f6"/>
    <path d="M14 4H20V10H14V4ZM14 14H20V20H14V14Z" fill="currentColor"/>
  </svg>
);

export const RevenueIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M12 4L12 20M12 4L16 8M12 4L8 8" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 16H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ExpenseIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
 <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M12 20L12 4M12 20L16 16M12 20L8 16" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 8H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const VatIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M8 17.3307L16 6.66931" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8.5 8C9.32843 8 10 7.32843 10 6.5C10 5.67157 9.32843 5 8.5 5C7.67157 5 7 5.67157 7 6.5C7 7.32843 7.67157 8 8.5 8Z" fill="#3b82f6"/>
    <path d="M15.5 19C16.3284 19 17 18.3284 17 17.5C17 16.6716 16.3284 16 15.5 16C14.6716 16 14 16.6716 14 17.5C14 18.3284 14.6716 19 15.5 19Z" fill="#3b82f6"/>
    <path d="M4 6L12 3L20 6V18L12 21L4 18V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const InvoiceIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M8 7H16" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 11H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 15H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3Z" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const ReportIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <rect x="4" y="12" width="4" height="8" rx="1" fill="#3b82f6"/>
    <rect x="10" y="8" width="4" height="12" rx="1" fill="currentColor"/>
    <rect x="16" y="4" width="4" height="16" rx="1" fill="#3b82f6"/>
  </svg>
);

export const AiIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M12 4L10.25 8.5L6 10L10.25 11.5L12 16L13.75 11.5L18 10L13.75 8.5L12 4Z" fill="#3b82f6" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 18L5 15L7 14L5 13L4 10L3 13L1 14L3 15L4 18Z" fill="currentColor"/>
    <path d="M20 18L19 15L17 14L19 13L20 10L21 13L23 14L21 15L20 18Z" fill="currentColor"/>
  </svg>
);

export const ProfileIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="12" cy="9" r="3" fill="#3b82f6"/>
    <path d="M18 19C18 15.6863 15.3137 13 12 13C8.68629 13 6 15.6863 6 19" fill="currentColor"/>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const LogoutIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M15 12H3" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 9L15 12L12 15" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 3H19C19.5523 3 20 3.44772 20 4V20C20 20.5523 19.5523 21 19 21H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const BellIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M18 10C18 6.68629 15.3137 4 12 4C8.68629 4 6 6.68629 6 10C6 14 4 16 4 16H20C20 16 18 14 18 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 20C13.1046 20 14 19.1046 14 18H10C10 19.1046 10.8954 20 12 20Z" fill="#3b82f6"/>
  </svg>
);

export const TrendingUpIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M4 17L10 11L14 15L20 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 9H20V14" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const TrendingDownIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M4 7L10 13L14 9L20 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 15H20V10" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ScaleIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 21V11C12 7.68629 9.31371 5 6 5C2.68629 5 0 7.68629 0 11" transform="translate(3 0)" fill="#3b82f6"/>
    <path d="M12 21V11C12 7.68629 14.6863 5 18 5C21.3137 5 24 7.68629 24 11" transform="translate(-3 0)" fill="currentColor"/>
  </svg>
);

export const ClockIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M12 7V12L15 15" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const PencilIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M4 20H8L18.5 9.5C19.3284 8.67157 19.3284 7.32843 18.5 6.5L17.5 5.5C16.6716 4.67157 15.3284 4.67157 14.5 5.5L4 16V20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.5 6.5L17.5 10.5" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M10 11V17" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 11V17" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M6 7H18V19C18 20.1046 17.1046 21 16 21H8C6.89543 21 6 20.1046 6 19V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 7V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const ArrowUpDownIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M12 4V20M12 4L8 8M12 4L16 8M12 20L8 16M12 20L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const FuelIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M8 5H16C16.5523 5 17 5.44772 17 6V16C17 18.2091 15.2091 20 13 20H11C8.79086 20 7 18.2091 7 16V6C7 5.44772 7.44772 5 8 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 5V3H14V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 15C12.5523 15 13 14.5523 13 14C13 13.4477 12.5523 13 12 13C11.4477 13 11 13.4477 11 14C11 14.5523 11.4477 15 12 15Z" fill="#3b82f6"/>
  </svg>
);

export const WrenchIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M13.2929 10.7071L10.5 13.5L12 15L15 12L13.2929 10.7071ZM13.2929 10.7071C14.0739 9.92607 15.3402 9.92607 16.1213 10.7071L17.5858 12.1716C18.3668 12.9526 18.3668 14.2189 17.5858 15L15 17.5858C14.2189 18.3668 12.9526 18.3668 12.1716 17.5858L10.7071 16.1213C9.92607 15.3402 9.92607 14.0739 10.7071 13.2929L13.2929 10.7071Z" fill="currentColor"/>
    <path d="M10.7071 13.2929L13.5 10.5L12 9L9 12L10.7071 13.2929Z" fill="#3b82f6"/>
    <path d="M4 6L10 12L12 10L6 4L4 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ShieldIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M12 21C12 21 4 16 4 10V5L12 3L20 5V10C20 16 12 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.5 11L11.5 13L14.5 10" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const PhoneIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
    <rect x="9" y="5" width="6" height="10" rx="1" fill="#3b82f6"/>
  </svg>
);

export const WifiIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M12 18H12.01" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
    <path d="M2 8.5C5.92381 4.57619 12.0762 4.57619 16 8.5" transform="translate(3, 0)" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M5 12C7.96222 9.03778 12.0378 9.03778 15 12" transform="translate(2, 0)" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const RestaurantIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M15 3V21" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 3V13C9 14.1046 8.10457 15 7 15C5.89543 15 5 14.1046 5 13V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M5 6H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const OfficeSuppliesIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M7 21C6.44772 21 6 20.5523 6 20V4C6 3.44772 6.44772 3 7 3H16V10C16 11.1046 16.8954 12 18 12H21V20C21 20.5523 20.5523 21 20 21H7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M16 3L21 10H18C16.8954 10 16 9.10457 16 8V3Z" fill="#3b82f6"/>
  </svg>
);

export const DotsIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="5" cy="12" r="2" fill="currentColor"/>
    <circle cx="12" cy="12" r="2" fill="#3b82f6"/>
    <circle cx="19" cy="12" r="2" fill="currentColor"/>
  </svg>
);

export const UsersIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M15 19C15 16.2386 12.7614 14 10 14C7.23858 14 5 16.2386 5 19" fill="currentColor"/>
    <circle cx="10" cy="9" r="3" fill="currentColor"/>
    <path d="M19 19C19 17.3431 17.6569 16 16 16C14.3431 16 13 17.3431 13 19" fill="#3b82f6"/>
    <circle cx="16" cy="11" r="2" fill="#3b82f6"/>
  </svg>
);

export const PiggyBankIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M4 14C4 12.8954 4.89543 12 6 12H7V10C7 8.89543 7.89543 8 9 8H13C13.5523 8 14 8.44772 14 9V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 11L18 11" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
    <path d="M4 14H19C20.6569 14 22 15.3431 22 17V17C22 18.6569 20.6569 20 19 20H4V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const ArchiveIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M12 15L12 9M12 9L15 12M12 9L9 12" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 7H20V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V7Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M5 3H19C19.5523 3 20 3.44772 20 4V7H4V4C4 3.44772 4.44772 3 5 3Z" stroke="currentColor" strokeWidth="2"/>
  </svg>
);
