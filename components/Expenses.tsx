import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Transaction } from '../types';
import { analyzeReceiptImage } from '../services/geminiService';
import Card from './Card';
import { TrashIcon, ArrowUpDownIcon, FuelIcon, WrenchIcon, ShieldIcon, PhoneIcon, WifiIcon, RestaurantIcon, OfficeSuppliesIcon, DotsIcon, PencilIcon } from './icons';
import ConfirmationModal from './ConfirmationModal';

interface ExpensesProps {
    transactions: Transaction[];
    addTransactions: (transactions: Omit<Transaction, 'id'>[]) => void;
    deleteTransaction: (id: string) => void;
    updateTransaction: (transaction: Transaction) => void;
}

type SortKey = keyof Transaction | 'totalAmount';

const expenseCategories = ["Carburant", "Entretien voiture", "Assurance", "Téléphone", "Internet", "Restaurant", "Fournitures de bureau", "Autre"];

const categoryIcons: { [key: string]: React.FC<{className?: string}> } = {
    "Carburant": FuelIcon,
    "Entretien voiture": WrenchIcon,
    "Assurance": ShieldIcon,
    "Téléphone": PhoneIcon,
    "Internet": WifiIcon,
    "Restaurant": RestaurantIcon,
    "Fournitures de bureau": OfficeSuppliesIcon,
    "Autre": DotsIcon
};

const statusBadges: { [key: string]: string } = {
    'Payé': 'bg-green-600 text-white',
    'Non payé': 'bg-amber-600 text-white',
};


const Expenses: React.FC<ExpensesProps> = ({ transactions, addTransactions, deleteTransaction, updateTransaction }) => {
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(expenseCategories[0]);
    const [amountExVat, setAmountExVat] = useState('');
    const [vatRate, setVatRate] = useState('21');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Bank Transfer' | 'Cash'>('Card');
    const [status, setStatus] = useState<'Payé' | 'Non payé'>('Payé');
    
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [useProAnalysis, setUseProAnalysis] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<Transaction> & { category?: string, description?: string }>({});

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (editingTransaction) {
            const parts = editingTransaction.source.split(' - ');
            const categoryDisplay = expenseCategories.includes(parts[0]) ? parts[0] : 'Autre';
            const descriptionDisplay = parts.length > 1 ? parts.slice(1).join(' - ') : (categoryDisplay === editingTransaction.source ? '' : editingTransaction.source);

            setEditFormData({
                ...editingTransaction,
                category: categoryDisplay,
                description: descriptionDisplay,
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
        
        const topCategory = monthlyTransactions.reduce((acc, t) => {
            const cat = t.source.split(' - ')[0];
            acc[cat] = (acc[cat] || 0) + t.totalAmount;
            return acc;
        }, {} as Record<string, number>);

        const topSpendingCategory = Object.keys(topCategory).length > 0
            ? Object.entries(topCategory).sort((a, b) => b[1] - a[1])[0][0]
            : 'N/A';

        return { total, count, topSpendingCategory };
    }, [transactions]);


    const sortedTransactions = useMemo(() => {
        let sortableItems = [...transactions];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof Transaction];
                const bValue = b[sortConfig.key as keyof Transaction];
                
                if (aValue === undefined || aValue === null) return 1;
                if (bValue === undefined || bValue === null) return -1;
                
                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [transactions, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

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
                setDescription(data.source || '');
                setCategory(expenseCategories.includes(data.category) ? data.category : 'Autre');
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
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const numAmountExVat = parseFloat(amountExVat);
        const numVatRate = parseFloat(vatRate);
        const vatAmount = numAmountExVat * (numVatRate / 100);
        const totalAmount = numAmountExVat + vatAmount;

        const newTransaction: Omit<Transaction, 'id'> = {
            type: 'expense',
            source: description ? `${category} - ${description}` : category,
            amountExVat: numAmountExVat,
            vatRate: numVatRate,
            vatAmount,
            totalAmount,
            date,
            paymentMethod,
            status,
        };
        addTransactions([newTransaction]);
        
        setDescription('');
        setCategory(expenseCategories[0]);
        setAmountExVat('');
        setVatRate('21');
        setDate(new Date().toISOString().split('T')[0]);
        setPaymentMethod('Card');
        setStatus('Payé');
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
            source: editFormData.description ? `${editFormData.category} - ${editFormData.description}` : editFormData.category || '',
            amountExVat: numAmountExVat,
            vatRate: numVatRate,
            vatAmount,
            totalAmount,
        });

        setIsEditModalOpen(false);
        setEditingTransaction(null);
    };

    const handleExportCsv = () => {
        const headers = ["Date", "Statut", "Catégorie", "Description", "Montant (sans TVA)", "Montant TVA", "Montant Total", "Méthode de Paiement"];
        
        const rows = sortedTransactions.map(t => {
            const parts = t.source.split(' - ');
            const categoryDisplay = parts.length > 1 ? parts[0] : t.source;
            const descriptionDisplay = parts.length > 1 ? parts.slice(1).join(' - ') : '-';

            return [
                t.date,
                t.status || 'N/A',
                `"${categoryDisplay.replace(/"/g, '""')}"`,
                `"${descriptionDisplay.replace(/"/g, '""')}"`,
                t.amountExVat.toFixed(2),
                t.vatAmount.toFixed(2),
                t.totalAmount.toFixed(2),
                t.paymentMethod
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'depenses.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const inputStyle = "w-full bg-gray-700 border-gray-600 p-2 rounded-lg text-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition";
    const buttonStyle = "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition";
    
    const getSortIndicator = (key: SortKey) => {
        if (sortConfig.key !== key) return <ArrowUpDownIcon className="w-4 h-4 text-gray-500" />;
        return sortConfig.direction === 'asc' ? '▲' : '▼';
    };

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
                message={<p>Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action est irréversible.</p>}
                confirmText="Supprimer"
            />
            {isEditModalOpen && editingTransaction && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 sm:p-8 w-full max-w-lg md:max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-semibold text-white mb-4">Modifier la dépense</h3>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <select value={editFormData.category} onChange={e => setEditFormData({...editFormData, category: e.target.value})} className={inputStyle}>
                                    {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                                <input value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})} placeholder="Détail" className={`${inputStyle} md:col-span-2`} />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input value={editFormData.amountExVat} onChange={e => setEditFormData({...editFormData, amountExVat: parseFloat(e.target.value)})} type="number" step="0.01" placeholder="Montant (sans TVA)" required className={inputStyle} />
                                <select value={editFormData.vatRate} onChange={e => setEditFormData({...editFormData, vatRate: parseInt(e.target.value)})} className={inputStyle}>
                                   <option value="21">21%</option><option value="12">12%</option><option value="6">6%</option><option value="0">0%</option>
                               </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input value={editFormData.date} onChange={e => setEditFormData({...editFormData, date: e.target.value})} type="date" required className={inputStyle} />
                                <select value={editFormData.paymentMethod} onChange={e => setEditFormData({...editFormData, paymentMethod: e.target.value as any})} className={inputStyle}>
                                   <option value="Card">Carte</option><option value="Bank Transfer">Virement</option><option value="Cash">Espèces</option>
                               </select>
                                <select value={editFormData.status} onChange={e => setEditFormData({...editFormData, status: e.target.value as any})} className={inputStyle}>
                                   <option value="Payé">Payé</option><option value="Non payé">Non payé</option>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard title="Dépenses (ce mois-ci)" value={`${monthlySummary.total.toFixed(2)} €`} />
                <SummaryCard title="Catégorie principale" value={monthlySummary.topSpendingCategory} />
                <SummaryCard title="Nombre de transactions" value={monthlySummary.count.toString()} />
            </div>
            <Card>
                <h3 className="text-xl font-semibold text-white mb-4">Ajouter une dépense</h3>
                
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
                             <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" ref={fileInputRef} id="receipt-upload" />
                             <label htmlFor="receipt-upload" className={`cursor-pointer ${buttonStyle}`}>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <select value={category} onChange={e => setCategory(e.target.value)} className={inputStyle}>
                            {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                         </select>
                        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Détail (ex: TotalEnergies)" className={`${inputStyle} md:col-span-2`} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={amountExVat} onChange={e => setAmountExVat(e.target.value)} type="number" step="0.01" placeholder="Montant (sans TVA)" required className={inputStyle} />
                        <select value={vatRate} onChange={e => setVatRate(e.target.value)} className={inputStyle}>
                           <option value="21">21%</option>
                           <option value="12">12%</option>
                           <option value="6">6%</option>
                           <option value="0">0%</option>
                       </select>
                     </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input value={date} onChange={e => setDate(e.target.value)} type="date" required className={inputStyle} />
                         <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} className={inputStyle}>
                           <option value="Card">Carte</option>
                           <option value="Bank Transfer">Virement</option>
                           <option value="Cash">Espèces</option>
                       </select>
                       <select value={status} onChange={e => setStatus(e.target.value as any)} className={inputStyle}>
                           <option value="Payé">Payé</option>
                           <option value="Non payé">Non payé</option>
                       </select>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className={buttonStyle}>Ajouter</button>
                    </div>
                </form>
            </Card>
            <Card>
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                    <h3 className="text-xl font-semibold text-white">Historique des dépenses</h3>
                    <button onClick={handleExportCsv} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition text-sm">
                        Exporter CSV
                    </button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[720px]">
                        <thead className="border-b border-gray-700">
                            <tr>
                                <th className="p-4 font-semibold text-gray-400 text-sm">
                                    <button onClick={() => requestSort('date')} className="flex items-center gap-2">Date {getSortIndicator('date')}</button>
                                </th>
                                <th className="p-4 font-semibold text-gray-400 text-sm">
                                   <button onClick={() => requestSort('source')} className="flex items-center gap-2">Catégorie {getSortIndicator('source')}</button>
                                </th>
                                <th className="p-4 font-semibold text-gray-400 text-sm">Description</th>
                                <th className="p-4 font-semibold text-gray-400 text-sm text-center">
                                    <button onClick={() => requestSort('status')} className="flex items-center gap-2">Statut {getSortIndicator('status')}</button>
                                </th>
                                <th className="p-4 font-semibold text-gray-400 text-sm text-right">
                                    <button onClick={() => requestSort('totalAmount')} className="flex items-center gap-2 w-full justify-end">Montant Total {getSortIndicator('totalAmount')}</button>
                                </th>
                                <th className="p-4 font-semibold text-gray-400 text-sm text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTransactions.map(t => {
                                 const parts = t.source.split(' - ');
                                 const categoryDisplay = parts.length > 1 ? parts[0] : t.source;
                                 const descriptionDisplay = parts.length > 1 ? parts.slice(1).join(' - ') : '-';
                                 const IconComponent = categoryIcons[categoryDisplay] || DotsIcon;

                                 return (
                                    <tr key={t.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                        <td className="p-4 whitespace-nowrap">{t.date}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <span className="p-1.5 bg-gray-700 rounded-full">
                                                    <IconComponent className="w-5 h-5 text-gray-400" />
                                                </span>
                                                <span className="text-gray-300">{categoryDisplay}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">{descriptionDisplay}</td>
                                        <td className="p-4 text-center">
                                            {t.status && (
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-md ${statusBadges[t.status]}`}>
                                                    {t.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right font-bold text-red-400 font-mono whitespace-nowrap">{t.totalAmount.toFixed(2)} €</td>
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
                                 );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Expenses;
