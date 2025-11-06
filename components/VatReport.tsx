import React, { useMemo, useState } from 'react';
import { Transaction, Invoice, UserProfile } from '../types';
import Card from './Card';
import { VatIcon, UsersIcon, PiggyBankIcon, ArchiveIcon, AiIcon } from './icons';

interface VatReportProps {
    transactions: Transaction[];
    invoices: Invoice[];
    profile: UserProfile;
    onAskAi: (question: string) => void;
}

const VatReport: React.FC<VatReportProps> = ({ transactions, invoices, profile, onAskAi }) => {
    const [activeTab, setActiveTab] = useState('vat');
    
    const inputStyle = "w-full bg-gray-700 border-gray-600 p-2 rounded-lg text-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition";
    const buttonStyle = "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition";

    const TabButton: React.FC<{ tabName: string; label: string; icon: React.FC }> = ({ tabName, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                activeTab === tabName
                    ? 'text-blue-400 border-blue-400'
                    : 'text-gray-400 border-transparent hover:text-white hover:border-gray-500'
            }`}
        >
            <Icon />
            <span>{label}</span>
        </button>
    );

    const SummaryCard: React.FC<{ title: string; value: string; className?: string; }> = ({ title, value, className }) => (
        <Card className={className}>
            <h4 className="text-sm font-medium text-gray-400">{title}</h4>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </Card>
    );
    
    // VAT Tab Content
    const VatTabContent = () => {
        const currentYear = new Date().getFullYear();
        const [vatYear, setVatYear] = useState(currentYear);
        const [vatQuarter, setVatQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);

        const { vatOnSales, vatOnPurchases, vatBalance } = useMemo(() => {
            const startDate = new Date(vatYear, (vatQuarter - 1) * 3, 1);
            const endDate = new Date(vatYear, vatQuarter * 3, 0);
            endDate.setHours(23, 59, 59, 999);

            const filteredTransactions = transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate >= startDate && tDate <= endDate;
            });

            const revenues = filteredTransactions.filter(t => t.type === 'revenue');
            const expenses = filteredTransactions.filter(t => t.type === 'expense');
            const vatOnSales = revenues.reduce((sum, t) => sum + t.vatAmount, 0);
            const vatOnPurchases = expenses.reduce((sum, t) => sum + t.vatAmount, 0);
            return { vatOnSales, vatOnPurchases, vatBalance: vatOnSales - vatOnPurchases };
        }, [transactions, vatYear, vatQuarter]);

        const handleAskBinta = () => {
            const question = `Mon calcul de TVA pour le trimestre ${vatQuarter} de l'année ${vatYear} montre un solde de ${vatBalance.toFixed(2)} €. Peux-tu analyser ma situation et me donner des conseils ?`;
            onAskAi(question);
        };

        return (
            <div className="space-y-6">
                 <Card>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                         <div>
                             <label className="text-sm text-gray-400 mb-1 block">Année</label>
                             <select value={vatYear} onChange={e => setVatYear(parseInt(e.target.value))} className={inputStyle}>
                                 {[0, 1, 2, 3].map(i => <option key={currentYear - i} value={currentYear - i}>{currentYear - i}</option>)}
                             </select>
                         </div>
                         <div>
                             <label className="text-sm text-gray-400 mb-1 block">Trimestre</label>
                             <select value={vatQuarter} onChange={e => setVatQuarter(parseInt(e.target.value))} className={inputStyle}>
                                 <option value="1">Trimestre 1 (Jan-Mar)</option>
                                 <option value="2">Trimestre 2 (Avr-Juin)</option>
                                 <option value="3">Trimestre 3 (Juil-Sep)</option>
                                 <option value="4">Trimestre 4 (Oct-Dec)</option>
                             </select>
                         </div>
                         <p className="text-xs text-gray-500 pb-2 md:text-left text-center">Sélectionnez la période pour voir le calcul de TVA correspondant.</p>
                     </div>
                 </Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SummaryCard title="TVA que vous avez facturée" value={`+ ${vatOnSales.toFixed(2)} €`} />
                    <SummaryCard title="TVA que vous pouvez récupérer" value={`- ${vatOnPurchases.toFixed(2)} €`} />
                    <SummaryCard 
                        title={vatBalance >= 0 ? "TVA à payer au Fisc" : "TVA à récupérer du Fisc"}
                        value={`${vatBalance.toFixed(2)} €`}
                        className={vatBalance >= 0 ? 'bg-red-900/50 border-red-700' : 'bg-green-900/50 border-green-700'}
                    />
                </div>
                <Card>
                    <h3 className="text-xl font-semibold text-white mb-4">Votre calcul de TVA expliqué</h3>
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-700/50 rounded-lg">
                            <span className="text-gray-300">TVA facturée à vos clients</span>
                            <span className="font-mono text-green-400 mt-1 sm:mt-0">+ {vatOnSales.toFixed(2)} €</span>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-700/50 rounded-lg">
                            <span className="text-gray-300">TVA payée sur vos dépenses (récupérable)</span>
                            <span className="font-mono text-red-400 mt-1 sm:mt-0">- {vatOnPurchases.toFixed(2)} €</span>
                        </div>
                        <hr className="border-gray-700" />
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-700 rounded-lg font-bold text-lg">
                            <span className="text-white">Solde à payer / à récupérer</span>
                            <span className="font-mono text-white mt-1 sm:mt-0">{vatBalance.toFixed(2)} €</span>
                        </div>
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        <button onClick={() => alert("Génération PDF lancée...")} className={buttonStyle}>Exporter PDF</button>
                        <button onClick={() => alert("Génération CSV lancée...")} className="bg-gray-600 hover:bg-gray-500 text-gray-200 font-bold py-2 px-4 rounded-lg transition">Exporter pour le Fisc</button>
                    </div>
                </Card>
                <Card>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-semibold text-white">Conseils de l'assistant IA</h3>
                            <p className="text-sm text-gray-400 mt-1">Binta peut analyser votre situation et vous donner des conseils personnalisés.</p>
                        </div>
                        <button onClick={handleAskBinta} className={`flex-shrink-0 flex items-center gap-2 ${buttonStyle}`}>
                            <AiIcon />
                            <span>Demander conseil à Binta</span>
                        </button>
                    </div>
                </Card>
            </div>
        );
    };

    // Social Contributions Tab Content
    const SocialTabContent = () => {
        const [quarterlyPayment, setQuarterlyPayment] = useState('800');
        const [provider, setProvider] = useState('Acerta');
        const [suggestion, setSuggestion] = useState<string | null>(null);

        const estimatedAnnualIncome = useMemo(() => {
            if (transactions.length < 1) return 0;
            const profitSoFar = transactions.reduce((acc, t) => {
                return t.type === 'revenue' ? acc + t.amountExVat : acc - t.amountExVat;
            }, 0);
            if (profitSoFar <= 0) return 0;
            const firstDate = new Date(Math.min(...transactions.map(t => new Date(t.date).getTime())));
            const today = new Date();
            const daysPassed = Math.max(1, (today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
            return (profitSoFar / daysPassed) * 365;
        }, [transactions]);

        const handleCalculateSuggestion = () => {
            const income = estimatedAnnualIncome;
            if (income <= 0) {
                setSuggestion("Le calcul ne peut être fait car votre revenu estimé est nul ou négatif.");
                return;
            }
            const requiredAnnualContribution = income * 0.205; // Simplified 20.5% rate
            const requiredQuarterlyContribution = requiredAnnualContribution / 4;
            const currentQuarterly = parseFloat(quarterlyPayment);
            const difference = requiredQuarterlyContribution - currentQuarterly;

            let suggestionText = `Pour être en ordre, votre cotisation trimestrielle devrait être d'environ **${requiredQuarterlyContribution.toFixed(2)} €**.\n`;
            if (difference > 10) {
                suggestionText += `Vous payez actuellement ${currentQuarterly.toFixed(2)} €. Il serait prudent de contacter **${provider}** pour augmenter vos paiements de **${difference.toFixed(2)} €** par trimestre. Cela vous évitera une grosse facture de régularisation plus tard.`;
            } else if (difference < -10) {
                suggestionText += `Vous payez actuellement ${currentQuarterly.toFixed(2)} €. Vos paiements semblent suffisants. Vous pourriez contacter **${provider}** pour les ajuster à la baisse si vous le souhaitez.`;
            } else {
                suggestionText += `Excellent ! Vos paiements actuels de ${currentQuarterly.toFixed(2)} € sont bien alignés sur vos revenus. Continuez comme ça !`;
            }
            setSuggestion(suggestionText);
        };
        
        return (
            <div className="space-y-6">
                <Card>
                    <h3 className="text-xl font-semibold text-white mb-4">Estimez vos Cotisations Sociales</h3>
                    <p className="text-sm text-gray-400 mb-6">Vos cotisations sociales sont basées sur vos revenus. Payer le bon montant chaque trimestre vous évite une grosse facture de régularisation. Vérifions si vos paiements actuels sont adaptés.</p>
                    <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg mb-6 text-center">
                        <h4 className="text-sm font-medium text-gray-400">Votre revenu annuel estimé (calculé automatiquement) :</h4>
                        <p className="text-3xl font-bold text-white mt-1">{estimatedAnnualIncome.toFixed(2)} €</p>
                        <p className="text-xs text-gray-500 mt-1">Basé sur le bénéfice (Revenus - Dépenses) enregistré dans l'application.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Ce que vous payez par trimestre</label>
                            <input type="number" value={quarterlyPayment} onChange={e => setQuarterlyPayment(e.target.value)} placeholder="ex: 800" className={inputStyle} />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Votre caisse sociale</label>
                            <select value={provider} onChange={e => setProvider(e.target.value)} className={inputStyle}>
                                <option>Acerta</option><option>UCM</option><option>Partena</option><option>Liantis</option><option>Autre</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end mt-6">
                        <button onClick={handleCalculateSuggestion} className={buttonStyle}>Analyser ma situation</button>
                    </div>
                    {suggestion && (
                        <div className="mt-6 p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                            <h4 className="font-semibold text-white mb-2">Notre conseil</h4>
                            <p className="text-gray-300 text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: suggestion.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-400">$1</strong>') }}></p>
                        </div>
                    )}
                </Card>
            </div>
        );
    };
    
    // Advance Tax Payments Tab Content
    const TaxTabContent = () => {
        const estimatedAnnualIncome = useMemo(() => {
             if (transactions.length < 1) return 0;
            const profitSoFar = transactions.reduce((acc, t) => t.type === 'revenue' ? acc + t.amountExVat : acc - t.amountExVat, 0);
            if (profitSoFar <= 0) return 0;
            const firstDate = new Date(Math.min(...transactions.map(t => new Date(t.date).getTime())));
            const today = new Date();
            const daysPassed = Math.max(1, (today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
            return (profitSoFar / daysPassed) * 365;
        }, [transactions]);
        
        const estimatedTax = useMemo(() => (estimatedAnnualIncome > 0) ? estimatedAnnualIncome * 0.25 : 0, [estimatedAnnualIncome]);

        const advanceTaxData = useMemo(() => {
            const tax = estimatedTax;
            if (isNaN(tax) || tax <= 0) return null;
            const taxIncreaseRate = 0.0675;
            const totalIncrease = tax * taxIncreaseRate;
            const bonusRates = { q1: 0.09, q2: 0.075, q3: 0.06, q4: 0.045 };
            const payments = {
                q1: totalIncrease / bonusRates.q1, q2: totalIncrease / bonusRates.q2,
                q3: totalIncrease / bonusRates.q3, q4: totalIncrease / bonusRates.q4,
            };
            return { totalIncrease, payments };
        }, [estimatedTax]);

        return (
            <div className="space-y-6">
                <Card>
                    <p className="text-sm text-gray-400 mb-4 text-center">Le fisc vous récompense si vous payez vos impôts à l'avance. Si vous ne le faites pas, une pénalité s'applique. Voici comment l'éviter complètement.</p>
                    <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg mb-4 text-center">
                        <h4 className="text-sm font-medium text-gray-400">Votre impôt estimé pour cette année (auto) :</h4>
                        <p className="text-3xl font-bold text-white mt-1">{estimatedTax.toFixed(2)} €</p>
                    </div>
                    {advanceTaxData ? (
                        <div>
                            <div className="p-4 bg-red-900/40 border border-red-700 rounded-lg text-center mb-6">
                                <p className="text-red-300">La pénalité du Fisc si vous ne payez rien à l'avance est de :</p>
                                <p className="text-2xl font-bold text-white mt-1">{advanceTaxData.totalIncrease.toFixed(2)} €</p>
                            </div>
                            <h4 className="font-semibold text-white mb-2">Payez <span className="font-bold text-blue-400">UN SEUL</span> de ces montants pour annuler la pénalité :</h4>
                            <p className="text-xs text-gray-400 mb-4">Plus vous payez tôt, moins le montant est élevé !</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {(Object.keys(advanceTaxData.payments) as Array<keyof typeof advanceTaxData.payments>).map((q, i) => (
                                    <div key={q} className="p-4 bg-gray-700/50 rounded-lg text-center">
                                        <p className="font-bold text-gray-300">Trimestre {i + 1}</p>
                                        <p className="text-xs text-gray-400">Avant le {["10/04", "10/07", "10/10", "20/12"][i]}</p>
                                        <p className="text-xl font-mono text-green-400 mt-2">{advanceTaxData.payments[q].toFixed(2)} €</p>
                                    </div>
                                ))}
                            </div>
                            <Card className="mt-6 bg-blue-900/30 border-blue-700">
                                <h5 className="font-bold text-blue-300 mb-2">L'Astuce du Pro</h5>
                                <p className="text-sm text-blue-200/90">Remarquez la différence ! Payer au premier trimestre demande moins d'argent pour le même résultat. Si votre trésorerie le permet, payer le montant du **Trimestre 1** suffit à annuler toute la pénalité for l'année. C'est la méthode la plus efficace !</p>
                            </Card>
                        </div>
                    ) : (
                        <div className="p-6 bg-green-900/40 border border-green-700 rounded-lg text-center">
                            <p className="font-semibold text-green-300">Félicitations !</p>
                            <p className="text-sm text-gray-300 mt-1">Sur la base de vos données, votre bénéfice n'entraîne pas d'impôt à payer. Vous n'avez donc pas besoin de faire de versements anticipés.</p>
                        </div>
                    )}
                </Card>
            </div>
        );
    };

    // Annual Closing Tab Content
    const AnnualClosingTabContent = () => {
        const currentYear = new Date().getFullYear();
        const [annualYear, setAnnualYear] = useState(currentYear - 1);
        const [finalTax, setFinalTax] = useState('');
        const [paidAdvances, setPaidAdvances] = useState('');

        const ippData = useMemo(() => {
            const filtered = transactions.filter(t => new Date(t.date).getFullYear() === annualYear);
            const revenues = filtered.filter(t => t.type === 'revenue').reduce((s, t) => s + t.amountExVat, 0);
            const expenses = filtered.filter(t => t.type === 'expense');
            const totalExpenses = expenses.reduce((s, t) => s + t.amountExVat, 0);
            const netProfit = revenues - totalExpenses;
            const expensesByCategory = expenses.reduce((acc, exp) => {
                const category = exp.source.split(' - ')[0];
                acc[category] = (acc[category] || 0) + exp.amountExVat;
                return acc;
            }, {} as Record<string, number>);
            return { revenues, totalExpenses, netProfit, expensesByCategory };
        }, [transactions, annualYear]);
        
        const ippBalance = useMemo(() => (parseFloat(finalTax) || 0) - (parseFloat(paidAdvances) || 0), [finalTax, paidAdvances]);

        const clientListing = useMemo(() => {
            const clientData = invoices.filter(i => new Date(i.issueDate).getFullYear() === annualYear && i.clientVatNumber && i.clientVatNumber.toUpperCase().startsWith('BE')).reduce((acc, inv) => {
                if (!acc[inv.clientVatNumber]) acc[inv.clientVatNumber] = { name: inv.clientName, total: 0 };
                acc[inv.clientVatNumber].total += inv.amountExVat;
                return acc;
            }, {} as Record<string, {name: string, total: number}>);
            return Object.entries(clientData).map(([vatNumber, data]) => ({ vatNumber, ...data })).filter(c => c.total > 250);
        }, [invoices, annualYear]);
        
        const handleExportClientListing = () => {
            const headers = ["Numéro de TVA du client", "Nom du client", "Montant total HTVA"];
            const rows = clientListing.map(c => [`"${c.vatNumber}"`, `"${c.name.replace(/"/g, '""')}"`, c.total.toFixed(2)].join(','));
            const csvContent = [headers.join(','), ...rows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `listing_clients_tva_${annualYear}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        return (
            <div className="space-y-6">
                <Card>
                    <label className="text-sm text-gray-400 mb-1 block">Sélectionner l'année du résumé</label>
                    <select value={annualYear} onChange={e => setAnnualYear(parseInt(e.target.value))} className={`${inputStyle} max-w-xs`}>
                        {[0, 1, 2, 3, 4].map(i => <option key={currentYear - i - 1} value={currentYear - i - 1}>{currentYear - i - 1}</option>)}
                    </select>
                </Card>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <Card>
                            <h3 className="text-xl font-semibold text-white mb-4">Résumé pour votre déclaration fiscale</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex flex-col sm:flex-row justify-between p-2 bg-gray-700/50 rounded"><span>Total des revenus (sans TVA)</span><span className="font-mono text-green-400">{ippData.revenues.toFixed(2)} €</span></div>
                                <div className="flex flex-col sm:flex-row justify-between p-2 bg-gray-700/50 rounded"><span>Total des dépenses professionnelles</span><span className="font-mono text-red-400">{ippData.totalExpenses.toFixed(2)} €</span></div>
                                <div className="flex flex-col sm:flex-row justify-between p-2 bg-gray-700 rounded font-bold"><span>Votre bénéfice brut</span><span className="font-mono">{ippData.netProfit.toFixed(2)} €</span></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-4">Note : Ce résumé est une estimation. Les cotisations sociales payées doivent également être déduites. Consultez toujours un comptable pour votre déclaration finale.</p>
                        </Card>
                        <Card>
                            <h3 className="text-xl font-semibold text-white mb-4">Calculez votre solde final d'impôt</h3>
                            <p className="text-sm text-gray-400 mb-4">À utiliser après avoir reçu votre note d'impôts (Avertissement-Extrait de Rôle).</p>
                            <div className="space-y-4">
                                <input type="number" value={finalTax} onChange={e => setFinalTax(e.target.value)} placeholder="Montant total de l'impôt" className={inputStyle} />
                                <input type="number" value={paidAdvances} onChange={e => setPaidAdvances(e.target.value)} placeholder="Ce que vous avez déjà payé en avance" className={inputStyle} />
                                <div className={`p-3 rounded-lg text-center ${ippBalance > 0 ? 'bg-red-900/50' : 'bg-green-900/50'}`}>
                                    <span className="text-sm text-gray-400">{ippBalance >= 0 ? 'Solde à Payer' : 'Montant à Récupérer'}</span>
                                    <p className="font-bold text-2xl text-white font-mono">{Math.abs(ippBalance).toFixed(2)} €</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <Card>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                            <h3 className="text-xl font-semibold text-white">Liste annuelle des clients (pour la TVA)</h3>
                            <button onClick={handleExportClientListing} disabled={clientListing.length === 0} className="bg-gray-600 hover:bg-gray-500 text-gray-200 font-bold py-2 px-4 rounded-lg transition text-sm disabled:opacity-50 disabled:cursor-not-allowed">Exporter CSV</button>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">C'est la liste obligatoire pour le fisc de vos clients belges assujettis à la TVA à qui vous avez facturé plus de 250€ (sans TVA) durant l'année {annualYear}.</p>
                        <div className="overflow-auto max-h-96">
                            {clientListing.length > 0 ? (
                                <table className="w-full text-left text-sm">
                                    <thead className="sticky top-0 bg-gray-800"><tr className="border-b border-gray-600"><th className="p-2">Client</th><th className="p-2">N° TVA</th><th className="p-2 text-right">Montant Total (sans TVA)</th></tr></thead>
                                    <tbody>{clientListing.map(c => (<tr key={c.vatNumber} className="border-b border-gray-700"><td className="p-2">{c.name}</td><td className="p-2 font-mono">{c.vatNumber}</td><td className="p-2 text-right font-mono">{c.total.toFixed(2)} €</td></tr>))}</tbody>
                                </table>
                            ) : (
                                <p className="text-center text-gray-500 py-8">Aucun client ne remplit les conditions pour cette année.</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        )
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-700">
                <div className="flex space-x-2 overflow-x-auto">
                    <TabButton tabName="vat" label="Calcul TVA" icon={VatIcon} />
                    <TabButton tabName="social" label="Cotisations Sociales" icon={UsersIcon} />
                    <TabButton tabName="tax" label="Paiement anticipé d'impôts" icon={PiggyBankIcon} />
                    <TabButton tabName="annual" label="Résumé Annuel" icon={ArchiveIcon} />
                </div>
            </div>

            <div>
                {activeTab === 'vat' && <VatTabContent />}
                {activeTab === 'social' && <SocialTabContent />}
                {activeTab === 'tax' && <TaxTabContent />}
                {activeTab === 'annual' && <AnnualClosingTabContent />}
            </div>
        </div>
    );
};

export default VatReport;