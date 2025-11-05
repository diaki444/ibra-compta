
import React from 'react';
import { Page } from '../types';
import { DashboardIcon, RevenueIcon, ExpenseIcon, VatIcon, InvoiceIcon, ReportIcon, AiIcon, LogoutIcon } from './icons';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: DashboardIcon },
  { id: 'revenues', label: 'Revenus', icon: RevenueIcon },
  { id: 'expenses', label: 'Dépenses', icon: ExpenseIcon },
  { id: 'vat', label: 'TVA', icon: VatIcon },
  { id: 'invoicing', label: 'Facturation', icon: InvoiceIcon },
  { id: 'reports', label: 'Rapports', icon: ReportIcon },
  { id: 'ai-assistant', label: 'Assistant IA', icon: AiIcon },
];

const Sidebar: React.FC<Omit<LayoutProps, 'children'>> = ({ currentPage, setCurrentPage }) => (
    <aside className="w-16 md:w-64 bg-gray-900 text-gray-300 flex flex-col border-r border-gray-700">
        <div className="flex items-center justify-center md:justify-start md:pl-6 h-20 border-b border-gray-700">
            <span className="text-white font-bold text-2xl hidden md:block">IBRA-COMPTA</span>
            <span className="text-white font-bold text-2xl md:hidden">IC</span>
        </div>
        <nav className="flex-grow pt-4">
            {navItems.map(item => (
                <a
                    key={item.id}
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(item.id as Page);
                    }}
                    className={`flex items-center py-3 px-6 my-1 transition-colors duration-200 ${currentPage === item.id ? 'bg-red-600 text-white' : 'hover:bg-gray-800'}`}
                >
                    <item.icon />
                    <span className="mx-4 font-medium hidden md:block">{item.label}</span>
                </a>
            ))}
        </nav>
        <div className="border-t border-gray-700">
             <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="flex items-center py-3 px-6 my-1 transition-colors duration-200 hover:bg-gray-800"
            >
                <LogoutIcon />
                <span className="mx-4 font-medium hidden md:block">Déconnexion</span>
            </a>
        </div>
    </aside>
);


const Layout: React.FC<LayoutProps> = ({ children, currentPage, setCurrentPage }) => {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center h-20 px-6 sm:px-10 bg-gray-900 border-b border-gray-700">
            <h1 className="text-2xl font-semibold capitalize">{currentPage.replace('-', ' ')}</h1>
        </header>
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-6 sm:p-10">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
