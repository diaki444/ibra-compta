import { supabase } from './supabaseClient';
import { Invoice, InvoiceStatus } from '../types';

export const invoiceService = {
  async getInvoices(userId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('issue_date', { ascending: false });

    if (error) throw error;

    return (data || []).map(i => ({
      id: i.id,
      invoiceNumber: i.invoice_number,
      clientName: i.client_name,
      clientAddress: i.client_address,
      clientVatNumber: i.client_vat_number,
      serviceDescription: i.service_description,
      amountExVat: Number(i.amount_ex_vat),
      vatRate: Number(i.vat_rate),
      totalAmount: Number(i.total_amount),
      issueDate: i.issue_date,
      dueDate: i.due_date,
      status: i.status as InvoiceStatus,
    }));
  },

  async addInvoice(userId: string, invoice: Omit<Invoice, 'id' | 'invoiceNumber'>): Promise<Invoice> {
    const { data: existingInvoices, error: countError } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (countError) throw countError;

    let nextNumber = 1;
    if (existingInvoices && existingInvoices.length > 0) {
      const lastNumber = existingInvoices[0].invoice_number;
      const match = lastNumber.match(/INV-(\d{4})-(\d{4})/);
      if (match) {
        nextNumber = parseInt(match[2], 10) + 1;
      }
    }

    const year = new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${String(nextNumber).padStart(4, '0')}`;

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        user_id: userId,
        invoice_number: invoiceNumber,
        client_name: invoice.clientName,
        client_address: invoice.clientAddress,
        client_vat_number: invoice.clientVatNumber,
        service_description: invoice.serviceDescription,
        amount_ex_vat: invoice.amountExVat,
        vat_rate: invoice.vatRate,
        total_amount: invoice.totalAmount,
        issue_date: invoice.issueDate,
        due_date: invoice.dueDate,
        status: invoice.status,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      invoiceNumber: data.invoice_number,
      clientName: data.client_name,
      clientAddress: data.client_address,
      clientVatNumber: data.client_vat_number,
      serviceDescription: data.service_description,
      amountExVat: Number(data.amount_ex_vat),
      vatRate: Number(data.vat_rate),
      totalAmount: Number(data.total_amount),
      issueDate: data.issue_date,
      dueDate: data.due_date,
      status: data.status as InvoiceStatus,
    };
  },

  async updateInvoice(userId: string, invoice: Invoice): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .update({
        invoice_number: invoice.invoiceNumber,
        client_name: invoice.clientName,
        client_address: invoice.clientAddress,
        client_vat_number: invoice.clientVatNumber,
        service_description: invoice.serviceDescription,
        amount_ex_vat: invoice.amountExVat,
        vat_rate: invoice.vatRate,
        total_amount: invoice.totalAmount,
        issue_date: invoice.issueDate,
        due_date: invoice.dueDate,
        status: invoice.status,
      })
      .eq('id', invoice.id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async updateInvoiceStatus(userId: string, invoiceId: string, status: InvoiceStatus): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .update({ status })
      .eq('id', invoiceId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async deleteInvoice(userId: string, invoiceId: string): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId)
      .eq('user_id', userId);

    if (error) throw error;
  },
};
