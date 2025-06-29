
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InvoicePayment } from '../types/customer';

export const useInvoicePayments = () => {
  const [payments, setPayments] = useState<InvoicePayment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = async (invoiceId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('invoice_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (invoiceId) {
        query = query.eq('invoice_id', invoiceId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedPayments: InvoicePayment[] = (data || []).map(payment => ({
        id: payment.id,
        invoiceId: payment.invoice_id,
        amount: parseFloat(payment.amount.toString()),
        paymentDate: payment.payment_date,
        paymentMethod: payment.payment_method,
        notes: payment.notes,
        createdAt: payment.created_at
      }));

      setPayments(transformedPayments);
    } catch (err) {
      console.error('Error fetching invoice payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const addPayment = async (payment: Omit<InvoicePayment, 'id' | 'createdAt'>) => {
    try {
      console.log('🔄 Adding invoice payment:', payment);
      
      const { data, error } = await supabase
        .from('invoice_payments')
        .insert({
          invoice_id: payment.invoiceId,
          amount: payment.amount,
          payment_date: payment.paymentDate,
          payment_method: payment.paymentMethod,
          notes: payment.notes
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error adding payment:', error);
        throw error;
      }

      console.log('✅ Successfully added payment:', data);
      await fetchPayments();
      return { success: true, data };
    } catch (err) {
      console.error('❌ Error in addPayment:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to add payment' };
    }
  };

  const getPaymentsByInvoiceId = (invoiceId: string) => {
    return payments.filter(payment => payment.invoiceId === invoiceId);
  };

  const getTotalPaidAmount = (invoiceId: string) => {
    return payments
      .filter(payment => payment.invoiceId === invoiceId)
      .reduce((total, payment) => total + payment.amount, 0);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return {
    payments,
    loading,
    addPayment,
    fetchPayments,
    getPaymentsByInvoiceId,
    getTotalPaidAmount
  };
};
