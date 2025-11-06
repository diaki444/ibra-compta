import React, { useState, useEffect } from 'react';
import { Page, Transaction, Invoice, UserProfile, AppNotification } from './types';
import { mockUserProfile } from './data/mockData';
import { authService } from './services/authService';
import { profileService } from './services/profileService';
import { transactionService } from './services/transactionService';
import { invoiceService } from './services/invoiceService';
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

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [profile, setProfile] = useState<UserProfile>(mockUserProfile);
  const [prefilledAiQuestion, setPrefilledAiQuestion] = useState('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setUserId(user.id);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: authListener } = authService.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        setIsLoggedIn(true);
      } else {
        setUserId(null);
        setIsLoggedIn(false);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId || !isLoggedIn) return;

    const loadData = async () => {
      try {
        const [userProfile, userTransactions, userInvoices] = await Promise.all([
          profileService.getProfile(userId),
          transactionService.getTransactions(userId),
          invoiceService.getInvoices(userId),
        ]);

        if (userProfile) {
          setProfile(userProfile);
        } else {
          await profileService.createProfile(userId, mockUserProfile);
          setProfile(mockUserProfile);
        }

        setTransactions(userTransactions);
        setInvoices(userInvoices);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [userId, isLoggedIn]);

  // Notification Generation Logic
  useEffect(() => {
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
    
    // Merge notifications, preserving read status of existing ones
    setNotifications(prev => {
        const newNotificationsMap = new Map(newNotifications.map(n => [n.id, n]));
        const prevNotificationsMap = new Map(prev.map(n => [n.id, n]));

        const mergedNotifications = new Map([...prevNotificationsMap, ...newNotificationsMap]);
        
        // Update read status from previous notifications
        for(const [id, notif] of mergedNotifications.entries()){
            if(prevNotificationsMap.has(id)){
                notif.read = prevNotificationsMap.get(id)!.read;
            }
        }
        
        // Filter out notifications that are no longer active
        const activeIds = new Set(newNotifications.map(n => n.id));
        const allNotifications = Array.from(mergedNotifications.values());
        const stillRelevant = allNotifications.filter(n => {
             const isAlert = n.id.startsWith('overdue-') || n.id.startsWith('upcoming-') || n.id.startsWith('low-balance');
             return isAlert ? activeIds.has(n.id) : true;
        });

        return stillRelevant.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
    });
}, [transactions, invoices, profile]);


  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = async () => {
    try {
      await authService.signOut();
      setIsLoggedIn(false);
      setUserId(null);
      setTransactions([]);
      setInvoices([]);
      setProfile(mockUserProfile);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const addTransactions = async (newTransactions: Omit<Transaction, 'id'>[]) => {
    if (!userId) return;
    try {
      const addedTransactions = await Promise.all(
        newTransactions.map(t => transactionService.addTransaction(userId, t))
      );
      setTransactions(prev => [...prev, ...addedTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Error adding transactions:', error);
    }
  };
  
  const updateTransaction = async (updatedTransaction: Transaction) => {
    if (!userId) return;
    try {
      await transactionService.updateTransaction(userId, updatedTransaction);
      setTransactions(prev =>
        prev.map(t => (t.id === updatedTransaction.id ? updatedTransaction : t))
      );
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!userId) return;
    try {
      await transactionService.deleteTransaction(userId, id);
      setTransactions(prevTransactions => prevTransactions.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const addInvoice = async (newInvoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    if (!userId) return;
    try {
      const addedInvoice = await invoiceService.addInvoice(userId, newInvoice);
      setInvoices(prev => [...prev, addedInvoice].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()));
    } catch (error) {
      console.error('Error adding invoice:', error);
    }
  };
  
  const updateInvoice = async (updatedInvoice: Invoice) => {
    if (!userId) return;
    try {
      await invoiceService.updateInvoice(userId, updatedInvoice);
      setInvoices(prev =>
        prev.map(i => (i.id === updatedInvoice.id ? updatedInvoice : i))
      );
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  };

  const updateInvoiceStatus = async (id: string, status: 'Payée' | 'Impayée') => {
    if (!userId) return;
    try {
      await invoiceService.updateInvoiceStatus(userId, id, status);
      setInvoices(prevInvoices =>
        prevInvoices.map(inv =>
          inv.id === id ? { ...inv, status } : inv
        )
      );
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  };

  const deleteInvoice = async (id: string) => {
    if (!userId) return;
    try {
      await invoiceService.deleteInvoice(userId, id);
      setInvoices(prevInvoices => prevInvoices.filter(inv => inv.id !== id));
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const handleDeleteAccount = async () => {
    console.log("Account deletion process initiated.");
    await handleLogout();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
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
