
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
        description: gem.description || 'No description available',
        measurements: gem.measurements || 'Not specified',
        price: parseFloat(gem.price.toString()),
        costPrice: parseFloat(gem.cost_price.toString()),
        certificateNumber: gem.certificate_number,
        inStock: parseInt(gem.in_stock?.toString() || '0'),
        reserved: parseInt(gem.reserved?.toString() || '0'),
        sold: parseInt(gem.sold?.toString() || '0'),
        dateAdded: gem.date_added,
        purchaseDate: gem.purchase_date || undefined,
        treatment: gem.treatment as any || undefined,
        colorComment: gem.color_comment || undefined,
        certificateType: gem.certificate_type as any || undefined,
        supplier: gem.supplier || undefined,
        origin: gem.origin || undefined,
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
          description: gemData.description,
          measurements: gemData.measurements,
          price: gemData.price,
          cost_price: gemData.costPrice,
          certificate_number: gemData.certificateNumber,
          in_stock: gemData.inStock,
          reserved: gemData.reserved,
          sold: gemData.sold,
          purchase_date: gemData.purchaseDate,
          treatment: gemData.treatment,
          color_comment: gemData.colorComment,
          certificate_type: gemData.certificateType,
          supplier: gemData.supplier,
          origin: gemData.origin,
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
      if (gemData.description !== undefined) updateData.description = gemData.description;
      if (gemData.measurements !== undefined) updateData.measurements = gemData.measurements;
      if (gemData.price !== undefined) updateData.price = gemData.price;
      if (gemData.costPrice !== undefined) updateData.cost_price = gemData.costPrice;
      if (gemData.certificateNumber !== undefined) updateData.certificate_number = gemData.certificateNumber;
      if (gemData.inStock !== undefined) updateData.in_stock = gemData.inStock;
      if (gemData.reserved !== undefined) updateData.reserved = gemData.reserved;
      if (gemData.sold !== undefined) updateData.sold = gemData.sold;
      if (gemData.purchaseDate !== undefined) updateData.purchase_date = gemData.purchaseDate;
      if (gemData.treatment !== undefined) updateData.treatment = gemData.treatment;
      if (gemData.colorComment !== undefined) updateData.color_comment = gemData.colorComment;
      if (gemData.certificateType !== undefined) updateData.certificate_type = gemData.certificateType;
      if (gemData.supplier !== undefined) updateData.supplier = gemData.supplier;
      if (gemData.origin !== undefined) updateData.origin = gemData.origin;
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

  const updateGemQuantities = async (id: string, inStock: number, reserved: number, sold: number) => {
    try {
      console.log(`🔄 useGems: Updating gem ${id} quantities - In Stock: ${inStock}, Reserved: ${reserved}, Sold: ${sold}`);
      
      const { error } = await supabase
        .from('gems')
        .update({ 
          in_stock: inStock,
          reserved: reserved,
          sold: sold
        })
        .eq('id', id);

      if (error) {
        console.error('❌ useGems: Supabase quantity update error:', error);
        throw error;
      }
      
      console.log(`✅ useGems: Successfully updated gem ${id} quantities`);
      await fetchGems();
      return { success: true };
    } catch (err) {
      console.error('❌ useGems: Update gem quantities error:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update gem quantities' };
    }
  };

  const moveToConsignment = async (id: string) => {
    const gem = gems.find(g => g.id === id);
    if (!gem || gem.inStock === 0) {
      return { success: false, error: 'No stock available to move to consignment' };
    }
    return updateGemQuantities(id, gem.inStock - 1, gem.reserved + 1, gem.sold);
  };

  const moveFromConsignmentToSold = async (id: string) => {
    const gem = gems.find(g => g.id === id);
    if (!gem || gem.reserved === 0) {
      return { success: false, error: 'No reserved stock available to sell' };
    }
    return updateGemQuantities(id, gem.inStock, gem.reserved - 1, gem.sold + 1);
  };

  const moveFromStockToSold = async (id: string) => {
    const gem = gems.find(g => g.id === id);
    if (!gem || gem.inStock === 0) {
      return { success: false, error: 'No stock available to sell' };
    }
    return updateGemQuantities(id, gem.inStock - 1, gem.reserved, gem.sold + 1);
  };

  const returnFromConsignment = async (id: string) => {
    const gem = gems.find(g => g.id === id);
    if (!gem || gem.reserved === 0) {
      return { success: false, error: 'No reserved stock to return' };
    }
    return updateGemQuantities(id, gem.inStock + 1, gem.reserved - 1, gem.sold);
  };

  const deleteGem = async (id: string) => {
    try {
      console.log(`🔄 useGems: Attempting to delete gem ${id}`);
      
      // First, check if gem is referenced in any invoices or consignments
      const { data: invoiceItems, error: invoiceError } = await supabase
        .from('invoice_items')
        .select('id')
        .eq('gem_id', id)
        .limit(1);

      if (invoiceError) {
        console.error('❌ useGems: Error checking invoice items:', invoiceError);
        throw invoiceError;
      }

      if (invoiceItems && invoiceItems.length > 0) {
        throw new Error('Cannot delete gem: It is referenced in one or more invoices');
      }

      const { data: consignmentItems, error: consignmentError } = await supabase
        .from('consignment_items')
        .select('id')
        .eq('gem_id', id)
        .limit(1);

      if (consignmentError) {
        console.error('❌ useGems: Error checking consignment items:', consignmentError);
        throw consignmentError;
      }

      if (consignmentItems && consignmentItems.length > 0) {
        throw new Error('Cannot delete gem: It is referenced in one or more consignments');
      }

      // If no references found, proceed with deletion
      const { error } = await supabase
        .from('gems')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ useGems: Supabase delete error:', error);
        throw error;
      }
      
      console.log(`✅ useGems: Successfully deleted gem ${id}`);
      await fetchGems();
      return { success: true };
    } catch (err) {
      console.error('❌ useGems: Delete gem error:', err);
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
    updateGemQuantities,
    moveToConsignment,
    moveFromConsignmentToSold,
    moveFromStockToSold,
    returnFromConsignment,
    deleteGem,
    refetch: fetchGems
  };
};
