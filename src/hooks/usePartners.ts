import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Partner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  status: 'active' | 'inactive';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PartnerTransaction {
  id: string;
  partner_id: string;
  transaction_type: 'invoice' | 'consignment' | 'quotation';
  transaction_id: string;
  ownership_status: string;
  associated_entity: string;
  revenue_amount: number;
  partner_share: number;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  partner?: Partner;
}

export const usePartners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('name');

      if (error) throw error;
      setPartners((data || []) as Partner[]);
    } catch (err) {
      console.error('Error fetching partners:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const addPartner = async (partnerData: Omit<Partner, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .insert(partnerData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Partner Added",
        description: `${partnerData.name} has been added successfully.`,
      });

      await fetchPartners();
      return { success: true, data };
    } catch (err) {
      console.error('Error adding partner:', err);
      toast({
        title: "Error",
        description: "Failed to add partner. Please try again.",
        variant: "destructive"
      });
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const updatePartner = async (id: string, updates: Partial<Partner>) => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Partner Updated",
        description: "Partner information has been updated successfully.",
      });

      await fetchPartners();
      return { success: true, data };
    } catch (err) {
      console.error('Error updating partner:', err);
      toast({
        title: "Error",
        description: "Failed to update partner. Please try again.",
        variant: "destructive"
      });
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const deletePartner = async (id: string) => {
    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Partner Deleted",
        description: "Partner has been deleted successfully.",
      });

      await fetchPartners();
      return { success: true };
    } catch (err) {
      console.error('Error deleting partner:', err);
      toast({
        title: "Error",
        description: "Failed to delete partner. Please try again.",
        variant: "destructive"
      });
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  return {
    partners,
    loading,
    error,
    fetchPartners,
    addPartner,
    updatePartner,
    deletePartner
  };
};

export const usePartnerTransactions = () => {
  const [transactions, setTransactions] = useState<PartnerTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartnerTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('partner_transactions')
        .select(`
          *,
          partner:partners(*)
        `)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      setTransactions((data || []) as PartnerTransaction[]);
    } catch (err) {
      console.error('Error fetching partner transactions:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const addPartnerTransaction = async (transactionData: Omit<PartnerTransaction, 'id' | 'created_at' | 'updated_at' | 'partner'>) => {
    try {
      const { data, error } = await supabase
        .from('partner_transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) throw error;

      await fetchPartnerTransactions();
      return { success: true, data };
    } catch (err) {
      console.error('Error adding partner transaction:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  useEffect(() => {
    fetchPartnerTransactions();
  }, []);

  return {
    transactions,
    loading,
    error,
    fetchPartnerTransactions,
    addPartnerTransaction
  };
};

// Hook to fetch gems by partner
export const usePartnerGems = () => {
  const [gemsByPartner, setGemsByPartner] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartnerGems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gems')
        .select('*')
        .eq('ownership_status', 'P')
        .neq('associated_entity', 'Self');

      if (error) throw error;

      // Group gems by associated_entity (partner name)
      const grouped = (data || []).reduce((acc, gem) => {
        const partnerName = gem.associated_entity;
        if (!acc[partnerName]) {
          acc[partnerName] = [];
        }
        acc[partnerName].push(gem);
        return acc;
      }, {} as Record<string, any[]>);

      setGemsByPartner(grouped);
    } catch (err) {
      console.error('Error fetching partner gems:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnerGems();
  }, []);

  return {
    gemsByPartner,
    loading,
    error,
    refetch: fetchPartnerGems
  };
};