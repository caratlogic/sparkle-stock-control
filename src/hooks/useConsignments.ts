
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Consignment {
  id: string;
  consignmentNumber: string;
  customerId: string;
  status: 'pending' | 'returned' | 'purchased';
  dateCreated: string;
  returnDate: string;
  notes?: string;
  items: ConsignmentItem[];
}

interface ConsignmentItem {
  id: string;
  gemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export const useConsignments = () => {
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConsignments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('consignments')
        .select(`
          *,
          consignment_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedConsignments: Consignment[] = data.map(consignment => ({
        id: consignment.id,
        consignmentNumber: consignment.consignment_number,
        customerId: consignment.customer_id,
        status: consignment.status as any,
        dateCreated: consignment.date_created,
        returnDate: consignment.return_date,
        notes: consignment.notes || undefined,
        items: consignment.consignment_items.map((item: any) => ({
          id: item.id,
          gemId: item.gem_id,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unit_price.toString()),
          totalPrice: parseFloat(item.total_price.toString())
        }))
      }));

      setConsignments(transformedConsignments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch consignments');
    } finally {
      setLoading(false);
    }
  };

  const updateConsignmentStatus = async (consignmentId: string, status: 'returned' | 'purchased') => {
    try {
      const { error } = await supabase
        .from('consignments')
        .update({ status })
        .eq('id', consignmentId);

      if (error) throw error;

      // If consignment is returned, update gem status to 'In Stock'
      if (status === 'returned') {
        const consignment = consignments.find(c => c.id === consignmentId);
        if (consignment) {
          for (const item of consignment.items) {
            await supabase
              .from('gems')
              .update({ status: 'In Stock' })
              .eq('id', item.gemId);
          }
        }
      }

      await fetchConsignments();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update consignment' };
    }
  };

  const deleteConsignment = async (consignmentId: string) => {
    try {
      const { error } = await supabase
        .from('consignments')
        .delete()
        .eq('id', consignmentId);

      if (error) throw error;

      await fetchConsignments();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete consignment' };
    }
  };

  useEffect(() => {
    fetchConsignments();
  }, []);

  return {
    consignments,
    loading,
    error,
    updateConsignmentStatus,
    deleteConsignment,
    refetch: fetchConsignments
  };
};
