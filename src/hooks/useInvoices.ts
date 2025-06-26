
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
      
      // Transform the data to match our interface
      const transformedData = (data || []).map((invoice: any) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        customerId: invoice.customer_id,
        dateCreated: invoice.date_created,
        dateDue: invoice.date_due,
        subtotal: invoice.subtotal,
        taxRate: invoice.tax_rate,
        taxAmount: invoice.tax_amount,
        total: invoice.total,
        status: invoice.status,
        notes: invoice.notes,
        items: invoice.invoice_items?.map((item: any) => ({
          id: item.id,
          invoiceId: item.invoice_id,
          gemId: item.gem_id,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          gem: item.gems ? {
            id: item.gems.id,
            stockId: item.gems.stock_id,
            gemType: item.gems.gem_type,
            carat: item.gems.carat,
            color: item.gems.color,
            shape: item.gems.shape,
            measurementsMm: item.gems.measurements_mm,
            stoneDescription: item.gems.stone_description
          } : undefined
        })) || [],
        customer: invoice.customers ? {
          id: invoice.customers.id,
          name: invoice.customers.name,
          email: invoice.customers.email
        } : undefined
      }));
      
      setInvoices(transformedData);
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
