import React, { useState, useRef, useEffect } from 'react';
import { getAiChatResponse } from '../services/geminiService';
import { AiMessage } from '../types';

const AiAssistant: React.FC = () => {
    const [messages, setMessages] = useState<AiMessage[]>([
        { sender: 'ai', text: "Bonjour ! Je suis l'assistant IA d'IBRA-COMPTA. Comment puis-je vous aider avec votre comptabilité aujourd'hui ?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [useGoogleSearch, setUseGoogleSearch] = useState(false);
    const [useThinkingMode, setUseThinkingMode] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        // Ensure only one advanced mode is active at a time
        if (useThinkingMode) {
            setUseGoogleSearch(false);
        }
    }, [useThinkingMode]);

    useEffect(() => {
        if (useGoogleSearch) {
            setUseThinkingMode(false);
        }
    }, [useGoogleSearch]);


    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: AiMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const { text, sources } = await getAiChatResponse(input, useGoogleSearch, useThinkingMode);
            const aiMessage: AiMessage = { sender: 'ai', text, sources };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: AiMessage = { sender: 'ai', text: "Désolé, une erreur s'est produite. Veuillez réessayer." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] bg-gray-800 rounded-lg shadow-lg border border-gray-700">
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xl p-3 rounded-lg ${msg.sender === 'user' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
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
                        <div className="max-w-lg p-3 rounded-lg bg-gray-700 text-gray-200">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-75"></div>
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-150"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-700">
                 <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Posez votre question ici..."
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-red-800 disabled:cursor-not-allowed">
                        Envoyer
                    </button>
                </div>
                <div className="flex items-center space-x-4 mt-3">
                    <label className="flex items-center text-xs text-gray-400 cursor-pointer">
                        <input type="checkbox" checked={useGoogleSearch} onChange={(e) => setUseGoogleSearch(e.target.checked)} className="form-checkbox h-4 w-4 bg-gray-700 border-gray-600 text-red-600 focus:ring-red-500 rounded" />
                        <span className="ml-2">Recherche Google</span>
                    </label>
                     <label className="flex items-center text-xs text-gray-400 cursor-pointer">
                        <input type="checkbox" checked={useThinkingMode} onChange={(e) => setUseThinkingMode(e.target.checked)} className="form-checkbox h-4 w-4 bg-gray-700 border-gray-600 text-red-600 focus:ring-red-500 rounded" />
                        <span className="ml-2">Analyse Approfondie (Pro)</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default AiAssistant;