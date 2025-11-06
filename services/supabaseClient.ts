import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          name: string;
          company_name: string;
          vat_number: string;
          address: string;
          email: string;
          phone: string;
          alert_settings: {
            lowBalance: { enabled: boolean; threshold: number };
            overdueInvoice: { enabled: boolean; days: number };
            upcomingInvoice: { enabled: boolean; days: number };
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          company_name?: string;
          vat_number?: string;
          address?: string;
          email?: string;
          phone?: string;
          alert_settings?: {
            lowBalance: { enabled: boolean; threshold: number };
            overdueInvoice: { enabled: boolean; days: number };
            upcomingInvoice: { enabled: boolean; days: number };
          };
        };
        Update: {
          name?: string;
          company_name?: string;
          vat_number?: string;
          address?: string;
          email?: string;
          phone?: string;
          alert_settings?: {
            lowBalance: { enabled: boolean; threshold: number };
            overdueInvoice: { enabled: boolean; days: number };
            upcomingInvoice: { enabled: boolean; days: number };
          };
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'revenue' | 'expense';
          source: string;
          description: string | null;
          amount_ex_vat: number;
          vat_rate: number;
          total_amount: number;
          vat_amount: number;
          date: string;
          payment_method: string;
          receipt_url: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'revenue' | 'expense';
          source: string;
          description?: string | null;
          amount_ex_vat: number;
          vat_rate: number;
          total_amount: number;
          vat_amount: number;
          date: string;
          payment_method: string;
          receipt_url?: string | null;
          status?: string;
        };
        Update: {
          type?: 'revenue' | 'expense';
          source?: string;
          description?: string | null;
          amount_ex_vat?: number;
          vat_rate?: number;
          total_amount?: number;
          vat_amount?: number;
          date?: string;
          payment_method?: string;
          receipt_url?: string | null;
          status?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          user_id: string;
          invoice_number: string;
          client_name: string;
          client_address: string;
          client_vat_number: string;
          service_description: string;
          amount_ex_vat: number;
          vat_rate: number;
          total_amount: number;
          issue_date: string;
          due_date: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          invoice_number: string;
          client_name: string;
          client_address: string;
          client_vat_number: string;
          service_description: string;
          amount_ex_vat: number;
          vat_rate: number;
          total_amount: number;
          issue_date: string;
          due_date: string;
          status?: string;
        };
        Update: {
          invoice_number?: string;
          client_name?: string;
          client_address?: string;
          client_vat_number?: string;
          service_description?: string;
          amount_ex_vat?: number;
          vat_rate?: number;
          total_amount?: number;
          issue_date?: string;
          due_date?: string;
          status?: string;
        };
      };
    };
  };
}
