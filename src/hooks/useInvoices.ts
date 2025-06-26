
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
          productType: 'gem',
          productDetails: {
            stockId: item.gems.stock_id,
            carat: parseFloat(item.gems.carat.toString()),
            cut: item.gems.cut,
            color: item.gems.color,
            clarity: item.gems.clarity,
            certificateNumber: item.gems.certificate_number,
            gemType: item.gems.gem_type
          },
          quantity: item.quantity,
          unitPrice: parseFloat(item.unit_price.toString()),
          totalPrice: parseFloat(item.total_price.toString())
        })),
        subtotal: parseFloat(invoice.subtotal.toString()),
        taxRate: parseFloat(invoice.tax_rate.toString()),
        taxAmount: parseFloat(invoice.tax_amount.toString()),
        total: parseFloat(invoice.total.toString()),
        status: invoice.status as any,
        dateCreated: invoice.date_created,
        dateDue: invoice.date_due,
        notes: invoice.notes || undefined
      }));

      setInvoices(transformedInvoices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    loading,
    error,
    refetch: fetchInvoices
  };
};
