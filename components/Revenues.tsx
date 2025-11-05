import React, { useState, useRef } from 'react';
import { Transaction } from '../types';
import { analyzeReceiptImage } from '../services/geminiService';

interface RevenuesProps {
    transactions: Transaction[];
    addTransactions: (transactions: Omit<Transaction, 'id'>[]) => void;
}

const Revenues: React.FC<RevenuesProps> = ({ transactions, addTransactions }) => {
    const [source, setSource] = useState('');
    const [amountExVat, setAmountExVat] = useState('');
    const [vatRate, setVatRate] = useState('6');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Bank Transfer' | 'Cash'>('Bank Transfer');
    
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);

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
                setSource(data.source || '');
                setAmountExVat(data.amountExVat?.toString() || '');
                const calculatedVatRate = data.totalAmount && data.amountExVat ? ((data.totalAmount / data.amountExVat) - 1) * 100 : 6;
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
                
                // Assuming 6% VAT for ride-sharing
                const vatRate = 6;
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
        
        // Reset form
        setSource('');
        setAmountExVat('');
        setVatRate('6');
        setDate(new Date().toISOString().split('T')[0]);
        setPaymentMethod('Bank Transfer');
        setImagePreview(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
         <div className="space-y-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Ajouter un revenu</h3>
                     <div>
                        <input type="file" accept=".csv" onChange={handleCsvImport} className="hidden" ref={csvInputRef} id="csv-upload"/>
                        <label htmlFor="csv-upload" className="cursor-pointer bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition duration-300">
                            Importer un CSV
                        </label>
                    </div>
                </div>
                
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
                             <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" ref={fileInputRef} id="receipt-upload-revenue" />
                             <label htmlFor="receipt-upload-revenue" className="cursor-pointer bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">
                                 Télécharger une image
                             </label>
                        </>
                    )}
                     {isAnalyzing && <p className="text-yellow-400 mt-2 text-sm">Analyse en cours...</p>}
                     {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={source} onChange={e => setSource(e.target.value)} placeholder="Source (ex: Uber, Bolt, Client)" required className="w-full bg-gray-700 p-2 rounded-md" />
                        <input value={amountExVat} onChange={e => setAmountExVat(e.target.value)} type="number" step="0.01" placeholder="Montant HTVA" required className="w-full bg-gray-700 p-2 rounded-md" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <select value={vatRate} onChange={e => setVatRate(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md">
                           <option value="6">6%</option>
                           <option value="12">12%</option>
                           <option value="21">21%</option>
                           <option value="0">0%</option>
                       </select>
                        <input value={date} onChange={e => setDate(e.target.value)} type="date" required className="w-full bg-gray-700 p-2 rounded-md" />
                         <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} className="w-full bg-gray-700 p-2 rounded-md">
                           <option value="Bank Transfer">Virement</option>
                           <option value="Card">Carte</option>
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
                            <th className="p-4">Source</th>
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

export default Revenues;
