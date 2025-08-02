import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Diamond } from '@/types/diamond';

export const useDiamonds = () => {
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDiamonds = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('diamonds' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const diamondData = data as unknown as Diamond[];
      setDiamonds(diamondData || []);
    } catch (error) {
      console.error('Error fetching diamonds:', error);
      toast({
        title: "Error",
        description: "Failed to fetch diamonds",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addDiamond = async (diamond: Omit<Diamond, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('diamonds' as any)
        .insert([diamond])
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newDiamond = data as unknown as Diamond;
      setDiamonds(prev => [newDiamond, ...prev]);
      toast({
        title: "Success",
        description: "Diamond added successfully",
      });
      return data;
    } catch (error) {
      console.error('Error adding diamond:', error);
      toast({
        title: "Error",
        description: "Failed to add diamond",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateDiamond = async (id: string, updates: Partial<Diamond>) => {
    try {
      const { data, error } = await supabase
        .from('diamonds' as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const updatedDiamond = data as unknown as Diamond;
      setDiamonds(prev => prev.map(diamond => 
        diamond.id === id ? updatedDiamond : diamond
      ));
      toast({
        title: "Success",
        description: "Diamond updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating diamond:', error);
      toast({
        title: "Error",
        description: "Failed to update diamond",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteDiamond = async (id: string) => {
    try {
      const { error } = await supabase
        .from('diamonds' as any)
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setDiamonds(prev => prev.filter(diamond => diamond.id !== id));
      toast({
        title: "Success",
        description: "Diamond deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting diamond:', error);
      toast({
        title: "Error",
        description: "Failed to delete diamond",
        variant: "destructive",
      });
      throw error;
    }
  };

  const refetch = () => {
    fetchDiamonds();
  };

  useEffect(() => {
    fetchDiamonds();
  }, []);

  return {
    diamonds,
    loading,
    addDiamond,
    updateDiamond,
    deleteDiamond,
    refetch
  };
};