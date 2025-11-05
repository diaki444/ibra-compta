import { GoogleGenAI, Type } from "@google/genai";
import { AiMessageSource } from '../types';

// FIX: Initialize the GoogleGenAI client according to the new guidelines.
// The API key must be read from `process.env.API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are a helpful accounting assistant for a self-employed person in Belgium named IBRA-COMPTA.
Provide clear, concise, and accurate information related to Belgian accounting, VAT, taxes, and business management.
When asked about complex topics, advise consulting a professional accountant.
Answer in French.`;

export const getAiChatResponse = async (
    prompt: string,
    useGoogleSearch: boolean,
    useThinkingMode: boolean
): Promise<{ text: string, sources: AiMessageSource[] }> => {

    const model = useThinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    
    const config: any = {
        systemInstruction,
    };
    
    if (useThinkingMode) {
        // Use max thinking budget for deep analysis with the pro model.
        config.thinkingConfig = { thinkingBudget: 32768 };
    }
    
    if (useGoogleSearch) {
        config.tools = [{ googleSearch: {} }];
    }

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: config,
        });

        const text = response.text;
        let sources: AiMessageSource[] = [];

        if (useGoogleSearch && response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            sources = response.candidates[0].groundingMetadata.groundingChunks
                .filter((chunk: any) => chunk.web && chunk.web.uri)
                .map((chunk: any) => ({
                    uri: chunk.web.uri,
                    title: chunk.web.title || chunk.web.uri,
                }));
        }

        return { text, sources };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("The AI assistant failed to respond. Please check your connection or API key and try again.");
    }
};


export const analyzeReceiptImage = async (base64ImageData: string, mimeType: string): Promise<any> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Analyze this receipt image and extract the following information in JSON format: merchant name (source), transaction date (date in YYYY-MM-DD format), total amount (totalAmount), VAT amount (vatAmount), amount before VAT (amountExVat), and a suggested expense category from this list: Carburant, Entretien, Assurance, Téléphone, Internet, Restaurant, Fournitures de bureau, Autre. If a value isn't present, omit the key or set it to null.`;
    
    const receiptSchema = {
        type: Type.OBJECT,
        properties: {
            source: { type: Type.STRING, description: "Merchant name" },
            date: { type: Type.STRING, description: "Transaction date (YYYY-MM-DD)" },
            totalAmount: { type: Type.NUMBER, description: "Total amount including VAT" },
            vatAmount: { type: Type.NUMBER, description: "VAT amount" },
            amountExVat: { type: Type.NUMBER, description: "Amount excluding VAT" },
        }
    };

    try {
        const imagePart = {
            inlineData: {
                data: base64ImageData,
                mimeType: mimeType
            }
        };

        const response = await ai.models.generateContent({
            model,
            contents: { parts: [ {text: prompt}, imagePart ] },
            config: {
                responseMimeType: "application/json",
                responseSchema: receiptSchema
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error analyzing receipt image:", error);
        throw new Error("Failed to analyze the receipt. The image might be unclear or the format isn't supported.");
    }
};
