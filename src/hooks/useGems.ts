
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
        cut: gem.cut as any,
        color: gem.color,
        clarity: gem.clarity as any,
        price: parseFloat(gem.price.toString()),
        costPrice: parseFloat(gem.cost_price.toString()),
        certificateNumber: gem.certificate_number,
        status: gem.status as any,
        dateAdded: gem.date_added,
        notes: gem.notes || undefined,
        imageUrl: gem.image_url || undefined,
        // New fields
        measurementsMm: gem.measurements_mm || undefined,
        priceInLetters: gem.price_in_letters || undefined,
        totalInLetters: gem.total_in_letters || undefined,
        purchaseDate: gem.purchase_date || undefined,
        oldCode: gem.old_code || undefined,
        stoneDescription: gem.stone_description || undefined,
        shapeDetail: gem.shape_detail || undefined,
        boxNumber: gem.box_number || undefined
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
          cut: gemData.cut,
          color: gemData.color,
          clarity: gemData.clarity,
          price: gemData.price,
          cost_price: gemData.costPrice,
          certificate_number: gemData.certificateNumber,
          status: gemData.status,
          notes: gemData.notes,
          image_url: gemData.imageUrl,
          // New fields
          measurements_mm: gemData.measurementsMm,
          price_in_letters: gemData.priceInLetters,
          total_in_letters: gemData.totalInLetters,
          purchase_date: gemData.purchaseDate,
          old_code: gemData.oldCode,
          stone_description: gemData.stoneDescription,
          shape_detail: gemData.shapeDetail,
          box_number: gemData.boxNumber
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
      const { error } = await supabase
        .from('gems')
        .update({
          gem_type: gemData.gemType,
          carat: gemData.carat,
          cut: gemData.cut,
          color: gemData.color,
          clarity: gemData.clarity,
          price: gemData.price,
          cost_price: gemData.costPrice,
          certificate_number: gemData.certificateNumber,
          status: gemData.status,
          notes: gemData.notes,
          image_url: gemData.imageUrl,
          // New fields
          measurements_mm: gemData.measurementsMm,
          price_in_letters: gemData.priceInLetters,
          total_in_letters: gemData.totalInLetters,
          purchase_date: gemData.purchaseDate,
          old_code: gemData.oldCode,
          stone_description: gemData.stoneDescription,
          shape_detail: gemData.shapeDetail,
          box_number: gemData.boxNumber
        })
        .eq('id', id);

      if (error) throw error;
      await fetchGems();
      return { success: true };
    } catch (err) {
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
