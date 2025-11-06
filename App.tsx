import React, { useState, useEffect } from 'react';
import { Page, Transaction, Invoice, UserProfile, AppNotification } from './types';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Revenues from './components/Revenues';
import Expenses from './components/Expenses';
import VatReport from './components/VatReport';
import Invoicing from './components/Invoicing';
import Reports from './components/Reports';
import AiAssistant from './components/AiAssistant';
import Profile from './components/Profile';

// Define initial empty state for new users
const initialTransactions: Transaction[] = [];
const initialInvoices: Invoice[] = [];
const defaultUserProfileTemplate: Omit<UserProfile, 'name' | 'email' | 'companyName'> = {
  vatNumber: "",
  address: "",
  phone: "",
  alertSettings: {
    lowBalance: { enabled: true, threshold: 500 },
    overdueInvoice: { enabled: true, days: 1 },
    upcomingInvoice: { enabled: true, days: 7 },
  },
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(() => sessionStorage.getItem('ibra-compta-user'));
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  const [prefilledAiQuestion, setPrefilledAiQuestion] = useState('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Load user data from localStorage when currentUser changes
  useEffect(() => {
    if (currentUser) {
      const userData = localStorage.getItem(`ibra-compta-data-${currentUser}`);
      if (userData) {
        const { transactions, invoices, profile } = JSON.parse(userData);
        setTransactions(transactions);
        setInvoices(invoices);
        setProfile(profile);
      }
    } else {
      // Clear data on logout
      setTransactions(initialTransactions);
      setInvoices(initialInvoices);
      setProfile(null);
    }
  }, [currentUser]);

  // Save user data to localStorage when it changes
  useEffect(() => {
    if (currentUser && profile) {
      const userData = JSON.stringify({ transactions, invoices, profile });
      localStorage.setItem(`ibra-compta-data-${currentUser}`, userData);
    }
  }, [transactions, invoices, profile, currentUser]);


  // Notification Generation Logic
  useEffect(() => {
    if (!profile) return;

    const newNotifications: AppNotification[] = [];
    const now = new Date();
    const { alertSettings } = profile;

    // 1. Overdue Invoices
    if (alertSettings.overdueInvoice.enabled) {
        invoices.forEach(inv => {
            if (inv.status !== 'Payée') {
                const dueDate = new Date(inv.dueDate);
                const diffTime = now.getTime() - dueDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 0) {
                    newNotifications.push({
                        id: `overdue-${inv.id}`,
                        message: `La facture ${inv.invoiceNumber} est en retard de ${diffDays} jours.`,
                        type: 'alert', read: false, link: 'invoicing', createdAt: new Date(dueDate.getTime() + diffDays * 1000 * 60 * 60 * 24)
                    });
                }
            }
        });
    }

    // 2. Upcoming Invoices
    if (alertSettings.upcomingInvoice.enabled) {
        invoices.forEach(inv => {
            if (inv.status === 'En attente') {
                const dueDate = new Date(inv.dueDate);
                const diffTime = dueDate.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays >= 0 && diffDays <= alertSettings.upcomingInvoice.days) {
                    newNotifications.push({
                        id: `upcoming-${inv.id}`,
                        message: `La facture ${inv.invoiceNumber} arrive à échéance dans ${diffDays === 0 ? 'aujourd\'hui' : `${diffDays} jours`}.`,
                        type: 'info', read: false, link: 'invoicing', createdAt: now
                    });
                }
            }
        });
    }

    // 3. Low Balance
    if (alertSettings.lowBalance.enabled) {
        const totalRevenues = transactions.filter(t => t.type === 'revenue').reduce((s, t) => s + t.totalAmount, 0);
        const totalExpenses = transactions.filter(t => t.type === 'expense' && t.status === 'Payé').reduce((s, t) => s + t.totalAmount, 0);
        const currentBalance = totalRevenues - totalExpenses;
        if (currentBalance < alertSettings.lowBalance.threshold) {
             newNotifications.push({
                id: `low-balance-${new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()}`, // One per day
                message: `Attention, votre solde de trésorerie est bas : ${currentBalance.toFixed(2)} €.`,
                type: 'alert', read: false, link: 'dashboard', createdAt: now
            });
        }
    }
    
    setNotifications(prev => {
        const newNotificationsMap = new Map(newNotifications.map(n => [n.id, n]));
        const prevNotificationsMap = new Map(prev.map(n => [n.id, n]));
        const mergedNotifications = new Map([...prevNotificationsMap, ...newNotificationsMap]);
        
        for(const [id, notif] of mergedNotifications.entries()){
            if(prevNotificationsMap.has(id)){
                notif.read = prevNotificationsMap.get(id)!.read;
            }
        }
        
        const activeIds = new Set(newNotifications.map(n => n.id));
        const allNotifications = Array.from(mergedNotifications.values());
        const stillRelevant = allNotifications.filter(n => {
             const isAlert = n.id.startsWith('overdue-') || n.id.startsWith('upcoming-') || n.id.startsWith('low-balance');
             return isAlert ? activeIds.has(n.id) : true;
        });

        return stillRelevant.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
    });
  }, [transactions, invoices, profile]);


  const handleLogin = (email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('ibra-compta-users') || '{}');
    if (users[email] && users[email].password === password) {
      setCurrentUser(email);
      sessionStorage.setItem('ibra-compta-user', email);
      return true;
    }
    return false;
  };
  
  const handleSignUp = (name: string, email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('ibra-compta-users') || '{}');
    if (users[email]) {
        return false; // User already exists
    }

    users[email] = { password };
    localStorage.setItem('ibra-compta-users', JSON.stringify(users));
    
    const newUserProfile: UserProfile = {
      ...defaultUserProfileTemplate,
      name,
      email,
      companyName: `${name}'s Company`,
    };

    const initialUserData = {
      transactions: initialTransactions,
      invoices: initialInvoices,
      profile: newUserProfile,
    };
    localStorage.setItem(`ibra-compta-data-${email}`, JSON.stringify(initialUserData));

    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('ibra-compta-user');
    setCurrentPage('dashboard');
  };

  const addTransactions = (newTransactions: Omit<Transaction, 'id'>[]) => {
    const transactionsToAdd = newTransactions.map((t, i) => ({
      ...t,
      id: `T${transactions.length + i + 1}`,
    }));
    setTransactions(prev => [...prev, ...transactionsToAdd].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };
  
  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => 
      prev.map(t => (t.id === updatedTransaction.id ? updatedTransaction : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prevTransactions => prevTransactions.filter(t => t.id !== id));
  };

  const addInvoice = (newInvoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const nextInvoiceNumber = `INV-2024-${String(invoices.length + 1).padStart(4, '0')}`;
    const invoiceToAdd: Invoice = {
      ...newInvoice,
      id: `I${invoices.length + 1}`,
      invoiceNumber: nextInvoiceNumber,
    };
    setInvoices(prev => [...prev, invoiceToAdd].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()));
  };
  
  const updateInvoice = (updatedInvoice: Invoice) => {
    setInvoices(prev => 
      prev.map(i => (i.id === updatedInvoice.id ? updatedInvoice : i))
    );
  };

  const updateInvoiceStatus = (id: string, status: 'Payée' | 'Impayée') => {
    setInvoices(prevInvoices =>
      prevInvoices.map(inv =>
        inv.id === id ? { ...inv, status } : inv
      )
    );
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prevInvoices => prevInvoices.filter(inv => inv.id !== id));
  };

  const handleDeleteAccount = () => {
    if (!currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('ibra-compta-users') || '{}');
    delete users[currentUser];
    localStorage.setItem('ibra-compta-users', JSON.stringify(users));

    localStorage.removeItem(`ibra-compta-data-${currentUser}`);

    handleLogout();
  };

  const handleAskAi = (question: string) => {
    setPrefilledAiQuestion(question);
    setCurrentPage('ai-assistant');
  };

  const handleClearPrefilledQuestion = () => {
    setPrefilledAiQuestion('');
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };


  const renderPage = () => {
    if (!profile) return <div className="text-center p-8">Chargement de vos données...</div>;

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard transactions={transactions} invoices={invoices} profile={profile} />;
      case 'revenues':
        return <Revenues transactions={transactions.filter(t => t.type === 'revenue')} addTransactions={addTransactions} updateTransaction={updateTransaction} deleteTransaction={deleteTransaction} />;
      case 'expenses':
        return <Expenses transactions={transactions.filter(t => t.type === 'expense')} addTransactions={addTransactions} deleteTransaction={deleteTransaction} updateTransaction={updateTransaction} />;
      case 'vat':
        return <VatReport transactions={transactions} invoices={invoices} profile={profile} onAskAi={handleAskAi} />;
      case 'invoicing':
        return <Invoicing invoices={invoices} addInvoice={addInvoice} updateInvoice={updateInvoice} updateInvoiceStatus={updateInvoiceStatus} deleteInvoice={deleteInvoice} profile={profile} />;
      case 'reports':
        return <Reports transactions={transactions} invoices={invoices} profile={profile} />;
      case 'ai-assistant':
        return <AiAssistant transactions={transactions} invoices={invoices} profile={profile} prefilledQuestion={prefilledAiQuestion} onPrefilledQuestionUsed={handleClearPrefilledQuestion} />;
      case 'profile':
        return <Profile profile={profile} setProfile={setProfile} onDeleteAccount={handleDeleteAccount} />;
      default:
        return <Dashboard transactions={transactions} invoices={invoices} profile={profile} />;
    }
  };

  if (!currentUser || !profile) {
    return <Login onLogin={handleLogin} onSignUp={handleSignUp} />;
  }

  return (
    <Layout 
      currentPage={currentPage} 
      setCurrentPage={setCurrentPage} 
      onLogout={handleLogout} 
      profileName={profile.name}
      notifications={notifications}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
