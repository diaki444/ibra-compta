import React from 'react';
import { Page } from '../types';
import { 
    DashboardIcon, 
    RevenueIcon, 
    ExpenseIcon, 
    VatIcon, 
    InvoiceIcon, 
    ReportIcon, 
    AiIcon,
    ProfileIcon,
    LogoutIcon 
} from './icons';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onLogout: () => void;
  profileName: string;
}

const navItems: { page: Page; label: string; icon: React.FC }[] = [
    { page: 'dashboard', label: 'Tableau de bord', icon: DashboardIcon },
    { page: 'revenues', label: 'Revenus', icon: RevenueIcon },
    { page: 'expenses', label: 'Dépenses', icon: ExpenseIcon },
    { page: 'vat', label: 'TVA', icon: VatIcon },
    { page: 'invoicing', label: 'Facturation', icon: InvoiceIcon },
    { page: 'reports', label: 'Rapports', icon: ReportIcon },
    { page: 'ai-assistant', label: 'Assistant IA', icon: AiIcon },
];

const Layout: React.FC<LayoutProps> = ({ children, currentPage, setCurrentPage, onLogout, profileName }) => {
  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
          <h1 className="text-xl font-bold text-red-500">IBRA-COMPTA</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map(item => (
            <button
              key={item.page}
              onClick={() => setCurrentPage(item.page)}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                currentPage === item.page
                  ? 'bg-red-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon />
              <span className="ml-3">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-700">
           <button
              onClick={() => setCurrentPage('profile')}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md mb-2 transition-colors duration-200 ${
                currentPage === 'profile'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <ProfileIcon />
              <span className="ml-3">{profileName}</span>
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
            >
              <LogoutIcon />
              <span className="ml-3">Déconnexion</span>
            </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
           <h2 className="text-xl font-semibold capitalize">{currentPage.replace('-', ' ')}</h2>
           {/* Header content like search bar or notifications could go here */}
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
