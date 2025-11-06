import React, { useState } from 'react';
import { Page, AppNotification } from '../types';
import { 
    DashboardIcon, 
    RevenueIcon, 
    ExpenseIcon, 
    VatIcon, 
    InvoiceIcon, 
    ReportIcon, 
    AiIcon,
    ProfileIcon,
    LogoutIcon,
    BellIcon,
} from './icons';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onLogout: () => void;
  profileName: string;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
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

const pageTitles: { [key in Page]: string } = {
    dashboard: 'Tableau de bord',
    revenues: 'Revenus',
    expenses: 'Dépenses',
    vat: 'TVA & Impôts',
    invoicing: 'Facturation',
    reports: 'Rapports',
    'ai-assistant': 'Assistant IA',
    profile: 'Profil'
};

const Layout: React.FC<LayoutProps> = ({ children, currentPage, setCurrentPage, onLogout, profileName, notifications, onMarkAsRead, onMarkAllAsRead }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    setIsSidebarOpen(false);
  };

  const handleNotificationClick = (notification: AppNotification) => {
    onMarkAsRead(notification.id);
    if (notification.link) {
        setCurrentPage(notification.link);
    }
    setIsNotificationsOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center justify-center text-2xl font-bold text-white border-b border-gray-700 flex-shrink-0">
          IBRA-COMPTA
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.page}
            onClick={() => handlePageChange(item.page)}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
              currentPage === item.page
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <item.icon />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-700 space-y-2 flex-shrink-0">
          <button
            onClick={() => handlePageChange('profile')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
              currentPage === 'profile'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
              <ProfileIcon />
              <span>{profileName}</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-200"
          >
            <LogoutIcon />
            <span>Déconnexion</span>
          </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-900 text-gray-300">
      {/* Mobile Sidebar */}
      <div 
        className={`fixed inset-0 z-40 flex transition-transform duration-300 md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <aside className="w-64 bg-gray-800 flex flex-col">
          <SidebarContent />
        </aside>
        <div className="flex-1 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)}></div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-gray-800 flex-col hidden md:flex">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-30">
            <div className="flex items-center">
                 <button className="md:hidden mr-4 text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(true)}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
                <h1 className="text-xl font-semibold text-white">{pageTitles[currentPage]}</h1>
            </div>
            <div className="relative">
                <button onClick={() => setIsNotificationsOpen(p => !p)} className="relative text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700">
                    <BellIcon />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-gray-800">
                            {unreadCount}
                        </span>
                    )}
                </button>
                {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 border border-gray-700 z-50">
                        <div className="p-3 flex justify-between items-center border-b border-gray-700">
                            <h3 className="font-semibold text-white text-sm">Notifications</h3>
                            <button onClick={onMarkAllAsRead} disabled={unreadCount === 0} className="text-xs text-blue-400 hover:underline disabled:text-gray-500 disabled:no-underline">
                                Tout marquer comme lu
                            </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? notifications.map(notif => (
                                <div key={notif.id} onClick={() => handleNotificationClick(notif)} className={`p-3 border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer ${!notif.read ? 'bg-blue-900/30' : ''}`}>
                                    <p className="text-sm text-gray-300">{notif.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(notif.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            )) : (
                                <p className="p-8 text-center text-sm text-gray-500">Vous n'avez aucune notification.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;