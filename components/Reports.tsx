
import React from 'react';
import { Transaction, Invoice } from '../types';

interface ReportsProps {
    transactions: Transaction[];
    invoices: Invoice[];
}

const Reports: React.FC<ReportsProps> = ({ transactions, invoices }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Rapports</h2>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                <h3 className="text-xl font-semibold mb-4">Générer un rapport</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                        <label htmlFor="report-type" className="text-sm text-gray-400 mb-1">Type de rapport</label>
                        <select id="report-type" className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-red-500 focus:border-red-500">
                            <option>Résumé Mensuel</option>
                            <option>Résumé Trimestriel</option>
                            <option>Liste des transactions</option>
                            <option>Liste des factures</option>
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="period" className="text-sm text-gray-400 mb-1">Période</label>
                        <select id="period" className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-red-500 focus:border-red-500">
                            <option>Ce mois-ci</option>
                            <option>Mois dernier</option>
                            <option>Ce trimestre</option>
                            <option>Trimestre dernier</option>
                        </select>
                    </div>
                    <div className="flex items-end gap-2">
                        <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">Exporter PDF</button>
                        <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">Exporter Excel</button>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">Un résumé est automatiquement envoyé par email à la fin de chaque mois.</p>
            </div>
            
             <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                <h3 className="text-xl font-semibold mb-4">Derniers rapports générés</h3>
                <p className="text-gray-400">Aucun rapport n'a encore été généré.</p>
                {/* A list of generated reports would appear here */}
            </div>
        </div>
    );
};

export default Reports;
