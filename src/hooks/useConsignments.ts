
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Consignment {
  id: string;
  consignmentNumber: string;
  customerId: string;
  customerDetails: {
    id: string;
    customerId: string;
    name: string;
    email: string;
    phone: string;
    company?: string;
    taxId?: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country?: string;
    };
    dateAdded: string;
    totalPurchases: number;
    lastPurchaseDate?: string;
    notes?: string;
  };
  status: 'pending' | 'returned' | 'purchased' | 'inactive';
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
      setError(null);
      
      console.log('Fetching consignments from database...');
      
      const { data, error } = await supabase
        .from('consignments')
        .select(`
          *,
          customers (*),
          consignment_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching consignments:', error);
        throw error;
      }

      console.log('Raw consignments data from database:', data);

      if (!data || data.length === 0) {
        console.log('No consignments found in database');
        setConsignments([]);
        return;
      }

      const transformedConsignments: Consignment[] = data.map(consignment => {
        console.log('Processing consignment:', consignment.id, consignment.consignment_number);
        console.log('Customer data:', consignment.customers);
        console.log('Items data:', consignment.consignment_items);
        
        return {
          id: consignment.id,
          consignmentNumber: consignment.consignment_number,
          customerId: consignment.customer_id,
          customerDetails: {
            id: consignment.customers.id,
            customerId: consignment.customers.customer_id,
            name: consignment.customers.name,
            email: consignment.customers.email,
            phone: consignment.customers.phone,
            company: consignment.customers.company || undefined,
            taxId: consignment.customers.tax_id || undefined,
            address: {
              street: consignment.customers.street,
              city: consignment.customers.city,
              state: consignment.customers.state,
              zipCode: consignment.customers.zip_code,
              country: consignment.customers.country || undefined
            },
            dateAdded: consignment.customers.date_added,
            totalPurchases: parseFloat(consignment.customers.total_purchases?.toString() || '0'),
            lastPurchaseDate: consignment.customers.last_purchase_date || undefined,
            notes: consignment.customers.notes || undefined
          },
          status: consignment.status as any,
          dateCreated: consignment.date_created,
          returnDate: consignment.return_date,
          notes: consignment.notes || undefined,
          items: consignment.consignment_items.map((item: any) => ({
            id: item.id,
            gemId: item.gem_id,
            quantity: item.quantity,
            unitPrice: parseFloat(item.unit_price?.toString() || '0'),
            totalPrice: parseFloat(item.total_price?.toString() || '0')
          }))
        };
      });

      console.log('Transformed consignments:', transformedConsignments);
      setConsignments(transformedConsignments);
    } catch (err) {
      console.error('Error in fetchConsignments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch consignments');
    } finally {
      setLoading(false);
    }
  };

  const updateConsignmentStatus = async (consignmentId: string, status: 'returned' | 'purchased' | 'inactive') => {
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

  const getConsignmentByGemId = async (gemId: string) => {
    try {
      const { data, error } = await supabase
        .from('consignment_items')
        .select(`
          *,
          consignments (*)
        `)
        .eq('gem_id', gemId)
        .eq('consignments.status', 'pending')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return data ? {
        id: data.consignments.id,
        consignmentNumber: data.consignments.consignment_number,
        customerId: data.consignments.customer_id,
        status: data.consignments.status,
        dateCreated: data.consignments.date_created,
        returnDate: data.consignments.return_date,
        notes: data.consignments.notes || undefined,
        items: []
      } : null;
    } catch (err) {
      console.error('Error fetching consignment by gem ID:', err);
      return null;
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
    console.log('useConsignments: Setting up initial fetch and subscriptions');
    fetchConsignments();
    
    // Set up real-time subscription for consignments
    const channel = supabase
      .channel('consignments-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'consignments' }, 
        (payload) => {
          console.log('Consignment change detected:', payload);
          fetchConsignments();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'consignment_items' }, 
        (payload) => {
          console.log('Consignment items change detected:', payload);
          fetchConsignments();
        }
      )
      .subscribe();

    return () => {
      console.log('useConsignments: Cleaning up subscriptions');
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    consignments,
    loading,
    error,
    updateConsignmentStatus,
    deleteConsignment,
    getConsignmentByGemId,
    refetch: fetchConsignments
  };
};
