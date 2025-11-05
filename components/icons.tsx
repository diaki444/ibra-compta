
import React from 'react';

const iconProps = {
  className: "w-6 h-6",
  strokeWidth: 1.5,
  stroke: "currentColor",
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const DashboardIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M4 4h6v8h-6z" />
    <path d="M4 16h6v4h-6z" />
    <path d="M14 12h6v8h-6z" />
    <path d="M14 4h6v4h-6z" />
  </svg>
);

export const RevenueIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M18 15h.01" />
    <path d="M15 18h.01" />
    <path d="M15 15h.01" />
    <path d="M12.043 14.396l-2.053 -2.053l4.335 -4.332a1.2 1.2 0 0 1 1.697 0l2.303 2.303a1.2 1.2 0 0 1 0 1.697l-4.332 4.335" />
    <path d="M11.996 11.996l-5.652 5.652a2.828 2.828 0 1 1 -3.996 -3.996l5.652 -5.652" />
  </svg>
);

export const ExpenseIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M9 14l6 -6" />
    <path d="M9 5h.01" />
    <path d="M15 19h.01" />
    <path d="M5 9.5l4 -4.5l4 4.5" />
    <path d="M15 14.5l4 -4.5l4 4.5" />
  </svg>
);

export const VatIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M9 14.274a3 3 0 1 0 6 0v-4.548a3 3 0 0 0 -6 0v4.548z" />
    <path d="M12 21v-4.5" />
    <path d="M8 16h8" />
    <path d="M8 5h8" />
    <path d="M12 3v2" />
  </svg>
);

export const InvoiceIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
    <path d="M9 7l1 0" />
    <path d="M9 13l6 0" />
    <path d="M9 17l6 0" />
  </svg>
);

export const ReportIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M8 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h5.697" />
    <path d="M18 14v4h4" />
    <path d="M18 11h-7a2 2 0 0 0 -2 2v5a2 2 0 0 0 2 2h2" />
    <path d="M12.5 10.5l1.5 -1.5" />
    <path d="M15 4l3 3l-3 3" />
  </svg>
);

export const AiIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M8 16v-4.8c0 -1.054 .524 -2.06 1.387 -2.652l1.226 -.817a2.142 2.142 0 0 1 2.774 0l1.226 .817c.863 .592 1.387 1.598 1.387 2.652v4.8" />
    <path d="M12 21v-3" />
    <path d="M9 18h6" />
    <path d="M10 8v-1h4v1" />
    <path d="M12 2v1" />
  </svg>
);

export const LogoutIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
    <path d="M9 12h12l-3 -3" />
    <path d="M18 15l3 -3" />
  </svg>
);
