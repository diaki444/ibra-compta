import React, { useState, useMemo, useEffect } from 'react';
import { Invoice, UserProfile, InvoiceStatus } from '../types';
import Card from './Card';
import ConfirmationModal from './ConfirmationModal';
import { PencilIcon, TrashIcon, ClockIcon } from './icons';

interface InvoicingProps {
  invoices: Invoice[];
  addInvoice: (newInvoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
  updateInvoice: (updatedInvoice: Invoice) => void;
  updateInvoiceStatus: (id: string, status: 'Payée' | 'Impayée') => void;
  deleteInvoice: (id: string) => void;
  profile: UserProfile;
}

const initialFormData: Omit<Invoice, 'id' | 'invoiceNumber' | 'status'> = {
  clientName: '',
  clientAddress: '',
  clientVatNumber: '',
  serviceDescription: '',
  amountExVat: 0,
  vatRate: 21,
  totalAmount: 0,
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
};

const Invoicing: React.FC<InvoicingProps> = ({ invoices, addInvoice, updateInvoice, updateInvoiceStatus, deleteInvoice, profile }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [formData, setFormData] = useState<Partial<Invoice>>(initialFormData);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { totalOwed, overdueCount, totalInvoicedThisMonth } = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        let totalOwed = 0;
        let overdueCount = 0;
        let totalInvoicedThisMonth = 0;

        invoices.forEach(inv => {
            if (inv.status !== 'Payée') {
                totalOwed += inv.totalAmount;
                if (new Date(inv.dueDate) < now) {
                    overdueCount++;
                }
            }
            if (new Date(inv.issueDate) >= startOfMonth) {
                totalInvoicedThisMonth += inv.totalAmount;
            }
        });
        return { totalOwed, overdueCount, totalInvoicedThisMonth };
    }, [invoices]);

    useEffect(() => {
        if (isModalOpen) {
            setFormData(editingInvoice ? { ...editingInvoice } : { ...initialFormData });
        }
    }, [isModalOpen, editingInvoice]);

    const handleOpenModal = (invoice: Invoice | null = null) => {
        setEditingInvoice(invoice);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingInvoice(null);
        setFormData(initialFormData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'amountExVat' || name === 'vatRate' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmountExVat = parseFloat(String(formData.amountExVat));
        const numVatRate = parseFloat(String(formData.vatRate));
        const vatAmount = numAmountExVat * (numVatRate / 100);
        const totalAmount = numAmountExVat + vatAmount;

        if (editingInvoice) {
            updateInvoice({ ...editingInvoice, ...formData, totalAmount });
        } else {
            addInvoice({
                clientName: formData.clientName!,
                clientAddress: formData.clientAddress!,
                clientVatNumber: formData.clientVatNumber!,
                serviceDescription: formData.serviceDescription!,
                amountExVat: numAmountExVat,
                vatRate: numVatRate,
                totalAmount: totalAmount,
                issueDate: formData.issueDate!,
                dueDate: formData.dueDate!,
                status: 'En attente',
            });
        }
        handleCloseModal();
    };
    
    const handleDeleteClick = (id: string) => {
        setDeletingId(id);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (deletingId) {
            deleteInvoice(deletingId);
        }
        setIsConfirmModalOpen(false);
        setDeletingId(null);
    };

    const inputStyle = "w-full bg-gray-700 border-gray-600 p-2 rounded-lg text-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition";
    const buttonStyle = "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition";

    const SummaryCard: React.FC<{ title: string; value: string; icon?: React.ReactNode }> = ({ title, value, icon }) => (
        <Card>
            {icon && <div className="text-blue-400 mb-2">{icon}</div>}
            <h4 className="text-sm font-medium text-gray-400">{title}</h4>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </Card>
    );

    const statusBadges: { [key in InvoiceStatus]: string } = {
        'Payée': 'bg-green-500/20 text-green-400',
        'En attente': 'bg-amber-500/20 text-amber-400',
        'Impayée': 'bg-red-500/20 text-red-400',
    };

    return (
        <div className="space-y-6">
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirmer la suppression"
                message={<p>Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.</p>}
                confirmText="Supprimer"
            />
            
            {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 sm:p-8 w-full max-w-lg md:max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-semibold text-white mb-6">{editingInvoice ? 'Modifier la facture' : 'Nouvelle Facture'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="clientName" value={formData.clientName || ''} onChange={handleChange} placeholder="Nom du client" required className={inputStyle} />
                                <input name="clientVatNumber" value={formData.clientVatNumber || ''} onChange={handleChange} placeholder="N° de TVA du client" required className={inputStyle} />
                            </div>
                            <input name="clientAddress" value={formData.clientAddress || ''} onChange={handleChange} placeholder="Adresse du client" required className={inputStyle} />
                            <textarea name="serviceDescription" value={formData.serviceDescription || ''} onChange={handleChange} placeholder="Description du service" required className={`${inputStyle} h-24`} />
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               <input name="amountExVat" value={formData.amountExVat || ''} onChange={handleChange} type="number" step="0.01" placeholder="Montant (sans TVA)" required className={inputStyle} />
                               <select name="vatRate" value={formData.vatRate || 21} onChange={handleChange} className={inputStyle}>
                                   <option value="21">21%</option><option value="12">12%</option><option value="6">6%</option><option value="0">0%</option>
                               </select>
                                <input type="number" value={((formData.amountExVat || 0) * (1 + (formData.vatRate || 21) / 100)).toFixed(2)} readOnly placeholder="Montant total" className={`${inputStyle} bg-gray-900 cursor-not-allowed`} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400">Date d'émission</label>
                                    <input name="issueDate" value={formData.issueDate || ''} onChange={handleChange} type="date" required className={inputStyle} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400">Date d'échéance</label>
                                    <input name="dueDate" value={formData.dueDate || ''} onChange={handleChange} type="date" required className={inputStyle} />
                                </div>
                            </div>
                           <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                               <button type="button" onClick={handleCloseModal} className="bg-gray-600 hover:bg-gray-500 text-gray-200 font-bold py-2 px-4 rounded-lg">Annuler</button>
                               <button type="submit" className={buttonStyle}>{editingInvoice ? 'Sauvegarder' : 'Créer'}</button>
                           </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard title="Facturé ce mois-ci" value={`${totalInvoicedThisMonth.toFixed(2)} €`} />
                <SummaryCard title="En attente de paiement" value={`${totalOwed.toFixed(2)} €`} />
                <SummaryCard title="Factures en retard" value={overdueCount.toString()} icon={<ClockIcon className="w-8 h-8 text-red-400" />} />
            </div>
            
            <Card>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                    <h3 className="text-xl font-semibold text-white">Vos Factures</h3>
                    <button onClick={() => handleOpenModal()} className={buttonStyle}>Créer une facture</button>
                </div>
                <div className="overflow-x-auto">
                     <table className="w-full text-left min-w-[720px]">
                        <thead className="border-b border-gray-700">
                            <tr>
                                <th className="p-4 font-semibold text-gray-400 text-sm">N° Facture</th>
                                <th className="p-4 font-semibold text-gray-400 text-sm">Client</th>
                                <th className="p-4 font-semibold text-gray-400 text-sm">Émission</th>
                                <th className="p-4 font-semibold text-gray-400 text-sm">Échéance</th>
                                <th className="p-4 font-semibold text-gray-400 text-sm text-right">Montant</th>
                                <th className="p-4 font-semibold text-gray-400 text-sm text-center">Statut</th>
                                <th className="p-4 font-semibold text-gray-400 text-sm text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map(inv => {
                                const isOverdue = inv.status !== 'Payée' && new Date(inv.dueDate) < new Date();
                                return (
                                 <tr key={inv.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-4 font-mono whitespace-nowrap">{inv.invoiceNumber}</td>
                                    <td className="p-4">{inv.clientName}</td>
                                    <td className="p-4 whitespace-nowrap">{inv.issueDate}</td>
                                    <td className={`p-4 whitespace-nowrap ${isOverdue ? 'text-red-400 font-semibold' : ''}`}>{inv.dueDate}</td>
                                    <td className="p-4 text-right font-bold text-white whitespace-nowrap font-mono">{inv.totalAmount.toFixed(2)} €</td>
                                    <td className="p-4 text-center">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-md ${statusBadges[inv.status]}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            {inv.status === 'En attente' && <button onClick={() => updateInvoiceStatus(inv.id, 'Payée')} className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded">Marquer Payée</button>}
                                            {inv.status === 'Payée' && <button onClick={() => updateInvoiceStatus(inv.id, 'Impayée')} className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded">Marquer Impayée</button>}
                                            {inv.status === 'Impayée' && <button onClick={() => updateInvoiceStatus(inv.id, 'Payée')} className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded">Marquer Payée</button>}
                                            <button onClick={() => handleOpenModal(inv)} className="text-gray-400 hover:text-blue-400 transition-colors p-1">
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDeleteClick(inv.id)} className="text-gray-500 hover:text-red-400 transition-colors p-1">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                     </table>
                </div>
            </Card>
        </div>
    );
};

export default Invoicing;
