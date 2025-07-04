import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useInvoices } from './useInvoices';
import { useCustomerCommunications } from './useCustomerCommunications';

export const useOverdueReminders = () => {
  const { invoices } = useInvoices();
  const { addCommunication } = useCustomerCommunications();

  const createOverduePaymentReminders = async () => {
    const today = new Date();
    const twoWeeksAgo = new Date(today.getTime() - (14 * 24 * 60 * 60 * 1000));

    // Find invoices that are overdue (created more than 2 weeks ago and not paid)
    const overdueInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.dateCreated);
      const isOverdue = invoiceDate <= twoWeeksAgo;
      const isUnpaid = invoice.status !== 'paid' && invoice.status !== 'cancelled';
      return isOverdue && isUnpaid;
    });

    for (const invoice of overdueInvoices) {
      try {
        // Check if we already have a payment reminder for this invoice
        const { data: existingReminders } = await supabase
          .from('customer_reminders')
          .select('*')
          .eq('customer_id', invoice.customerId)
          .eq('reminder_type', 'payment_overdue')
          .eq('communication_id', invoice.id);

        // Only create reminder if one doesn't exist
        if (!existingReminders || existingReminders.length === 0) {
          // Add communication record
          await addCommunication({
            customerId: invoice.customerId,
            communicationType: 'payment',
            subject: `Payment Overdue - Invoice ${invoice.invoiceNumber}`,
            message: `Payment for invoice ${invoice.invoiceNumber} (${invoice.total.toLocaleString()} USD) is overdue. Invoice was created on ${new Date(invoice.dateCreated).toLocaleDateString()} and payment was due on ${new Date(invoice.dateDue).toLocaleDateString()}.`,
            senderType: 'owner',
            senderName: 'System',
            senderEmail: 'system@business.com',
            isRead: false,
            responseStatus: 'pending',
            relatedInvoiceId: invoice.id
          });

          // Create reminder entry
          await supabase
            .from('customer_reminders')
            .insert({
              customer_id: invoice.customerId,
              reminder_type: 'payment_overdue',
              reminder_date: today.toISOString(),
              message: `Payment overdue for invoice ${invoice.invoiceNumber} - ${invoice.total.toLocaleString()} USD`,
              communication_id: invoice.id,
              staff_email: 'owner@business.com'
            });

          console.log(`Created overdue payment reminder for invoice ${invoice.invoiceNumber}`);
        }
      } catch (error) {
        console.error(`Failed to create reminder for invoice ${invoice.invoiceNumber}:`, error);
      }
    }
  };

  useEffect(() => {
    if (invoices.length > 0) {
      createOverduePaymentReminders();
    }
  }, [invoices]);

  return {
    createOverduePaymentReminders
  };
};