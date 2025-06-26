
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Invoice } from '../types/invoice';

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (
            *,
            gems (*)
          ),
          customers (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (invoiceData: any) => {
    try {
      // Generate invoice number
      const invoiceNumber = `INV-${String(invoices.length + 1).padStart(6, '0')}`;
      
      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          invoice_number: invoiceNumber,
          customer_id: invoiceData.customerId,
          date_due: invoiceData.dateDue,
          notes: invoiceData.notes,
          subtotal: invoiceData.subtotal,
          tax_rate: invoiceData.taxRate,
          tax_amount: invoiceData.taxAmount,
          total: invoiceData.total,
          status: 'draft'
        }])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      const items = invoiceData.items.map((item: any) => ({
        invoice_id: invoice.id,
        gem_id: item.gemId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(items);

      if (itemsError) throw itemsError;

      // Update gem status to Sold
      const gemIds = invoiceData.items.map((item: any) => item.gemId);
      const { error: gemUpdateError } = await supabase
        .from('gems')
        .update({ status: 'Sold' })
        .in('id', gemIds);

      if (gemUpdateError) throw gemUpdateError;

      await fetchInvoices();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create invoice' };
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    loading,
    error,
    createInvoice,
    refetch: fetchInvoices
  };
};
