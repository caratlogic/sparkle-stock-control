
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
        color: gem.color,
        price: parseFloat(gem.price.toString()),
        costPrice: parseFloat(gem.cost_price.toString()),
        certificateNumber: gem.certificate_number,
        status: gem.status as any,
        dateAdded: gem.date_added,
        notes: gem.notes || undefined,
        imageUrl: gem.image_url || undefined,
        // Updated fields
        measurementsMm: gem.measurements_mm || undefined,
        priceInLetters: gem.price_in_letters || undefined,
        totalInLetters: gem.total_in_letters || undefined,
        purchaseDate: gem.purchase_date || undefined,
        oldCode: gem.old_code || undefined,
        stoneDescription: gem.stone_description || undefined,
        shapeDetail: gem.shape_detail || undefined,
        boxNumber: gem.box_number || undefined,
        shape: gem.shape || undefined
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
          color: gemData.color,
          price: gemData.price,
          cost_price: gemData.costPrice,
          certificate_number: gemData.certificateNumber,
          status: gemData.status,
          notes: gemData.notes,
          image_url: gemData.imageUrl,
          // Updated fields
          measurements_mm: gemData.measurementsMm,
          price_in_letters: gemData.priceInLetters,
          total_in_letters: gemData.totalInLetters,
          purchase_date: gemData.purchaseDate,
          old_code: gemData.oldCode,
          stone_description: gemData.stoneDescription,
          shape_detail: gemData.shapeDetail,
          box_number: gemData.boxNumber,
          shape: gemData.shape
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
      console.log('Updating gem with ID:', id);
      console.log('Gem data received:', gemData);

      // Create a clean update object with proper snake_case field mapping
      const updateData: any = {};
      
      // Map all possible fields from camelCase to snake_case
      if (gemData.gemType !== undefined) updateData.gem_type = gemData.gemType;
      if (gemData.carat !== undefined) updateData.carat = gemData.carat;
      if (gemData.color !== undefined) updateData.color = gemData.color;
      if (gemData.price !== undefined) updateData.price = gemData.price;
      if (gemData.costPrice !== undefined) updateData.cost_price = gemData.costPrice;
      if (gemData.certificateNumber !== undefined) updateData.certificate_number = gemData.certificateNumber;
      if (gemData.status !== undefined) updateData.status = gemData.status;
      if (gemData.notes !== undefined) updateData.notes = gemData.notes || null;
      if (gemData.imageUrl !== undefined) updateData.image_url = gemData.imageUrl || null;
      if (gemData.measurementsMm !== undefined) updateData.measurements_mm = gemData.measurementsMm || null;
      if (gemData.priceInLetters !== undefined) updateData.price_in_letters = gemData.priceInLetters || null;
      if (gemData.totalInLetters !== undefined) updateData.total_in_letters = gemData.totalInLetters || null;
      if (gemData.purchaseDate !== undefined) updateData.purchase_date = gemData.purchaseDate || null;
      if (gemData.oldCode !== undefined) updateData.old_code = gemData.oldCode || null;
      if (gemData.stoneDescription !== undefined) updateData.stone_description = gemData.stoneDescription || null;
      if (gemData.shapeDetail !== undefined) updateData.shape_detail = gemData.shapeDetail || null;
      if (gemData.boxNumber !== undefined) updateData.box_number = gemData.boxNumber || null;
      if (gemData.shape !== undefined) updateData.shape = gemData.shape || null;

      // Always update the updated_at timestamp
      updateData.updated_at = new Date().toISOString();

      console.log('Mapped update data for database:', updateData);

      const { error, data } = await supabase
        .from('gems')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      console.log('Update successful, updated record:', data);
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
