import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AssociatedEntity {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  status: 'active' | 'inactive';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AssociatedEntityTransaction {
  id: string;
  associated_entity_id: string;
  transaction_type: 'invoice' | 'consignment' | 'quotation';
  transaction_id: string;
  ownership_status: string;
  associated_entity_name: string;
  revenue_amount: number;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  associated_entity?: AssociatedEntity;
}

export const useAssociatedEntities = () => {
  const [associatedEntities, setAssociatedEntities] = useState<AssociatedEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAssociatedEntities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('associated_entities')
        .select('*')
        .order('name');

      if (error) throw error;
      setAssociatedEntities((data || []) as AssociatedEntity[]);
    } catch (err) {
      console.error('Error fetching associated entities:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const addAssociatedEntity = async (entityData: Omit<AssociatedEntity, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('associated_entities')
        .insert(entityData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Associated Entity Added",
        description: `${entityData.name} has been added successfully.`,
      });

      await fetchAssociatedEntities();
      return { success: true, data };
    } catch (err) {
      console.error('Error adding associated entity:', err);
      toast({
        title: "Error",
        description: "Failed to add associated entity. Please try again.",
        variant: "destructive"
      });
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const updateAssociatedEntity = async (id: string, updates: Partial<AssociatedEntity>) => {
    try {
      const { data, error } = await supabase
        .from('associated_entities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Associated Entity Updated",
        description: "Entity information has been updated successfully.",
      });

      await fetchAssociatedEntities();
      return { success: true, data };
    } catch (err) {
      console.error('Error updating associated entity:', err);
      toast({
        title: "Error",
        description: "Failed to update associated entity. Please try again.",
        variant: "destructive"
      });
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const deleteAssociatedEntity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('associated_entities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Associated Entity Deleted",
        description: "Entity has been deleted successfully.",
      });

      await fetchAssociatedEntities();
      return { success: true };
    } catch (err) {
      console.error('Error deleting associated entity:', err);
      toast({
        title: "Error",
        description: "Failed to delete associated entity. Please try again.",
        variant: "destructive"
      });
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  useEffect(() => {
    fetchAssociatedEntities();
  }, []);

  return {
    associatedEntities,
    loading,
    error,
    fetchAssociatedEntities,
    addAssociatedEntity,
    updateAssociatedEntity,
    deleteAssociatedEntity
  };
};

export const useAssociatedEntityTransactions = () => {
  const [transactions, setTransactions] = useState<AssociatedEntityTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssociatedEntityTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('associated_entity_transactions')
        .select(`
          *,
          associated_entity:associated_entities(*)
        `)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      setTransactions((data || []) as any);
    } catch (err) {
      console.error('Error fetching associated entity transactions:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const addAssociatedEntityTransaction = async (transactionData: Omit<AssociatedEntityTransaction, 'id' | 'created_at' | 'updated_at' | 'associated_entity'>) => {
    try {
      const { data, error } = await supabase
        .from('associated_entity_transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) throw error;

      await fetchAssociatedEntityTransactions();
      return { success: true, data };
    } catch (err) {
      console.error('Error adding associated entity transaction:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  useEffect(() => {
    fetchAssociatedEntityTransactions();
  }, []);

  return {
    transactions,
    loading,
    error,
    fetchAssociatedEntityTransactions,
    addAssociatedEntityTransaction
  };
};