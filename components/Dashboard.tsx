import React, { useMemo } from 'react';
import { Transaction, Invoice, InvoiceStatus, UserProfile } from '../types';
import Card from './Card';
import Chart from './Chart';
import { 
    RevenueIcon, 
    ExpenseIcon, 
    InvoiceIcon, 
    TrendingUpIcon,
    TrendingDownIcon,
    ScaleIcon,
    ClockIcon
} from './icons';

interface DashboardProps {
    transactions: Transaction[];
    invoices: Invoice[];
    profile: UserProfile;
}

const statusBadges: { [key in InvoiceStatus]: string } = {
    'Payée': 'bg-green-500/20 text-green-400',
    'En attente': 'bg-amber-500/20 text-amber-400',
    'Impayée': 'bg-red-500/20 text-red-400',
};

const DashboardStatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; change: { text: string; isPositive: boolean; }; }> = ({ icon, title, value, change }) => (
    <Card className="p-4">
        <div className="flex items-center">
             <div className="flex-shrink-0 bg-gray-700 rounded-lg p-3 mr-4">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
        <div className="mt-3 text-right">
             <span className={`text-xs font-semibold px-2 py-1 rounded-md ${change.isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {change.text}
            </span>
        </div>
    </Card>
);


const Dashboard: React.FC<DashboardProps> = ({ transactions, invoices, profile }) => {
    
    const { totalRevenues, totalExpenses, netBalance, pendingInvoices, totalOwed } = useMemo(() => {
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        
        const recentTransactions = transactions.filter(t => new Date(t.date) > last30Days);

        const revenues = recentTransactions.filter(t => t.type === 'revenue');
        const expenses = recentTransactions.filter(t => t.type === 'expense');
        const totalRevenues = revenues.reduce((sum, t) => sum + t.totalAmount, 0);
        const totalExpenses = expenses.reduce((sum, t) => sum + t.totalAmount, 0);
        const pending = invoices.filter(inv => inv.status !== 'Payée');
        const totalOwed = pending.reduce((sum, inv) => sum + inv.totalAmount, 0);
        return { 
            totalRevenues, 
            totalExpenses, 
            netBalance: totalRevenues - totalExpenses, 
            pendingInvoices: pending, 
            totalOwed 
        };
    }, [transactions, invoices]);

    const chartData = useMemo(() => {
        const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        const data = months.map(m => ({ name: m, revenus: 0 }));
        transactions.filter(t => t.type === 'revenue').forEach(t => {
            const monthIndex = new Date(t.date).getMonth();
            data[monthIndex].revenus += t.totalAmount;
        });
        const currentMonth = new Date().getMonth();
        return data.slice(0, currentMonth + 1);
    }, [transactions]);

    const recentHistory = useMemo(() => [...transactions, ...invoices].sort((a, b) => {
      const dateA = new Date('date' in a ? a.date : a.issueDate);
      const dateB = new Date('date' in b ? b.date : b.issueDate);
      return dateB.getTime() - dateA.getTime();
    }).slice(0, 5), [transactions, invoices]);


    return (
        <div className="space-y-8">
             <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-white">Bonjour, {profile.name.split(' ')[0]} !</h2>
                    <p className="text-gray-400 mt-1">Voici un aperçu de vos finances.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardStatCard 
                    title="Revenus (30j)"
                    icon={<TrendingUpIcon className="text-green-400"/>}
                    value={`${totalRevenues.toFixed(2)} €`}
                    change={{ text: "+12%", isPositive: true }}
                />
                <DashboardStatCard 
                    title="Dépenses (30j)"
                    icon={<TrendingDownIcon className="text-red-400"/>}
                    value={`${totalExpenses.toFixed(2)} €`}
                    change={{ text: "+5%", isPositive: false }}
                />
                <DashboardStatCard 
                    title="Solde Net (30j)"
                    icon={<ScaleIcon className="text-blue-400"/>}
                    value={`${netBalance.toFixed(2)} €`}
                    change={{ text: netBalance >= 0 ? 'Bénéfice' : 'Déficit', isPositive: netBalance >= 0 }}
                />
                <DashboardStatCard 
                    title="En attente de paiement"
                    icon={<ClockIcon className="text-amber-400"/>}
                    value={`${totalOwed.toFixed(2)} €`}
                    change={{ text: `${pendingInvoices.length} factures`, isPositive: false }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="h-96">
                        <h3 className="text-lg font-semibold text-white mb-4">Vue d'ensemble des revenus</h3>
                        <Chart data={chartData} />
                    </Card>
                </div>
                <div>
                    <Card>
                        <h3 className="text-lg font-semibold text-white mb-4">Flux d'activité</h3>
                        <div className="space-y-4">
                          {recentHistory.map((item) => (
                            <div key={item.id} className="flex items-center space-x-4">
                               <div className={`flex-shrink-0 p-2 rounded-full ${'type' in item ? (item.type === 'revenue' ? 'bg-green-500/20' : 'bg-red-500/20') : 'bg-blue-500/20'}`}>
                                    {'type' in item ? (item.type === 'revenue' ? <RevenueIcon className="text-green-400" /> : <ExpenseIcon className="text-red-400"/>) : <InvoiceIcon className="text-blue-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-200 truncate">{'source' in item ? item.source : item.clientName}</p>
                                    <p className="text-xs text-gray-400">{'date' in item ? item.date : item.issueDate}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className={`font-bold text-sm ${'type' in item && item.type === 'expense' ? 'text-red-400' : 'text-green-400'}`}>
                                      {('type' in item && item.type === 'expense') ? '-' : '+'} {item.totalAmount.toFixed(2)}€
                                    </p>
                                    {'status' in item && (
                                        <span className={`text-xs px-2 py-0.5 rounded-md mt-1 inline-block ${statusBadges[item.status]}`}>
                                            {item.status}
                                        </span>
                                     )}
                                </div>
                            </div>
                          ))}
                        </div>
                    </Card>
              </div>
            </div>
        </div>
    );
};

export default Dashboard;