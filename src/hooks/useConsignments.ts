
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Consignment } from '../types/consignment';

export const useConsignments = () => {
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchConsignments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('consignments')
        .select(`
          *,
          consignment_items (
            *,
            gems (*)
          ),
          customers (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map((consignment: any) => ({
        id: consignment.id,
        consignmentNumber: consignment.consignment_number,
        customerId: consignment.customer_id,
        dateCreated: consignment.date_created,
        returnDate: consignment.return_date,
        status: consignment.status,
        notes: consignment.notes,
        items: consignment.consignment_items?.map((item: any) => ({
          id: item.id,
          consignmentId: item.consignment_id,
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
        customer: consignment.customers ? {
          id: consignment.customers.id,
          name: consignment.customers.name,
          email: consignment.customers.email
        } : undefined
      }));
      
      setConsignments(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch consignments');
    } finally {
      setLoading(false);
    }
  };

  const createConsignment = async (consignmentData: any) => {
    try {
      // Generate consignment number
      const consignmentNumber = `CON-${String(consignments.length + 1).padStart(6, '0')}`;
      
      // Create consignment
      const { data: consignment, error: consignmentError } = await supabase
        .from('consignments')
        .insert([{
          consignment_number: consignmentNumber,
          customer_id: consignmentData.customerId,
          return_date: consignmentData.returnDate,
          notes: consignmentData.notes,
          status: 'pending'
        }])
        .select()
        .single();

      if (consignmentError) throw consignmentError;

      // Create consignment items
      const items = consignmentData.items.map((item: any) => ({
        consignment_id: consignment.id,
        gem_id: item.gemId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice
      }));

      const { error: itemsError } = await supabase
        .from('consignment_items')
        .insert(items);

      if (itemsError) throw itemsError;

      // Update gem status to Reserved
      const gemIds = consignmentData.items.map((item: any) => item.gemId);
      const { error: gemUpdateError } = await supabase
        .from('gems')
        .update({ status: 'Reserved' })
        .in('id', gemIds);

      if (gemUpdateError) throw gemUpdateError;

      await fetchConsignments();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create consignment' };
    }
  };

  const updateConsignmentStatus = async (consignmentId: string, status: 'returned' | 'purchased' | 'inactive') => {
    try {
      const { error } = await supabase
        .from('consignments')
        .update({ status })
        .eq('id', consignmentId);

      if (error) throw error;
      await fetchConsignments();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update consignment' };
    }
  };

  const deleteConsignment = async (consignmentId: string) => {
    try {
      // Delete consignment items first
      const { error: itemsError } = await supabase
        .from('consignment_items')
        .delete()
        .eq('consignment_id', consignmentId);

      if (itemsError) throw itemsError;

      // Delete consignment
      const { error: consignmentError } = await supabase
        .from('consignments')
        .delete()
        .eq('id', consignmentId);

      if (consignmentError) throw consignmentError;

      await fetchConsignments();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete consignment' };
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
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch consignment' };
    }
  };

  useEffect(() => {
    fetchConsignments();
  }, []);

  return {
    consignments,
    loading,
    error,
    createConsignment,
    updateConsignmentStatus,
    deleteConsignment,
    getConsignmentByGemId,
    refetch: fetchConsignments
  };
};
