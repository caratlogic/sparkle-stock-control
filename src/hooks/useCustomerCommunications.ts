
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CustomerCommunication {
  id: string;
  customerId: string;
  communicationType: 'note' | 'email' | 'follow_up' | 'reply';
  subject?: string;
  message: string;
  senderType: 'owner' | 'customer';
  senderName?: string;
  senderEmail?: string;
  isRead: boolean;
  relatedInvoiceId?: string;
  relatedConsignmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export const useCustomerCommunications = (customerId?: string) => {
  const [communications, setCommunications] = useState<CustomerCommunication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('customer_communications')
        .select('*')
        .order('created_at', { ascending: false });

      if (customerId) {
        query = query.eq('customer_id', customerId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedCommunications: CustomerCommunication[] = data.map(comm => ({
        id: comm.id,
        customerId: comm.customer_id,
        communicationType: comm.communication_type,
        subject: comm.subject,
        message: comm.message,
        senderType: comm.sender_type,
        senderName: comm.sender_name,
        senderEmail: comm.sender_email,
        isRead: comm.is_read,
        relatedInvoiceId: comm.related_invoice_id,
        relatedConsignmentId: comm.related_consignment_id,
        createdAt: comm.created_at,
        updatedAt: comm.updated_at
      }));

      setCommunications(transformedCommunications);
    } catch (err) {
      console.error('Error fetching communications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch communications');
    } finally {
      setLoading(false);
    }
  };

  const addCommunication = async (communication: Omit<CustomerCommunication, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('customer_communications')
        .insert({
          customer_id: communication.customerId,
          communication_type: communication.communicationType,
          subject: communication.subject,
          message: communication.message,
          sender_type: communication.senderType,
          sender_name: communication.senderName,
          sender_email: communication.senderEmail,
          is_read: communication.isRead,
          related_invoice_id: communication.relatedInvoiceId,
          related_consignment_id: communication.relatedConsignmentId
        })
        .select()
        .single();

      if (error) throw error;

      await fetchCommunications();
      return { success: true, data };
    } catch (err) {
      console.error('Error adding communication:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to add communication' };
    }
  };

  const markAsRead = async (communicationId: string) => {
    try {
      const { error } = await supabase
        .from('customer_communications')
        .update({ is_read: true })
        .eq('id', communicationId);

      if (error) throw error;

      await fetchCommunications();
      return { success: true };
    } catch (err) {
      console.error('Error marking communication as read:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to mark as read' };
    }
  };

  useEffect(() => {
    fetchCommunications();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('customer-communications-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'customer_communications' }, 
        (payload) => {
          console.log('Communication change detected:', payload);
          fetchCommunications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [customerId]);

  return {
    communications,
    loading,
    error,
    addCommunication,
    markAsRead,
    refetch: fetchCommunications
  };
};
