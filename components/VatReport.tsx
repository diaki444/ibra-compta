
import React, { useMemo } from 'react';
import { Transaction } from '../types';
import Card from './Card';

interface VatReportProps {
    transactions: Transaction[];
}

const VatReport: React.FC<VatReportProps> = ({ transactions }) => {
    const { vatOnSales, vatOnPurchases, vatBalance } = useMemo(() => {
        const revenues = transactions.filter(t => t.type === 'revenue');
        const expenses = transactions.filter(t => t.type === 'expense');
        
        const vatOnSales = revenues.reduce((sum, t) => sum + t.vatAmount, 0);
        const vatOnPurchases = expenses.reduce((sum, t) => sum + t.vatAmount, 0);
        
        return {
            vatOnSales,
            vatOnPurchases,
            vatBalance: vatOnSales - vatOnPurchases,
        };
    }, [transactions]);
    
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Rapport TVA Trimestriel</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="TVA sur les ventes" value={`+ ${vatOnSales.toFixed(2)} €`} />
                <Card title="TVA sur les achats (Déductible)" value={`- ${vatOnPurchases.toFixed(2)} €`} />
                <Card 
                    title={vatBalance >= 0 ? "TVA à payer" : "TVA à récupérer"}
                    value={`${vatBalance.toFixed(2)} €`}
                    className={vatBalance >= 0 ? 'bg-red-900 border-red-700' : 'bg-green-900 border-green-700'}
                />
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                <h3 className="text-xl font-semibold mb-4">Détail du calcul</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-md">
                        <span>TVA sur ventes (Grille 49)</span>
                        <span className="font-mono text-green-400">+ {vatOnSales.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-md">
                        <span>TVA sur achats (Grille 59)</span>
                        <span className="font-mono text-red-400">- {vatOnPurchases.toFixed(2)} €</span>
                    </div>
                    <hr className="border-gray-600" />
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-md font-bold text-lg">
                        <span>Solde (Grille 71 ou 72)</span>
                        <span className="font-mono">{vatBalance.toFixed(2)} €</span>
                    </div>
                </div>
                <div className="mt-6 flex gap-4">
                    <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">Exporter PDF</button>
                    <button className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition duration-300">Exporter CSV (Intervat)</button>
                </div>
            </div>
        </div>
    );
};

export default VatReport;
