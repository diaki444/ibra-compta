import { supabase } from './supabaseClient';
import { Transaction } from '../types';

export const transactionService = {
  async getTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map(t => ({
      id: t.id,
      type: t.type as 'revenue' | 'expense',
      source: t.source,
      description: t.description || undefined,
      amountExVat: Number(t.amount_ex_vat),
      vatRate: Number(t.vat_rate),
      totalAmount: Number(t.total_amount),
      vatAmount: Number(t.vat_amount),
      date: t.date,
      paymentMethod: t.payment_method as 'Bank Transfer' | 'Cash' | 'Card',
      receiptUrl: t.receipt_url || undefined,
      status: t.status as 'Payé' | 'Non payé' | undefined,
    }));
  },

  async addTransaction(userId: string, transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: transaction.type,
        source: transaction.source,
        description: transaction.description || null,
        amount_ex_vat: transaction.amountExVat,
        vat_rate: transaction.vatRate,
        total_amount: transaction.totalAmount,
        vat_amount: transaction.vatAmount,
        date: transaction.date,
        payment_method: transaction.paymentMethod,
        receipt_url: transaction.receiptUrl || null,
        status: transaction.status || 'Payé',
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      type: data.type as 'revenue' | 'expense',
      source: data.source,
      description: data.description || undefined,
      amountExVat: Number(data.amount_ex_vat),
      vatRate: Number(data.vat_rate),
      totalAmount: Number(data.total_amount),
      vatAmount: Number(data.vat_amount),
      date: data.date,
      paymentMethod: data.payment_method as 'Bank Transfer' | 'Cash' | 'Card',
      receiptUrl: data.receipt_url || undefined,
      status: data.status as 'Payé' | 'Non payé' | undefined,
    };
  },

  async updateTransaction(userId: string, transaction: Transaction): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .update({
        type: transaction.type,
        source: transaction.source,
        description: transaction.description || null,
        amount_ex_vat: transaction.amountExVat,
        vat_rate: transaction.vatRate,
        total_amount: transaction.totalAmount,
        vat_amount: transaction.vatAmount,
        date: transaction.date,
        payment_method: transaction.paymentMethod,
        receipt_url: transaction.receiptUrl || null,
        status: transaction.status || 'Payé',
      })
      .eq('id', transaction.id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async deleteTransaction(userId: string, transactionId: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', userId);

    if (error) throw error;
  },
};
