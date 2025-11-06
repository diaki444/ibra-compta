import React, { useState, useRef, useEffect, useMemo } from 'react';
import { getAiChatResponse } from '../services/geminiService';
import { AiMessage, Transaction, Invoice, UserProfile } from '../types';

const suggestedQuestions = [
    "Quel est mon bénéfice total jusqu'à présent ?",
    "Ai-je des factures impayées ?",
    "Quelles ont été mes plus grosses dépenses ce mois-ci ?",
    "Donne-moi un résumé de mon activité financière."
];

interface AiAssistantProps {
  transactions: Transaction[];
  invoices: Invoice[];
  profile: UserProfile;
  prefilledQuestion: string;
  onPrefilledQuestionUsed: () => void;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ transactions, invoices, profile, prefilledQuestion, onPrefilledQuestionUsed }) => {
    const [messages, setMessages] = useState<AiMessage[]>([
        { sender: 'ai', text: `Bonjour ${profile.name.split(' ')[0]} ! Je suis Binta, votre assistante IA. Comment puis-je vous aider avec votre comptabilité aujourd'hui ?` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [useGoogleSearch, setUseGoogleSearch] = useState(false);
    const [useThinkingMode, setUseThinkingMode] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const createDataContext = useMemo(() => {
        const totalRevenues = transactions.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.totalAmount, 0);
        const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.totalAmount, 0);
        const netBalance = totalRevenues - totalExpenses;
        const overdueInvoices = invoices.filter(i => i.status === 'Impayée' || (i.status === 'En attente' && new Date(i.dueDate) < new Date()));
        const overdueTotal = overdueInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

        return `
--- Données Financières pour ${profile.name} (${profile.companyName}) ---
- Revenus totaux enregistrés : ${totalRevenues.toFixed(2)} €
- Dépenses totales enregistrées : ${totalExpenses.toFixed(2)} €
- Solde net (bénéfice/déficit) : ${netBalance.toFixed(2)} €
- Nombre de factures en retard ou impayées : ${overdueInvoices.length}
- Montant total de ces factures : ${overdueTotal.toFixed(2)} €
- Nombre total de transactions : ${transactions.length}
- Nombre total de factures : ${invoices.length}
--- Fin des Données ---
        `;
    }, [transactions, invoices, profile]);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        if (useThinkingMode) {
            setUseGoogleSearch(false);
        }
    }, [useThinkingMode]);

    useEffect(() => {
        if (useGoogleSearch) {
            setUseThinkingMode(false);
        }
    }, [useGoogleSearch]);
    
    useEffect(() => {
        if (prefilledQuestion) {
            setInput(prefilledQuestion);
            handleSend(prefilledQuestion);
            onPrefilledQuestionUsed();
        }
    }, [prefilledQuestion]);


    const handleSend = async (messageToSend?: string) => {
        const textToSend = messageToSend || input;
        if (textToSend.trim() === '' || isLoading) return;

        const userMessage: AiMessage = { sender: 'user', text: textToSend };
        setMessages(prev => [...prev, userMessage]);
        
        const historyForApi: AiMessage[] = [
            ...messages,
            { sender: 'user' as const, text: textToSend }
        ].slice(-20);

        if (!messageToSend) {
            setInput('');
        }
        setIsLoading(true);

        try {
            const { text, sources } = await getAiChatResponse(historyForApi, useGoogleSearch, useThinkingMode, createDataContext);
            const aiMessage: AiMessage = { sender: 'ai', text, sources };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: AiMessage = { sender: 'ai', text: "Désolé, une erreur s'est produite. Veuillez réessayer." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
        handleSend(suggestion);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8.5rem)] bg-gray-800 border border-gray-700 rounded-lg">
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xl p-3 rounded-lg shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-3 pt-2 border-t border-gray-600">
                                    <h4 className="text-xs font-semibold text-gray-400 mb-1">Sources:</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {msg.sources.map((source, i) => (
                                            <li key={i} className="text-xs">
                                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate">
                                                    {source.title}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="max-w-lg p-3 rounded-lg bg-gray-700 text-gray-300">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-75"></div>
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-700">
                 
                {!isLoading && messages.length > 0 && messages[messages.length - 1].sender === 'ai' && (
                    <div className="mb-3">
                        <p className="text-xs text-gray-400 mb-2">Suggestions :</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestedQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestionClick(q)}
                                    className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs py-1 px-3 rounded-full transition"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                 <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Posez votre question à Binta..."
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg p-2 text-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        disabled={isLoading}
                    />
                    <button onClick={() => handleSend()} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed">
                        Envoyer
                    </button>
                </div>
                <div className="flex items-center space-x-4 mt-3">
                    <label className="flex items-center text-xs text-gray-400 cursor-pointer">
                        <input type="checkbox" checked={useGoogleSearch} onChange={(e) => setUseGoogleSearch(e.target.checked)} className="form-checkbox h-4 w-4 bg-gray-600 border-gray-500 text-blue-500 focus:ring-blue-500 rounded" />
                        <span className="ml-2">Recherche Google</span>
                    </label>
                     <label className="flex items-center text-xs text-gray-400 cursor-pointer">
                        <input type="checkbox" checked={useThinkingMode} onChange={(e) => setUseThinkingMode(e.target.checked)} className="form-checkbox h-4 w-4 bg-gray-600 border-gray-500 text-blue-500 focus:ring-blue-500 rounded" />
                        <span className="ml-2">Analyse Approfondie (Pro)</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default AiAssistant;