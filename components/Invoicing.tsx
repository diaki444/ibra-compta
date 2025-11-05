import React, { useState } from 'react';
import { Invoice, InvoiceStatus } from '../types';

interface InvoicingProps {
    invoices: Invoice[];
    addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
    updateInvoiceStatus: (id: string, status: 'Payée' | 'Impayée') => void;
}

const statusColors: { [key in InvoiceStatus]: string } = {
    'Payée': 'bg-green-500 text-green-900',
    'En attente': 'bg-yellow-500 text-yellow-900',
    'Impayée': 'bg-red-500 text-red-900',
};

const Invoicing: React.FC<InvoicingProps> = ({ invoices, addInvoice, updateInvoiceStatus }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const amountExVat = parseFloat(formData.get('amountExVat') as string);
        const vatRate = parseFloat(formData.get('vatRate') as string);
        const vatAmount = amountExVat * (vatRate / 100);
        const totalAmount = amountExVat + vatAmount;

        const newInvoice: Omit<Invoice, 'id' | 'invoiceNumber'> = {
            clientName: formData.get('clientName') as string,
            clientAddress: formData.get('clientAddress') as string,
            serviceDescription: formData.get('serviceDescription') as string,
            amountExVat,
            vatRate,
            totalAmount,
            issueDate: formData.get('issueDate') as string,
            dueDate: formData.get('dueDate') as string,
            status: 'En attente',
        };
        addInvoice(newInvoice);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Factures</h2>
                <button onClick={() => setIsModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">
                    Créer une facture
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                    <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700">
                        <h3 className="text-xl font-semibold mb-4">Nouvelle Facture</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input name="clientName" placeholder="Nom du client" required className="w-full bg-gray-700 p-2 rounded-md" />
                            <input name="clientAddress" placeholder="Adresse du client" required className="w-full bg-gray-700 p-2 rounded-md" />
                            <textarea name="serviceDescription" placeholder="Description du service" required className="w-full bg-gray-700 p-2 rounded-md" />
                             <div className="grid grid-cols-2 gap-4">
                               <input name="amountExVat" type="number" step="0.01" placeholder="Montant HTVA" required className="w-full bg-gray-700 p-2 rounded-md" />
                               <select name="vatRate" defaultValue="21" className="w-full bg-gray-700 p-2 rounded-md">
                                  <option value="21">21%</option>
                                  <option value="12">12%</option>
                                  <option value="6">6%</option>
                                  <option value="0">0%</option>
                               </select>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <input name="issueDate" type="date" required className="w-full bg-gray-700 p-2 rounded-md" />
                                <input name="dueDate" type="date" required className="w-full bg-gray-700 p-2 rounded-md" />
                            </div>
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md">Annuler</button>
                                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md">Créer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="p-4">N° Facture</th>
                            <th className="p-4">Client</th>
                            <th className="p-4">Date d'échéance</th>
                            <th className="p-4 text-right">Montant TTC</th>
                            <th className="p-4 text-center">Statut</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map(inv => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const dueDate = new Date(inv.dueDate);
                            const isOverdue = inv.status !== 'Payée' && dueDate < today;
                            
                            let overdueDays = 0;
                            if (isOverdue) {
                                const diffTime = today.getTime() - dueDate.getTime();
                                overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            }
    
                            return (
                                <tr key={inv.id} className={`border-b border-gray-700 hover:bg-gray-700/50 ${isOverdue ? 'bg-red-900/30' : ''}`}>
                                    <td className="p-4 font-mono">{inv.invoiceNumber}</td>
                                    <td className="p-4">{inv.clientName}</td>
                                    <td className="p-4">{inv.dueDate}</td>
                                    <td className="p-4 text-right font-bold">{inv.totalAmount.toFixed(2)} €</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[inv.status]}`}>
                                            {inv.status}
                                        </span>
                                        {isOverdue && <div className="text-red-400 text-xs mt-1">Retard: {overdueDays}j</div>}
                                    </td>
                                    <td className="p-4 text-center space-x-2">
                                        {isOverdue && <button className="text-yellow-400 hover:text-yellow-300 text-xs font-semibold">Rappel</button>}
                                        {inv.status !== 'Payée' && <button onClick={() => updateInvoiceStatus(inv.id, 'Payée')} className="text-green-400 hover:text-green-300 text-xs font-semibold">Payer</button>}
                                        {inv.status === 'En attente' && <button onClick={() => updateInvoiceStatus(inv.id, 'Impayée')} className="text-red-400 hover:text-red-300 text-xs font-semibold">Impayé</button>}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Invoicing;