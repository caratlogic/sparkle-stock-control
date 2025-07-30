import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Purchase, PurchaseItem } from '@/types/supplier';
import { useToast } from '@/hooks/use-toast';

export const usePurchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          supplier:suppliers(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast({
        title: "Error",
        description: "Failed to fetch purchases",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseItems = async (purchaseId: string): Promise<PurchaseItem[]> => {
    try {
      const { data, error } = await supabase
        .from('purchase_items')
        .select('*')
        .eq('purchase_id', purchaseId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching purchase items:', error);
      return [];
    }
  };

  const addPurchase = async (
    purchaseData: Omit<Purchase, 'id' | 'created_at' | 'updated_at' | 'supplier'>,
    items: Omit<PurchaseItem, 'id' | 'purchase_id' | 'created_at'>[]
  ) => {
    try {
      // Insert purchase
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert([purchaseData])
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Insert purchase items
      const itemsWithPurchaseId = items.map(item => ({
        ...item,
        purchase_id: purchase.id,
      }));

      const { error: itemsError } = await supabase
        .from('purchase_items')
        .insert(itemsWithPurchaseId);

      if (itemsError) throw itemsError;

      await fetchPurchases();
      toast({
        title: "Success",
        description: "Purchase added successfully",
      });
      return purchase;
    } catch (error) {
      console.error('Error adding purchase:', error);
      toast({
        title: "Error",
        description: "Failed to add purchase",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePurchase = async (id: string, updates: Partial<Purchase>) => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPurchases(prev => 
        prev.map(purchase => purchase.id === id ? { ...purchase, ...data } : purchase)
      );
      toast({
        title: "Success",
        description: "Purchase updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating purchase:', error);
      toast({
        title: "Error",
        description: "Failed to update purchase",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePurchase = async (id: string) => {
    try {
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPurchases(prev => prev.filter(purchase => purchase.id !== id));
      toast({
        title: "Success",
        description: "Purchase deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting purchase:', error);
      toast({
        title: "Error",
        description: "Failed to delete purchase",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  return {
    purchases,
    loading,
    addPurchase,
    updatePurchase,
    deletePurchase,
    fetchPurchaseItems,
    refetch: fetchPurchases,
  };
};