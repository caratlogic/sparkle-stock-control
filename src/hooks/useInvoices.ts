
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Invoice } from '../types/customer';

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (*),
          invoice_items (*,
            gems (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Fetched invoices from database:', data);

      const transformedInvoices: Invoice[] = data.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        customerId: invoice.customer_id,
        customerDetails: {
          id: invoice.customers.id,
          customerId: invoice.customers.customer_id,
          name: invoice.customers.name,
          email: invoice.customers.email,
          phone: invoice.customers.phone,
          company: invoice.customers.company || undefined,
          taxId: invoice.customers.tax_id || undefined,
          address: {
            street: invoice.customers.street,
            city: invoice.customers.city,
            state: invoice.customers.state,
            zipCode: invoice.customers.zip_code,
            country: invoice.customers.country || undefined
          },
          dateAdded: invoice.customers.date_added,
          totalPurchases: parseFloat(invoice.customers.total_purchases?.toString() || '0'),
          lastPurchaseDate: invoice.customers.last_purchase_date || undefined,
          notes: invoice.customers.notes || undefined
        },
        items: invoice.invoice_items.map((item: any) => ({
          productId: item.gem_id,
          productType: (item.gems?.gem_type?.toLowerCase() || 'diamond') as 'diamond' | 'emerald' | 'ruby' | 'sapphire' | 'amethyst' | 'aquamarine' | 'garnet' | 'opal' | 'topaz' | 'tourmaline',
          productDetails: {
            stockId: item.gems?.stock_id || '',
            carat: parseFloat(item.gems?.carat?.toString() || '0'),
            cut: item.gems?.cut || '',
            color: item.gems?.color || '',
            description: item.gems?.description || item.gems?.notes || 'No description available',
            measurements: item.gems?.measurements || item.gems?.measurements_mm || 'Not specified',
            certificateNumber: item.gems?.certificate_number || '',
            gemType: item.gems?.gem_type
          },
          quantity: item.quantity,
          unitPrice: parseFloat(item.unit_price?.toString() || '0'),
          totalPrice: parseFloat(item.total_price?.toString() || '0')
        })),
        subtotal: parseFloat(invoice.subtotal?.toString() || '0'),
        taxRate: parseFloat(invoice.tax_rate?.toString() || '0'),
        taxAmount: parseFloat(invoice.tax_amount?.toString() || '0'),
        total: parseFloat(invoice.total?.toString() || '0'),
        status: invoice.status as any,
        dateCreated: invoice.date_created,
        dateDue: invoice.date_due,
        notes: invoice.notes || undefined
      }));

      console.log('Transformed invoices:', transformedInvoices);
      setInvoices(transformedInvoices);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const addInvoice = async (invoiceData: any) => {
    try {
      console.log('🔄 useInvoices: Adding new invoice:', invoiceData);
      
      // First, create the invoice
      const { data: invoiceResult, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceData.invoiceNumber,
          customer_id: invoiceData.customerId,
          subtotal: invoiceData.subtotal,
          tax_rate: invoiceData.taxRate,
          tax_amount: invoiceData.taxAmount,
          total: invoiceData.total,
          status: invoiceData.status || 'draft',
          date_created: invoiceData.dateCreated,
          date_due: invoiceData.dateDue,
          notes: invoiceData.notes
        })
        .select()
        .single();

      if (invoiceError) {
        console.error('❌ useInvoices: Error creating invoice:', invoiceError);
        throw invoiceError;
      }

      console.log('✅ useInvoices: Successfully created invoice:', invoiceResult);

      // Then, create the invoice items
      if (invoiceData.items && invoiceData.items.length > 0) {
        const itemsToInsert = invoiceData.items.map((item: any) => ({
          invoice_id: invoiceResult.id,
          gem_id: item.gemId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert);

        if (itemsError) {
          console.error('❌ useInvoices: Error creating invoice items:', itemsError);
          throw itemsError;
        }

        console.log('✅ useInvoices: Successfully created invoice items');
      }

      // Update gem quantities for invoiced gems (move from stock to sold)
      if (invoiceData.items && invoiceData.items.length > 0) {
        for (const item of invoiceData.items) {
          // Get current gem quantities
          const { data: gemData, error: gemFetchError } = await supabase
            .from('gems')
            .select('in_stock, reserved, sold')
            .eq('id', item.gemId)
            .single();
          
          if (gemFetchError) {
            console.error(`❌ useInvoices: Error fetching gem ${item.gemId}:`, gemFetchError);
            continue;
          }
          
          // Prioritize selling from stock first, then from reserved
          let newInStock = gemData.in_stock;
          let newReserved = gemData.reserved;
          let newSold = gemData.sold + item.quantity;
          
          if (gemData.in_stock >= item.quantity) {
            // Sell from stock
            newInStock = gemData.in_stock - item.quantity;
          } else if (gemData.in_stock + gemData.reserved >= item.quantity) {
            // Sell from stock + reserved
            const remainingToSell = item.quantity - gemData.in_stock;
            newInStock = 0;
            newReserved = gemData.reserved - remainingToSell;
          } else {
            console.error(`❌ useInvoices: Not enough total quantity for gem ${item.gemId}. Available: ${gemData.in_stock + gemData.reserved}, Requested: ${item.quantity}`);
            continue;
          }
          
          await supabase
            .from('gems')
            .update({ 
              in_stock: newInStock,
              reserved: newReserved,
              sold: newSold
            })
            .eq('id', item.gemId);
        }
        console.log('✅ useInvoices: Successfully updated gem quantities for sold items');
      }

      await fetchInvoices();
      return { success: true, data: invoiceResult };
    } catch (err) {
      console.error('❌ useInvoices: Error in addInvoice:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create invoice' };
    }
  };

  useEffect(() => {
    fetchInvoices();
    
    // Set up real-time subscription for invoices
    const channel = supabase
      .channel('invoices-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'invoices' }, 
        (payload) => {
          console.log('Invoice change detected:', payload);
          fetchInvoices();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'invoice_items' }, 
        (payload) => {
          console.log('Invoice items change detected:', payload);
          fetchInvoices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    invoices,
    loading,
    error,
    addInvoice,
    refetch: fetchInvoices
  };
};
