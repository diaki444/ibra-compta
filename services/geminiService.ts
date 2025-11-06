import { GoogleGenAI, Type } from "@google/genai";
import { AiMessage, AiMessageSource } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface HistoryPart {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export const getAiChatResponse = async (
    conversationHistory: AiMessage[],
    useGoogleSearch: boolean,
    useThinkingMode: boolean,
    dataContext: string
): Promise<{ text: string, sources: AiMessageSource[] }> => {

    const model = useThinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    
    const dynamicSystemInstruction = `
        Tu es Binta, une assistante comptable personnelle pour un indépendant en Belgique.
        Ton rôle est de l'aider à comprendre et analyser ses finances en te basant sur les données de son application.
        Utilise le résumé des données en temps réel fourni ci-dessous pour répondre de manière précise et personnalisée.
        Adresse-toi à l'utilisateur de manière amicale. N'invente jamais de chiffres ; si une information n'est pas dans le résumé, dis-le.
        Quand c'est pertinent, analyse les données pour donner des conseils (ex: "Je vois que vos dépenses en carburant sont élevées ce mois-ci...").

        ${dataContext}
    `;

    const config: any = {
        systemInstruction: dynamicSystemInstruction,
    };
    
    if (useThinkingMode) {
        config.thinkingConfig = { thinkingBudget: 32768 };
    }
    
    if (useGoogleSearch) {
        config.tools = [{ googleSearch: {} }];
    }

    const contents: HistoryPart[] = conversationHistory.map(msg => ({
        role: msg.sender === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
    }));

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
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

export const analyzeReceiptImage = async (base64ImageData: string, mimeType: string, isProAnalysis: boolean): Promise<any> => {
    const model = isProAnalysis ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const prompt = `
        **ROLE:** You are an AI accountant specialized in extracting data from Belgian financial documents (receipts, invoices). Your precision is critical.

        **TASK:** Analyze the provided image of a receipt or invoice. Extract the specified information and return it ONLY as a valid JSON object matching the provided schema.

        **EXTRACTION LOGIC & RULES:**

        1.  **\`source\` (Merchant/Supplier Name):**
            *   Identify the main business name, often at the top.
            *   Be precise (e.g., "TOTALENERGIES", not just "TOTAL").

        2.  **\`date\` (Transaction Date):**
            *   Find the primary date of the transaction.
            *   Format it strictly as \`YYYY-MM-DD\`.

        3.  **Amounts (\`totalAmount\`, \`vatAmount\`, \`amountExVat\`) (CRITICAL):**
            *   This is the most important section. Accuracy is paramount.
            *   Extract the following three values directly as top-level properties:
            *   **\`amountExVat\` (pre-tax amount):** Also known as "HTVA", "Basis", "Base imposable", or "Maatstaf van heffing". This is your primary goal.
            *   **\`totalAmount\` (total amount):** Known as "TTC" or "Totaal".
            *   **\`vatAmount\` (VAT amount):** Known as "TVA" or "BTW".
            *   **Golden Rule:** If the document explicitly states the HTVA or a subtotal before tax, use that value for \`amountExVat\`. This is the most reliable figure.
            *   **Calculation Logic:** Verify your findings. \`totalAmount\` must equal \`amountExVat + vatAmount\`. If there's a minor rounding difference (e.g., 0.01), adjust to match the total.
            *   **Deduction Logic:** If you can only find the \`totalAmount\` and a VAT rate (e.g., 21%, 6%), you MUST calculate the \`amountExVat\` using the formula: \`amountExVat = totalAmount / (1 + (VAT_RATE / 100))\`. Do not mistake the total amount for the pre-tax amount.

        4.  **\`category\` (Expense Category):**
            *   Based on the \`source\` and any listed items, suggest the most logical category from this exact list: ["Carburant", "Entretien voiture", "Assurance", "Téléphone", "Internet", "Restaurant", "Fournitures de bureau", "Autre"].

        5.  **\`paymentMethod\` (Payment Method):**
            *   If the document mentions how payment was made (e.g., "Bancontact", "Visa", "Cash", "Virement"), identify it. Map it to one of: ["Card", "Bank Transfer", "Cash"].

        **FINAL INSTRUCTION:**
        *   Review your extracted data. Does it make logical sense? Is the math correct?
        *   If any field cannot be determined with high confidence, omit it from the final JSON. Do not guess.
        *   Return ONLY the JSON object, with no markdown formatting like \`\`\`json ... \`\`\`.
    `;
    
    // FIX: Re-defined the schema to ensure correctness and prevent any potential hidden character issues that could cause the reported errors.
    const receiptSchema = {
        type: Type.OBJECT,
        properties: {
            source: { type: Type.STRING, description: "The name of the merchant, supplier, or client." },
            date: { type: Type.STRING, description: "Transaction date in YYYY-MM-DD format." },
            totalAmount: { type: Type.NUMBER, description: "Total amount including VAT (TTC)." },
            vatAmount: { type: Type.NUMBER, description: "The amount of VAT (TVA)." },
            amountExVat: { type: Type.NUMBER, description: "The amount excluding VAT (HTVA)." },
            category: { type: Type.STRING, description: "Suggested expense category from the provided list. Only for expenses." },
            paymentMethod: { type: Type.STRING, description: "The method of payment, if identifiable (Card, Bank Transfer, Cash)." }
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
                responseSchema: receiptSchema,
                ...(isProAnalysis && { thinkingConfig: { thinkingBudget: 32768 } })
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error analyzing receipt image:", error);
        throw new Error("Failed to analyze the receipt. The image might be unclear or the format isn't supported.");
    }
};
