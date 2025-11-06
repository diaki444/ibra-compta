import React, { useState, useMemo } from 'react';
import { Transaction, Invoice, UserProfile } from '../types';
import Card from './Card';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';


interface ReportsProps {
    transactions: Transaction[];
    invoices: Invoice[];
    profile: UserProfile;
}

const getDateRange = (period: string): { startDate: Date, endDate: Date, label: string } => {
    const now = new Date();
    let startDate: Date, endDate: Date;
    let label = '';

    // Helper to set time to the very end of the day for inclusive filtering
    const endOfDay = (date: Date) => {
        date.setHours(23, 59, 59, 999);
        return date;
    };

    switch (period) {
        case 'this-month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
            label = `ce mois-ci (${startDate.toLocaleDateString('fr-FR')} - ${endDate.toLocaleDateString('fr-FR')})`;
            break;
        case 'last-month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
            label = `le mois dernier (${startDate.toLocaleDateString('fr-FR')} - ${endDate.toLocaleDateString('fr-FR')})`;
            break;
        case 'this-quarter':
            const quarter = Math.floor(now.getMonth() / 3);
            startDate = new Date(now.getFullYear(), quarter * 3, 1);
            endDate = endOfDay(new Date(now.getFullYear(), quarter * 3 + 3, 0));
            label = `ce trimestre (${startDate.toLocaleDateString('fr-FR')} - ${endDate.toLocaleDateString('fr-FR')})`;
            break;
        case 'last-quarter':
            const currentQuarter = Math.floor(now.getMonth() / 3);
            let year = now.getFullYear();
            let startMonthOfLastQuarter;

            if (currentQuarter === 0) { // If it's Q1, last quarter was Q4 of the previous year
                year--;
                startMonthOfLastQuarter = 9; // Month 9 is October (0-indexed)
            } else {
                startMonthOfLastQuarter = (currentQuarter - 1) * 3;
            }
            
            startDate = new Date(year, startMonthOfLastQuarter, 1);
            endDate = endOfDay(new Date(year, startMonthOfLastQuarter + 3, 0));
            label = `le trimestre dernier (${startDate.toLocaleDateString('fr-FR')} - ${endDate.toLocaleDateString('fr-FR')})`;
            break;
        default:
            startDate = new Date();
            endDate = new Date();
            label = "Période non définie";
            break;
    }
    return { startDate, endDate, label };
};

const COLORS = ['#10b981', '#3b82f6', '#f97316', '#ec4899', '#8b5cf6', '#f59e0b'];

const Reports: React.FC<ReportsProps> = ({ transactions, invoices, profile }) => {
    const [reportType, setReportType] = useState('summary');
    const [period, setPeriod] = useState('this-month');
    
    const inputStyle = "w-full bg-gray-700 border-gray-600 p-2 rounded-lg text-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition";
    const buttonStyle = "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition";
    
    const expenseBreakdownData = useMemo(() => {
        const { startDate, endDate } = getDateRange(period);
        
        const filteredExpenses = transactions.filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'expense' && tDate >= startDate && tDate <= endDate;
        });

        const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
            const category = expense.source.split(' - ')[0];
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += expense.totalAmount;
            return acc;
        }, {} as { [key: string]: number });

        return Object.entries(expensesByCategory).map(([name, value]) => ({
            name,
            value: parseFloat(value.toFixed(2)),
        }));
    }, [transactions, period]);

    const generatePdf = (title: string, periodLabel: string, dataT: Transaction[], dataI: Invoice[]) => {
        let contentHtml = '';
        if (reportType === 'summary') {
            const totalRevenues = dataT.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.totalAmount, 0);
            const totalExpenses = dataT.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.totalAmount, 0);
            contentHtml = `
                <div class="border rounded-lg p-4 grid grid-cols-2 gap-4 text-gray-800">
                    <div><span class="font-semibold">Revenus Totaux:</span> ${totalRevenues.toFixed(2)} €</div>
                    <div><span class="font-semibold">Dépenses Totales:</span> ${totalExpenses.toFixed(2)} €</div>
                    <div><span class="font-semibold">Solde Net:</span> ${(totalRevenues - totalExpenses).toFixed(2)} €</div>
                </div>
            `;
        } else if (reportType === 'transactions-list') {
            contentHtml = `
                <table class="w-full text-left text-sm">
                    <thead class="bg-gray-100"><tr>
                        <th class="p-2 font-semibold text-gray-600">Date</th><th class="p-2 font-semibold text-gray-600">Type</th><th class="p-2 font-semibold text-gray-600">Description</th><th class="p-2 font-semibold text-gray-600 text-right">Montant TTC</th>
                    </tr></thead>
                    <tbody>${dataT.map(t => `
                        <tr class="border-b"><td class="p-2">${t.date}</td><td class="p-2 capitalize text-gray-700">${t.type}</td><td class="p-2 text-gray-700">${t.source}</td><td class="p-2 text-right text-gray-700 font-mono">${t.totalAmount.toFixed(2)} €</td></tr>
                    `).join('')}</tbody>
                </table>
            `;
        } else if (reportType === 'invoices-list') {
            contentHtml = `
                <table class="w-full text-left text-sm">
                    <thead class="bg-gray-100"><tr>
                        <th class="p-2 font-semibold text-gray-600">N°</th><th class="p-2 font-semibold text-gray-600">Client</th><th class="p-2 font-semibold text-gray-600">Date</th><th class="p-2 font-semibold text-gray-600">Statut</th><th class="p-2 font-semibold text-gray-600 text-right">Montant TTC</th>
                    </tr></thead>
                    <tbody>${dataI.map(i => `
                        <tr class="border-b"><td class="p-2 text-gray-700 font-mono">${i.invoiceNumber}</td><td class="p-2 text-gray-700">${i.clientName}</td><td class="p-2 text-gray-700">${i.issueDate}</td><td class="p-2 text-gray-700">${i.status}</td><td class="p-2 text-right text-gray-700 font-mono">${i.totalAmount.toFixed(2)} €</td></tr>
                    `).join('')}</tbody>
                </table>
            `;
        } else if (reportType === 'general-ledger') {
            contentHtml = `
                <table class="w-full text-left text-xs">
                    <thead class="bg-gray-100"><tr>
                        <th class="p-2 font-semibold text-gray-600">Date</th>
                        <th class="p-2 font-semibold text-gray-600">Type</th>
                        <th class="p-2 font-semibold text-gray-600">Catégorie/Source</th>
                        <th class="p-2 font-semibold text-gray-600 text-right">Montant (sans TVA)</th>
                        <th class="p-2 font-semibold text-gray-600 text-right">TVA</th>
                        <th class="p-2 font-semibold text-gray-600 text-right">Montant Total</th>
                    </tr></thead>
                    <tbody>${dataT.map(t => {
                        const category = t.type === 'expense' ? t.source.split(' - ')[0] : t.source;
                        return `
                        <tr class="border-b">
                            <td class="p-2">${t.date}</td>
                            <td class="p-2 capitalize text-gray-700">${t.type}</td>
                            <td class="p-2 text-gray-700">${category}</td>
                            <td class="p-2 text-right text-gray-700 font-mono">${t.amountExVat.toFixed(2)} €</td>
                            <td class="p-2 text-right text-gray-700 font-mono">${t.vatAmount.toFixed(2)} €</td>
                            <td class="p-2 text-right text-gray-700 font-mono font-bold">${t.totalAmount.toFixed(2)} €</td>
                        </tr>`
                    }).join('')}</tbody>
                </table>
            `;
        }

        const reportHtml = `
            <html>
                <head>
                    <title>${title}</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style> body { -webkit-print-color-adjust: exact; } </style>
                </head>
                <body class="p-8 bg-white"><div class="max-w-4xl mx-auto">
                    <h1 class="text-2xl font-bold text-gray-800">${title}</h1>
                    <p class="mb-4 text-gray-600">Pour ${profile.companyName} | Période: ${periodLabel}</p>
                    ${contentHtml}
                </div></body>
            </html>
        `;

        const pdfWindow = window.open('', '_blank');
        pdfWindow?.document.write(reportHtml);
        pdfWindow?.document.close();
        setTimeout(() => { pdfWindow?.print(); pdfWindow?.close(); }, 250);
    };

    const generateCsv = (fileName: string, dataT: Transaction[], dataI: Invoice[]) => {
        let csvContent = "";
        if (reportType === 'summary') {
            const totalRevenues = dataT.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.totalAmount, 0);
            const totalExpenses = dataT.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.totalAmount, 0);
            csvContent = [
                "Metrique,Valeur",
                `"Revenus Totaux",${totalRevenues.toFixed(2)}`,
                `"Dépenses Totales",${totalExpenses.toFixed(2)}`,
                `"Solde Net",${(totalRevenues - totalExpenses).toFixed(2)}`,
            ].join('\n');
        } else if (reportType === 'transactions-list') {
            const headers = ["ID", "Date", "Type", "Source", "Montant HTVA", "Taux TVA", "Montant TVA", "Montant Total"];
            const rows = dataT.map(t => [t.id, t.date, t.type, `"${t.source.replace(/"/g, '""')}"`, t.amountExVat, t.vatRate, t.vatAmount, t.totalAmount].join(','));
            csvContent = [headers.join(','), ...rows].join('\n');
        } else if (reportType === 'invoices-list') {
            const headers = ["N° Facture", "Client", "Date Emission", "Date Echeance", "Montant Total", "Statut"];
            const rows = dataI.map(i => [i.invoiceNumber, `"${i.clientName.replace(/"/g, '""')}"`, i.issueDate, i.dueDate, i.totalAmount, i.status].join(','));
            csvContent = [headers.join(','), ...rows].join('\n');
        } else if (reportType === 'general-ledger') {
            const headers = ["ID", "Date", "Type", "Catégorie/Source", "Description", "Montant (sans TVA)", "Taux TVA (%)", "Montant TVA", "Montant Total", "Méthode de Paiement"];
            const rows = dataT.map(t => {
                let category = t.source;
                let description = t.description || '';
                if (t.type === 'expense') {
                    const parts = t.source.split(' - ');
                    category = parts.length > 1 ? parts[0] : t.source;
                    description = parts.length > 1 ? parts.slice(1).join(' - ') : '-';
                }
                return [
                    t.id, 
                    t.date, 
                    t.type, 
                    `"${category.replace(/"/g, '""')}"`,
                    `"${description.replace(/"/g, '""')}"`,
                    t.amountExVat.toFixed(2), 
                    t.vatRate, 
                    t.vatAmount.toFixed(2), 
                    t.totalAmount.toFixed(2),
                    t.paymentMethod
                ].join(',');
            });
            csvContent = [headers.join(','), ...rows].join('\n');
        }


        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${fileName}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const generateReport = (format: 'pdf' | 'csv') => {
        const { startDate, endDate, label } = getDateRange(period);
        const isGeneralLedger = reportType === 'general-ledger';

        const transactionsForReport = isGeneralLedger
            ? transactions
            : transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate >= startDate && tDate <= endDate;
              });
        
        const invoicesForReport = invoices.filter(inv => {
            const iDate = new Date(inv.issueDate);
            return iDate >= startDate && iDate <= endDate;
        });
        
        const reportTitleMap: { [key: string]: string } = {
            'summary': 'Résumé des opérations',
            'transactions-list': 'Liste des transactions',
            'invoices-list': 'Liste des factures',
            'general-ledger': 'Grand livre comptable'
        };
        const reportTitle = reportTitleMap[reportType] || 'Rapport';
        
        const periodLabelForFileName = isGeneralLedger ? 'complet' : period;
        const fileName = `${reportTitle.replace(/ /g, '_')}_${periodLabelForFileName}`.toLowerCase();
        const periodLabelForDisplay = isGeneralLedger ? 'Toutes les périodes' : label;


        if (format === 'pdf') {
            generatePdf(reportTitle, periodLabelForDisplay, transactionsForReport, invoicesForReport);
        } else {
            generateCsv(fileName, transactionsForReport, invoicesForReport);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Rapports</h2>
            <Card>
                <h3 className="text-xl font-semibold text-white mb-4">Générer un rapport</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                        <label htmlFor="report-type" className="text-sm text-gray-400 mb-1">Type de rapport</label>
                        <select id="report-type" value={reportType} onChange={e => setReportType(e.target.value)} className={inputStyle}>
                            <option value="summary">Résumé des opérations</option>
                            <option value="transactions-list">Liste des transactions</option>
                            <option value="invoices-list">Liste des factures</option>
                            <option value="general-ledger">Grand livre (toutes les transactions)</option>
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="period" className="text-sm text-gray-400 mb-1">Période</label>
                        <select id="period" value={period} onChange={e => setPeriod(e.target.value)} className={inputStyle} disabled={reportType === 'general-ledger'}>
                            <option value="this-month">Ce mois-ci</option>
                            <option value="last-month">Mois dernier</option>
                            <option value="this-quarter">Ce trimestre</option>
                            <option value="last-quarter">Trimestre dernier</option>
                        </select>
                         {reportType === 'general-ledger' && <p className="text-xs text-gray-500 mt-1">Le grand livre inclut toutes les périodes.</p>}
                    </div>
                    <div className="flex flex-col sm:flex-row items-end gap-2">
                        <button onClick={() => generateReport('pdf')} className={`w-full ${buttonStyle}`}>Exporter PDF</button>
                        <button onClick={() => generateReport('csv')} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition">Exporter Excel</button>
                    </div>
                </div>
            </Card>

            <Card>
                <h3 className="text-xl font-semibold text-white mb-4">Vos dépenses par catégorie ({getDateRange(period).label})</h3>
                {expenseBreakdownData.length > 0 ? (
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={expenseBreakdownData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                >
                                    {expenseBreakdownData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value: number) => `${value.toFixed(2)} €`}
                                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                                />
                                <Legend wrapperStyle={{ color: '#9ca3af' }}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-12">Aucune dépense enregistrée pour cette période.</p>
                )}
            </Card>
            
             <Card>
                <h3 className="text-xl font-semibold text-white mb-4">Derniers rapports générés</h3>
                <p className="text-gray-400">Aucun rapport n'a encore été généré.</p>
                {/* A list of generated reports would appear here */}
            </Card>
        </div>
    );
};

export default Reports;