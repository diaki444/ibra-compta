export type Page = 'dashboard' | 'revenues' | 'expenses' | 'vat' | 'invoicing' | 'reports' | 'ai-assistant' | 'profile';

export type TransactionType = 'revenue' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  source: string; // or category for expenses
  description?: string;
  amountExVat: number;
  vatRate: number; // as percentage, e.g., 21
  totalAmount: number;
  vatAmount: number;
  date: string;
  paymentMethod: 'Bank Transfer' | 'Cash' | 'Card';
  receiptUrl?: string;
}

export type InvoiceStatus = 'Payée' | 'En attente' | 'Impayée';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientAddress: string;
  serviceDescription: string;
  amountExVat: number;
  vatRate: number;
  totalAmount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
}

export interface AiMessageSource {
  uri: string;
  title: string;
}

export interface AiMessage {
  sender: 'user' | 'ai';
  text: string;
  sources?: AiMessageSource[];
}

export interface UserProfile {
  name: string;
  companyName: string;
  vatNumber: string;
  address: string;
  email: string;
  phone: string;
}
