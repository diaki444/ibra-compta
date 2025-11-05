import React, { useState, useRef } from 'react';
import { Transaction } from '../types';
import { analyzeReceiptImage } from '../services/geminiService';

interface ExpensesProps {
    transactions: Transaction[];
    addTransactions: (transactions: Omit<Transaction, 'id'>[]) => void;
}

const Expenses: React.FC<ExpensesProps> = ({ transactions, addTransactions }) => {
    const [description, setDescription] = useState('');
    const [amountExVat, setAmountExVat] = useState('');
    const [vatRate, setVatRate] = useState('21');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Bank Transfer' | 'Cash'>('Card');
    
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                const data = await analyzeReceiptImage(base64String, file.type);
                setDescription(data.source || '');
                setAmountExVat(data.amountExVat?.toString() || '');
                const calculatedVatRate = data.totalAmount && data.amountExVat ? ((data.totalAmount / data.amountExVat) - 1) * 100 : 21;
                setVatRate(Math.round(calculatedVatRate).toString());
                setDate(data.date || new Date().toISOString().split('T')[0]);
            } catch (err) {
                setError('Failed to analyze receipt. Please enter details manually.');
                console.error(err);
            } finally {
                setIsAnalyzing(false);
            }
        };
        reader.readAsDataURL(file);
    };
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const numAmountExVat = parseFloat(amountExVat);
        const numVatRate = parseFloat(vatRate);
        const vatAmount = numAmountExVat * (numVatRate / 100);
        const totalAmount = numAmountExVat + vatAmount;

        const newTransaction: Omit<Transaction, 'id'> = {
            type: 'expense',
            source: description,
            amountExVat: numAmountExVat,
            vatRate: numVatRate,
            vatAmount,
            totalAmount,
            date,
            paymentMethod,
        };
        addTransactions([newTransaction]);
        
        // Reset form
        setDescription('');
        setAmountExVat('');
        setVatRate('21');
        setDate(new Date().toISOString().split('T')[0]);
        setPaymentMethod('Card');
        setImagePreview(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
         <div className="space-y-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                <h3 className="text-xl font-semibold mb-4">Ajouter une dépense</h3>
                
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center mb-6">
                    {imagePreview ? (
                        <div className="relative inline-block">
                            <img src={imagePreview} alt="Receipt preview" className="max-h-40 mx-auto rounded-md"/>
                            <button onClick={() => {setImagePreview(null); if(fileInputRef.current) fileInputRef.current.value = "";}} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center font-bold text-xs">X</button>
                        </div>
                    ) : (
                        <>
                             <p className="mb-2 text-gray-400">Ajouter un reçu ou une facture</p>
                             <p className="text-sm text-gray-500 mb-4">Téléchargez une image et laissez l'IA remplir les champs pour vous.</p>
                             <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" ref={fileInputRef} id="receipt-upload" />
                             <label htmlFor="receipt-upload" className="cursor-pointer bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">
                                 Télécharger une image
                             </label>
                        </>
                    )}
                     {isAnalyzing && <p className="text-yellow-400 mt-2 text-sm">Analyse en cours...</p>}
                     {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (ex: Carburant, Restaurant)" required className="w-full bg-gray-700 p-2 rounded-md" />
                        <input value={amountExVat} onChange={e => setAmountExVat(e.target.value)} type="number" step="0.01" placeholder="Montant HTVA" required className="w-full bg-gray-700 p-2 rounded-md" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <select value={vatRate} onChange={e => setVatRate(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md">
                           <option value="21">21%</option>
                           <option value="12">12%</option>
                           <option value="6">6%</option>
                           <option value="0">0%</option>
                       </select>
                        <input value={date} onChange={e => setDate(e.target.value)} type="date" required className="w-full bg-gray-700 p-2 rounded-md" />
                         <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} className="w-full bg-gray-700 p-2 rounded-md">
                           <option value="Card">Carte</option>
                           <option value="Bank Transfer">Virement</option>
                           <option value="Cash">Espèces</option>
                       </select>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md">Ajouter</button>
                    </div>
                </form>
            </div>
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="p-4">Date</th>
                            <th className="p-4">Description</th>
                            <th className="p-4 text-right">Montant HTVA</th>
                            <th className="p-4 text-right">TVA</th>
                            <th className="p-4 text-right">Montant Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(t => (
                             <tr key={t.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="p-4">{t.date}</td>
                                <td className="p-4">{t.source}</td>
                                <td className="p-4 text-right">{t.amountExVat.toFixed(2)} €</td>
                                <td className="p-4 text-right">{t.vatAmount.toFixed(2)} €</td>
                                <td className="p-4 text-right font-bold">{t.totalAmount.toFixed(2)} €</td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </div>
        </div>
    );
};

export default Expenses;
