import React, { useState, useEffect } from 'react';
import { Page, Transaction, Invoice, UserProfile } from './types';
import { mockTransactions, mockInvoices, mockUserProfile } from './data/mockData';
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
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [profile, setProfile] = useState<UserProfile>(mockUserProfile);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  const addTransactions = (newTransactions: Omit<Transaction, 'id'>[]) => {
    const transactionsToAdd = newTransactions.map((t, i) => ({
      ...t,
      id: `T${transactions.length + i + 1}`,
    }));
    setTransactions(prev => [...prev, ...transactionsToAdd].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
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

  const updateInvoiceStatus = (id: string, status: 'Payée' | 'Impayée') => {
    setInvoices(prevInvoices =>
      prevInvoices.map(inv =>
        inv.id === id ? { ...inv, status } : inv
      )
    );
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard transactions={transactions} invoices={invoices} />;
      case 'revenues':
        return <Revenues transactions={transactions.filter(t => t.type === 'revenue')} addTransactions={addTransactions} />;
      case 'expenses':
        return <Expenses transactions={transactions.filter(t => t.type === 'expense')} addTransactions={addTransactions} />;
      case 'vat':
        return <VatReport transactions={transactions} />;
      case 'invoicing':
        return <Invoicing invoices={invoices} addInvoice={addInvoice} updateInvoiceStatus={updateInvoiceStatus} />;
      case 'reports':
        return <Reports transactions={transactions} invoices={invoices} />;
      case 'ai-assistant':
        return <AiAssistant />;
      case 'profile':
        return <Profile profile={profile} setProfile={setProfile} />;
      default:
        return <Dashboard transactions={transactions} invoices={invoices} />;
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} profileName={profile.name}>
      {renderPage()}
    </Layout>
  );
}

export default App;
