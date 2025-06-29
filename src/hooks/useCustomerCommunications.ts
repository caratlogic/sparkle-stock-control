
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CustomerCommunication {
  id: string;
  customerId: string;
  communicationType: 'note' | 'email' | 'follow_up' | 'reply' | 'call' | 'document' | 'invoice' | 'consignment' | 'payment' | 'kyc';
  subject?: string;
  message: string;
  senderType: 'owner' | 'customer';
  senderName?: string;
  senderEmail?: string;
  isRead: boolean;
  responseStatus: 'pending' | 'responded' | 'no_response' | 'completed';
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
      
      // Use raw SQL query for the customer_communications table
      let query = `
        SELECT * FROM customer_communications
        ${customerId ? 'WHERE customer_id = $1' : ''}
        ORDER BY created_at DESC
      `;

      const { data, error } = customerId 
        ? await supabase.rpc('exec_sql', { 
            query: 'SELECT * FROM customer_communications WHERE customer_id = $1 ORDER BY created_at DESC',
            params: [customerId]
          })
        : await supabase.rpc('exec_sql', {
            query: 'SELECT * FROM customer_communications ORDER BY created_at DESC'
          });

      if (error) {
        // Fallback: try direct table access (might work after types are updated)
        const fallbackQuery = supabase
          .from('customer_communications' as any)
          .select('*')
          .order('created_at', { ascending: false });

        if (customerId) {
          fallbackQuery.eq('customer_id', customerId);
        }

        const fallbackResult = await fallbackQuery;
        
        if (fallbackResult.error) throw fallbackResult.error;
        
        const transformedCommunications: CustomerCommunication[] = (fallbackResult.data || []).map((comm: any) => ({
          id: comm.id,
          customerId: comm.customer_id,
          communicationType: comm.communication_type,
          subject: comm.subject,
          message: comm.message,
          senderType: comm.sender_type,
          senderName: comm.sender_name,
          senderEmail: comm.sender_email,
          isRead: comm.is_read,
          responseStatus: comm.response_status || 'pending',
          relatedInvoiceId: comm.related_invoice_id,
          relatedConsignmentId: comm.related_consignment_id,
          createdAt: comm.created_at,
          updatedAt: comm.updated_at
        }));

        setCommunications(transformedCommunications);
        return;
      }

      // Transform data from RPC call
      const transformedCommunications: CustomerCommunication[] = (data || []).map((comm: any) => ({
        id: comm.id,
        customerId: comm.customer_id,
        communicationType: comm.communication_type,
        subject: comm.subject,
        message: comm.message,
        senderType: comm.sender_type,
        senderName: comm.sender_name,
        senderEmail: comm.sender_email,
        isRead: comm.is_read,
        responseStatus: comm.response_status || 'pending',
        relatedInvoiceId: comm.related_invoice_id,
        relatedConsignmentId: comm.related_consignment_id,
        createdAt: comm.created_at,
        updatedAt: comm.updated_at
      }));

      setCommunications(transformedCommunications);
    } catch (err) {
      console.error('Error fetching communications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch communications');
      setCommunications([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const addCommunication = async (communication: Omit<CustomerCommunication, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Use raw SQL insert
      const { data, error } = await supabase.rpc('exec_sql', {
        query: `
          INSERT INTO customer_communications (
            customer_id, communication_type, subject, message, sender_type, 
            sender_name, sender_email, is_read, response_status, 
            related_invoice_id, related_consignment_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `,
        params: [
          communication.customerId,
          communication.communicationType,
          communication.subject,
          communication.message,
          communication.senderType,
          communication.senderName,
          communication.senderEmail,
          communication.isRead,
          communication.responseStatus,
          communication.relatedInvoiceId,
          communication.relatedConsignmentId
        ]
      });

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
      const { error } = await supabase.rpc('exec_sql', {
        query: 'UPDATE customer_communications SET is_read = true WHERE id = $1',
        params: [communicationId]
      });

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
