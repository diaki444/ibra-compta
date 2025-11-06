import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Transaction } from '../types';
import { analyzeReceiptImage } from '../services/geminiService';
import Card from './Card';
import { PencilIcon, TrashIcon } from './icons';
import ConfirmationModal from './ConfirmationModal';

interface RevenuesProps {
    transactions: Transaction[];
    addTransactions: (transactions: Omit<Transaction, 'id'>[]) => void;
    updateTransaction: (transaction: Transaction) => void;
    deleteTransaction: (id: string) => void;
}

const Revenues: React.FC<RevenuesProps> = ({ transactions, addTransactions, updateTransaction, deleteTransaction }) => {
    const [source, setSource] = useState('');
    const [amountExVat, setAmountExVat] = useState('');
    const [vatRate, setVatRate] = useState('21');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Bank Transfer' | 'Cash'>('Bank Transfer');
    
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [useProAnalysis, setUseProAnalysis] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<Transaction>>({});

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);


    useEffect(() => {
        if (editingTransaction) {
            setEditFormData({
                ...editingTransaction,
                amountExVat: editingTransaction.amountExVat,
            });
        }
    }, [editingTransaction]);

    const monthlySummary = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const monthlyTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= startOfMonth && tDate <= endOfMonth;
        });

        const total = monthlyTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
        const count = monthlyTransactions.length;
        const average = count > 0 ? total / count : 0;

        return { total, count, average };
    }, [transactions]);


    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = (reader.result as string).split(',')[1];
            setImagePreview(reader.result as string);
            setIsAnalyzing(true);
            setError(null);
            try {
                const data = await analyzeReceiptImage(base64String, file.type, useProAnalysis);
                setSource(data.source || '');
                setAmountExVat(data.amountExVat?.toString() || '');
                const calculatedVatRate = data.totalAmount && data.amountExVat ? ((data.totalAmount / data.amountExVat) - 1) * 100 : 21;
                setVatRate(Math.round(calculatedVatRate).toString());
                setDate(data.date || new Date().toISOString().split('T')[0]);
                if (data.paymentMethod && ['Card', 'Bank Transfer', 'Cash'].includes(data.paymentMethod)) {
                    setPaymentMethod(data.paymentMethod);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
                console.error(err);
            } finally {
                setIsAnalyzing(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleCsvImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim() !== '');
            if (lines.length < 2) {
                setError("Le fichier CSV est vide ou ne contient que l'en-tête.");
                return;
            }
            const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
            const transactionsToAdd: Omit<Transaction, 'id'>[] = [];

            const dateIndex = header.findIndex(h => h.includes('date'));
            const amountIndex = header.findIndex(h => h.includes('amount') || h.includes('fare') || h.includes('earnings'));
            const sourceIndex = header.findIndex(h => h.includes('source') || h.includes('platform'));

            if (dateIndex === -1 || amountIndex === -1) {
                setError("Le CSV doit contenir les colonnes 'date' et 'amount'.");
                return;
            }

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                if (values.length < header.length) continue;
                
                const amount = parseFloat(values[amountIndex]);
                if (isNaN(amount) || amount <= 0) continue;
                
                const vatRate = 21;
                const totalAmount = amount;
                const amountExVat = totalAmount / (1 + (vatRate / 100));
                const vatAmount = totalAmount - amountExVat;

                transactionsToAdd.push({
                    type: 'revenue',
                    source: values[sourceIndex] || 'Uber/Bolt Import',
                    date: new Date(values[dateIndex]).toISOString().split('T')[0],
                    amountExVat: parseFloat(amountExVat.toFixed(2)),
                    vatRate,
                    vatAmount: parseFloat(vatAmount.toFixed(2)),
                    totalAmount: parseFloat(totalAmount.toFixed(2)),
                    paymentMethod: 'Bank Transfer'
                });
            }
            if (transactionsToAdd.length > 0) {
                addTransactions(transactionsToAdd);
                alert(`${transactionsToAdd.length} transactions importées avec succès !`);
                setError(null);
            } else {
                 setError("Aucune transaction valide trouvée dans le fichier CSV.");
            }
        };
        reader.readAsText(file);
    };
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const numAmountExVat = parseFloat(amountExVat);
        const numVatRate = parseFloat(vatRate);
        const vatAmount = numAmountExVat * (numVatRate / 100);
        const totalAmount = numAmountExVat + vatAmount;

        const newTransaction: Omit<Transaction, 'id'> = {
            type: 'revenue',
            source,
            amountExVat: numAmountExVat,
            vatRate: numVatRate,
            vatAmount,
            totalAmount,
            date,
            paymentMethod,
        };
        addTransactions([newTransaction]);
        
        setSource('');
        setAmountExVat('');
        setVatRate('21');
        setDate(new Date().toISOString().split('T')[0]);
        setPaymentMethod('Bank Transfer');
        setImagePreview(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
    };
    
    const handleEditClick = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsEditModalOpen(true);
    };

    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingTransaction) return;

        const numAmountExVat = parseFloat(String(editFormData.amountExVat));
        const numVatRate = parseFloat(String(editFormData.vatRate));
        const vatAmount = numAmountExVat * (numVatRate / 100);
        const totalAmount = numAmountExVat + vatAmount;

        updateTransaction({
            ...editingTransaction,
            ...editFormData,
            amountExVat: numAmountExVat,
            vatRate: numVatRate,
            vatAmount,
            totalAmount,
        });

        setIsEditModalOpen(false);
        setEditingTransaction(null);
    };
    
    const handleDeleteClick = (id: string) => {
        setDeletingId(id);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (deletingId) {
            deleteTransaction(deletingId);
        }
        setIsConfirmModalOpen(false);
        setDeletingId(null);
    };

    const inputStyle = "w-full bg-gray-700 border-gray-600 p-2 rounded-lg text-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition";
    const buttonStyle = "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition";

    const SummaryCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
        <Card>
            <h4 className="text-sm font-medium text-gray-400">{title}</h4>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </Card>
    );

    return (
         <div className="space-y-6">
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirmer la suppression"
                message={<p>Êtes-vous sûr de vouloir supprimer ce revenu ? Cette action est irréversible.</p>}
                confirmText="Supprimer"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard title="Revenus (ce mois-ci)" value={`${monthlySummary.total.toFixed(2)} €`} />
                <SummaryCard title="Nombre de transactions" value={monthlySummary.count.toString()} />
                <SummaryCard title="Revenu moyen / transaction" value={`${monthlySummary.average.toFixed(2)} €`} />
            </div>
            <Card>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                    <h3 className="text-xl font-semibold text-white">Ajouter un revenu</h3>
                     <div>
                        <input type="file" accept=".csv" onChange={handleCsvImport} className="hidden" ref={csvInputRef} id="csv-upload"/>
                        <label htmlFor="csv-upload" className={`cursor-pointer ${buttonStyle}`}>
                            Importer un CSV
                        </label>
                    </div>
                </div>
                
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center mb-6">
                    {imagePreview ? (
                        <div className="relative inline-block">
                            <img src={imagePreview} alt="Receipt preview" className="max-h-40 mx-auto rounded-md"/>
                            <button onClick={() => {setImagePreview(null); if(fileInputRef.current) fileInputRef.current.value = "";}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center font-bold text-xs">X</button>
                        </div>
                    ) : (
                        <>
                             <p className="mb-2 text-gray-400">Ajouter un reçu ou une facture</p>
                             <p className="text-sm text-gray-500 mb-4">Téléchargez une image et laissez l'IA remplir les champs pour vous.</p>
                             <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" ref={fileInputRef} id="receipt-upload-revenue" />
                             <label htmlFor="receipt-upload-revenue" className={`cursor-pointer ${buttonStyle}`}>
                                 Télécharger une image
                             </label>
                        </>
                    )}
                     <div className="mt-4">
                        <label className="flex items-center justify-center text-xs text-gray-400 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={useProAnalysis} 
                                onChange={(e) => setUseProAnalysis(e.target.checked)} 
                                className="form-checkbox h-4 w-4 bg-gray-600 border-gray-500 text-blue-500 focus:ring-blue-500 rounded" 
                            />
                            <span className="ml-2">Analyse Approfondie (Pro)</span>
                        </label>
                    </div>
                     {isAnalyzing && <p className="text-yellow-400 mt-2 text-sm">Analyse en cours...</p>}
                     {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={source} onChange={e => setSource(e.target.value)} placeholder="Source (ex: Uber, Bolt, Client)" required className={inputStyle} />
                        <input value={amountExVat} onChange={e => setAmountExVat(e.target.value)} type="number" step="0.01" placeholder="Montant (sans TVA)" required className={inputStyle} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <select value={vatRate} onChange={e => setVatRate(e.target.value)} className={inputStyle}>
                           <option value="21">21%</option>
                           <option value="12">12%</option>
                           <option value="6">6%</option>
                           <option value="0">0%</option>
                       </select>
                        <input value={date} onChange={e => setDate(e.target.value)} type="date" required className={inputStyle} />
                         <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} className={inputStyle}>
                           <option value="Bank Transfer">Virement</option>
                           <option value="Card">Carte</option>
                           <option value="Cash">Espèces</option>
                       </select>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className={buttonStyle}>Ajouter</button>
                    </div>
                </form>
            </Card>
            {isEditModalOpen && editingTransaction && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 sm:p-8 w-full max-w-lg md:max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-semibold text-white mb-4">Modifier le revenu</h3>
                        <form onSubmit={handleUpdate} className="space-y-4">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <input value={editFormData.source || ''} onChange={e => setEditFormData({...editFormData, source: e.target.value})} placeholder="Source" required className={inputStyle} />
                               <input value={editFormData.amountExVat || ''} onChange={e => setEditFormData({...editFormData, amountExVat: parseFloat(e.target.value)})} type="number" step="0.01" placeholder="Montant (sans TVA)" required className={inputStyle} />
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               <select value={editFormData.vatRate || ''} onChange={e => setEditFormData({...editFormData, vatRate: parseInt(e.target.value)})} className={inputStyle}>
                                   <option value="21">21%</option><option value="12">12%</option><option value="6">6%</option><option value="0">0%</option>
                               </select>
                               <input value={editFormData.date || ''} onChange={e => setEditFormData({...editFormData, date: e.target.value})} type="date" required className={inputStyle} />
                               <select value={editFormData.paymentMethod || ''} onChange={e => setEditFormData({...editFormData, paymentMethod: e.target.value as any})} className={inputStyle}>
                                   <option value="Bank Transfer">Virement</option><option value="Card">Carte</option><option value="Cash">Espèces</option>
                               </select>
                           </div>
                           <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                               <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-gray-600 hover:bg-gray-500 text-gray-200 font-bold py-2 px-4 rounded-lg">Annuler</button>
                               <button type="submit" className={buttonStyle}>Sauvegarder</button>
                           </div>
                        </form>
                    </div>
                </div>
            )}
            <Card>
                 <div className="overflow-x-auto">
                     <table className="w-full text-left min-w-[640px]">
                        <thead className="border-b border-gray-700">
                            <tr>
                                <th className="p-4 font-semibold text-gray-400 text-sm">Date</th>
                                <th className="p-4 font-semibold text-gray-400 text-sm">Source</th>
                                <th className="p-4 font-semibold text-gray-400 text-sm text-right">Montant (sans TVA)</th>
                                <th className="p-4 font-semibold text-gray-400 text-sm text-right">TVA</th>
                                <th className="p-4 font-semibold text-gray-400 text-sm text-right">Montant Total</th>
                                <th className="p-4 font-semibold text-gray-400 text-sm text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(t => (
                                 <tr key={t.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-4 whitespace-nowrap">{t.date}</td>
                                    <td className="p-4">{t.source}</td>
                                    <td className="p-4 text-right font-mono whitespace-nowrap">{t.amountExVat.toFixed(2)} €</td>
                                    <td className="p-4 text-right font-mono whitespace-nowrap">{t.vatAmount.toFixed(2)} €</td>
                                    <td className="p-4 text-right font-bold text-green-400 whitespace-nowrap">{t.totalAmount.toFixed(2)} €</td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            <button onClick={() => handleEditClick(t)} className="text-gray-400 hover:text-blue-400 transition-colors">
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDeleteClick(t.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                     </table>
                </div>
            </Card>
        </div>
    );
};

export default Revenues;