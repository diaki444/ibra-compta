import React, { useState } from 'react';
import { Page, Transaction, Invoice, InvoiceStatus } from './types';
import { mockTransactions } from './data/mockData';
import { mockInvoices } from './data/mockData';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Revenues from './components/Revenues';
import Expenses from './components/Expenses';
import VatReport from './components/VatReport';
import Invoicing from './components/Invoicing';
import Reports from './components/Reports';
import AiAssistant from './components/AiAssistant';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
    const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);

    const addTransactions = (newTransactions: Omit<Transaction, 'id'>[]) => {
        const transactionsWithIds = newTransactions.map((t, index) => ({
            ...t,
            id: `T${Date.now()}${index}`
        }));
        setTransactions(prev => [...prev, ...transactionsWithIds].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };

    const addInvoice = (newInvoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
        const nextInvoiceNumber = `INV-2024-${(invoices.length + 1).toString().padStart(4, '0')}`;
        const invoiceWithId: Invoice = {
            ...newInvoice,
            id: `I${Date.now()}`,
            invoiceNumber: nextInvoiceNumber
        };
        setInvoices(prev => [...prev, invoiceWithId].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()));
    };
    
    const updateInvoiceStatus = (id: string, status: 'Payée' | 'Impayée') => {
        setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
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
            default:
                return <Dashboard transactions={transactions} invoices={invoices} />;
        }
    };

    return (
        <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
            {renderPage()}
        </Layout>
    );
};

export default App;
