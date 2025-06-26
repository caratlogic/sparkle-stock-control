
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Gem } from '../types/gem';

export const useGems = () => {
  const [gems, setGems] = useState<Gem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gems')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedGems: Gem[] = data.map(gem => ({
        id: gem.id,
        stockId: gem.stock_id,
        gemType: gem.gem_type as any,
        carat: parseFloat(gem.carat.toString()),
        cut: gem.shape as any, // Map shape to cut for frontend compatibility
        color: gem.color,
        clarity: 'Transparent' as any, // Default clarity since it doesn't exist in DB
        price: parseFloat(gem.price.toString()),
        costPrice: parseFloat(gem.cost_price.toString()),
        certificateNumber: gem.certificate_number,
        status: gem.status as any,
        dateAdded: gem.date_added,
        notes: gem.notes || undefined,
        imageUrl: gem.image_url || undefined
      }));

      setGems(transformedGems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gems');
    } finally {
      setLoading(false);
    }
  };

  const addGem = async (gemData: Omit<Gem, 'id' | 'stockId' | 'dateAdded'>) => {
    try {
      const { data, error } = await supabase
        .from('gems')
        .insert([{
          stock_id: `${gemData.gemType.substring(0, 2).toUpperCase()}${String(gems.length + 1).padStart(4, '0')}`,
          gem_type: gemData.gemType,
          carat: gemData.carat,
          shape: gemData.cut, // Map cut to shape for database
          color: gemData.color,
          price: gemData.price,
          cost_price: gemData.costPrice,
          certificate_number: gemData.certificateNumber,
          status: gemData.status,
          notes: gemData.notes,
          image_url: gemData.imageUrl
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchGems();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to add gem' };
    }
  };

  const updateGem = async (id: string, gemData: Partial<Gem>) => {
    try {
      // Only include fields that exist in the database schema
      const updateData: any = {};
      
      if (gemData.gemType !== undefined) updateData.gem_type = gemData.gemType;
      if (gemData.carat !== undefined) updateData.carat = gemData.carat;
      if (gemData.cut !== undefined) updateData.shape = gemData.cut; // Map cut to shape
      if (gemData.color !== undefined) updateData.color = gemData.color;
      // Skip clarity since it doesn't exist in the database
      if (gemData.price !== undefined) updateData.price = gemData.price;
      if (gemData.costPrice !== undefined) updateData.cost_price = gemData.costPrice;
      if (gemData.certificateNumber !== undefined) updateData.certificate_number = gemData.certificateNumber;
      if (gemData.status !== undefined) updateData.status = gemData.status;
      if (gemData.notes !== undefined) updateData.notes = gemData.notes;
      if (gemData.imageUrl !== undefined) updateData.image_url = gemData.imageUrl;

      console.log('Updating gem with data:', updateData);

      const { error } = await supabase
        .from('gems')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      await fetchGems();
      return { success: true };
    } catch (err) {
      console.error('Update gem error:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update gem' };
    }
  };

  const deleteGem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gems')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchGems();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete gem' };
    }
  };

  useEffect(() => {
    fetchGems();
  }, []);

  return {
    gems,
    loading,
    error,
    addGem,
    updateGem,
    deleteGem,
    refetch: fetchGems
  };
};
