import React, { useMemo } from 'react';
import { Transaction, Invoice } from '../types';
import Card from './Card';
import Chart from './Chart';

interface DashboardProps {
    transactions: Transaction[];
    invoices: Invoice[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, invoices }) => {
    const { totalRevenues, totalExpenses, netBalance, vatBalance } = useMemo(() => {
        const revenues = transactions.filter(t => t.type === 'revenue');
        const expenses = transactions.filter(t => t.type === 'expense');

        const totalRevenues = revenues.reduce((sum, t) => sum + t.amountExVat, 0);
        const totalExpenses = expenses.reduce((sum, t) => sum + t.amountExVat, 0);
        
        const vatOnSales = revenues.reduce((sum, t) => sum + t.vatAmount, 0);
        const vatOnPurchases = expenses.reduce((sum, t) => sum + t.vatAmount, 0);
        
        return {
            totalRevenues,
            totalExpenses,
            netBalance: totalRevenues - totalExpenses,
            vatBalance: vatOnSales - vatOnPurchases,
        };
    }, [transactions]);

    const overdueInvoices = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Compare dates only, ignoring time
        return invoices.filter(inv => {
            const dueDate = new Date(inv.dueDate);
            return inv.status !== 'Payée' && dueDate < today;
        });
    }, [invoices]);


    // Mock chart data
    const chartData = [
        { name: 'Jan', revenus: 4000 },
        { name: 'Fév', revenus: 3000 },
        { name: 'Mar', revenus: 5000 },
        { name: 'Avr', revenus: 4500 },
        { name: 'Mai', revenus: 6000 },
        { name: 'Juin', revenus: 5800 },
        { name: 'Juil', revenus: totalRevenues },
    ];

    // VAT Reminder logic
    const getVatDeadline = () => {
        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();
        if (month <= 3) return `20 Avril ${year}`;
        if (month <= 6) return `20 Juillet ${year}`;
        if (month <= 9) return `20 Octobre ${year}`;
        return `20 Janvier ${year + 1}`;
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Revenus (HTVA)" value={`${totalRevenues.toFixed(2)} €`} />
                <Card title="Dépenses (HTVA)" value={`${totalExpenses.toFixed(2)} €`} />
                <Card title="Solde Net" value={`${netBalance.toFixed(2)} €`} />
                <Card title="Solde TVA" value={`${vatBalance.toFixed(2)} €`} className={vatBalance > 0 ? 'bg-red-900 border-red-700' : 'bg-green-900 border-green-700'}/>
            </div>

            {overdueInvoices.length > 0 && (
                <div className="bg-red-900/50 border border-red-700 text-red-100 p-4 rounded-lg" role="alert">
                    <p className="font-bold text-lg mb-2">Factures en Retard</p>
                    <div className="space-y-2">
                        {overdueInvoices.map(inv => {
                            const today = new Date();
                            const dueDate = new Date(inv.dueDate);
                            const diffTime = today.getTime() - dueDate.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                            return (
                                <div key={inv.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-800 p-3 rounded-md">
                                    <div>
                                        <span className="font-semibold">{inv.clientName}</span>
                                        <span className="text-sm text-gray-400 ml-2">({inv.invoiceNumber}) - En retard de {diffDays} jour(s)</span>
                                    </div>
                                    <button className="mt-2 sm:mt-0 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-3 rounded-md transition duration-300">
                                        Envoyer un rappel
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="bg-yellow-900 border-l-4 border-yellow-500 text-yellow-100 p-4 rounded-r-lg" role="alert">
                <p className="font-bold">Rappel TVA</p>
                <p>N'oubliez pas votre déclaration de TVA avant le {getVatDeadline()}.</p>
            </div>
            
            <Chart data={chartData} />
        </div>
    );
};

export default Dashboard;