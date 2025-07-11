
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
        status: gem.status as any,
        dateAdded: gem.date_added,
        notes: gem.notes || undefined,
        imageUrl: gem.image_url || undefined,
        treatment: gem.treatment || undefined,
        colorComment: gem.color_comment || undefined,
        certificateType: gem.certificate_type || undefined,
        supplier: gem.supplier || undefined,
        purchaseDate: gem.purchase_date || undefined,
        origin: gem.origin || undefined,
        inStock: gem.in_stock || 0,
        reserved: gem.reserved || 0,
        sold: gem.sold || 0,
        updatedAt: gem.updated_at || undefined,
        updatedBy: gem.updated_by || undefined
      }));

      setGems(transformedGems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gems');
    } finally {
      setLoading(false);
    }
  };

  const updateGemStatusesBasedOnRelationships = async () => {
    try {
      console.log('🔄 useGems: Updating gem statuses based on relationships...');
      
      // Get all gems
      const { data: allGems, error: gemsError } = await supabase
        .from('gems')
        .select('id, stock_id');

      if (gemsError) throw gemsError;

      // Get all invoice items
      const { data: invoiceItems, error: invoiceError } = await supabase
        .from('invoice_items')
        .select('gem_id');

      if (invoiceError) throw invoiceError;

      // Get all consignment items
      const { data: consignmentItems, error: consignmentError } = await supabase
        .from('consignment_items')
        .select('gem_id');

      if (consignmentError) throw consignmentError;

      const invoicedGemIds = new Set(invoiceItems?.map(item => item.gem_id) || []);
      const consignedGemIds = new Set(consignmentItems?.map(item => item.gem_id) || []);

      // Update status for each gem
      for (const gem of allGems || []) {
        let newStatus: 'In Stock' | 'Sold' | 'Reserved';
        
        if (invoicedGemIds.has(gem.id)) {
          newStatus = 'Sold';
        } else if (consignedGemIds.has(gem.id)) {
          newStatus = 'Reserved';
        } else {
          newStatus = 'In Stock';
        }

        // Update gem status in database
        const { error: updateError } = await supabase
          .from('gems')
          .update({ status: newStatus })
          .eq('id', gem.id);

        if (updateError) {
          console.error(`❌ useGems: Error updating status for gem ${gem.stock_id}:`, updateError);
        } else {
          console.log(`✅ useGems: Updated gem ${gem.stock_id} status to ${newStatus}`);
        }
      }

      console.log('✅ useGems: Finished updating gem statuses');
      await fetchGems();
      return { success: true };
    } catch (err) {
      console.error('❌ useGems: Error updating gem statuses:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update gem statuses' };
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
          status: gemData.status,
          notes: gemData.notes,
          image_url: gemData.imageUrl,
          treatment: gemData.treatment,
          color_comment: gemData.colorComment,
          certificate_type: gemData.certificateType,
          supplier: gemData.supplier,
          purchase_date: gemData.purchaseDate,
          origin: gemData.origin,
          in_stock: 20, // Default 20 in stock
          reserved: 0,
          sold: 0
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
      if (gemData.status !== undefined) updateData.status = gemData.status;
      if (gemData.notes !== undefined) updateData.notes = gemData.notes;
      if (gemData.imageUrl !== undefined) updateData.image_url = gemData.imageUrl;
      if (gemData.treatment !== undefined) updateData.treatment = gemData.treatment === 'none' ? null : gemData.treatment;
      if (gemData.colorComment !== undefined) updateData.color_comment = gemData.colorComment === 'none' ? null : gemData.colorComment;
      if (gemData.certificateType !== undefined) updateData.certificate_type = gemData.certificateType === 'none' ? null : gemData.certificateType;
      if (gemData.supplier !== undefined) updateData.supplier = gemData.supplier;
      if (gemData.purchaseDate !== undefined) updateData.purchase_date = gemData.purchaseDate;
      if (gemData.origin !== undefined) updateData.origin = gemData.origin;
      if (gemData.inStock !== undefined) updateData.in_stock = gemData.inStock;

      console.log('Updating gem with data:', updateData);

      // Force updated_at to current timestamp
      updateData.updated_at = new Date().toISOString();

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

  const updateGemStatus = async (id: string, status: 'In Stock' | 'Sold' | 'Reserved') => {
    try {
      console.log(`🔄 useGems: Updating gem ${id} status to ${status}`);
      
      const { error } = await supabase
        .from('gems')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('❌ useGems: Supabase status update error:', error);
        throw error;
      }
      
      console.log(`✅ useGems: Successfully updated gem ${id} status to ${status}`);
      await fetchGems();
      return { success: true };
    } catch (err) {
      console.error('❌ useGems: Update gem status error:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update gem status' };
    }
  };

  // New function to update gem quantities when creating consignments - now with carat tracking
  const updateGemQuantityForConsignment = async (gemId: string, quantity: number = 1, caratAmount: number = 0) => {
    try {
      console.log(`🔄 useGems: Updating gem ${gemId} for consignment (quantity: ${quantity}, carat: ${caratAmount})`);
      
      // First get the current gem data
      const { data: currentGem, error: fetchError } = await supabase
        .from('gems')
        .select('in_stock, reserved, carat')
        .eq('id', gemId)
        .single();

      if (fetchError) throw fetchError;

      // Ensure in_stock never goes below 0
      const newInStock = Math.max(0, (currentGem.in_stock || 0) - quantity);
      const newReserved = (currentGem.reserved || 0) + quantity;
      const newTotalCarat = Math.max(0, (currentGem.carat || 0) - caratAmount);
      
      // Determine status based on total carat and quantities
      let newStatus: 'In Stock' | 'Sold' | 'Reserved';
      if (newTotalCarat <= 0) {
        newStatus = 'Sold';
      } else if (newInStock > 0) {
        newStatus = 'In Stock';
      } else if (newReserved > 0) {
        newStatus = 'Reserved';
      } else {
        newStatus = 'Sold';
      }

      const { error } = await supabase
        .from('gems')
        .update({ 
          in_stock: newInStock,
          reserved: newReserved,
          carat: newTotalCarat,
          status: newStatus
        })
        .eq('id', gemId);

      if (error) {
        console.error('❌ useGems: Error updating gem for consignment:', error);
        throw error;
      }
      
      console.log(`✅ useGems: Successfully updated gem ${gemId} for consignment`);
      await fetchGems();
      return { success: true };
    } catch (err) {
      console.error('❌ useGems: Update gem for consignment error:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update gem for consignment' };
    }
  };

  // New function to update gem quantities when creating invoices - now with carat tracking
  const updateGemQuantityForInvoice = async (gemId: string, quantity: number = 1, caratAmount: number = 0, fromConsignment: boolean = false) => {
    try {
      console.log(`🔄 useGems: Updating gem ${gemId} for invoice (quantity: ${quantity}, carat: ${caratAmount}, fromConsignment: ${fromConsignment})`);
      
      // First get the current gem data
      const { data: currentGem, error: fetchError } = await supabase
        .from('gems')
        .select('in_stock, reserved, sold, carat')
        .eq('id', gemId)
        .single();

      if (fetchError) throw fetchError;

      let newInStock = currentGem.in_stock || 0;
      let newReserved = currentGem.reserved || 0;
      let newSold = (currentGem.sold || 0) + quantity;
      let newTotalCarat = (currentGem.carat || 0) - caratAmount;

      if (fromConsignment) {
        // Moving from consignment to sold
        newReserved = Math.max(0, newReserved - quantity);
      } else {
        // Moving directly from stock to sold
        newInStock = Math.max(0, newInStock - quantity);
      }

      // Determine status based on total carat - if carat is 0, item is sold out
      let newStatus: 'In Stock' | 'Sold' | 'Reserved';
      if (newTotalCarat <= 0) {
        newStatus = 'Sold';
        newTotalCarat = 0;
      } else if (newInStock > 0) {
        newStatus = 'In Stock';
      } else if (newReserved > 0) {
        newStatus = 'Reserved';
      } else {
        newStatus = 'Sold';
      }

      const { error } = await supabase
        .from('gems')
        .update({
          in_stock: newInStock,
          reserved: newReserved,
          sold: newSold,
          carat: Math.max(0, newTotalCarat),
          status: newStatus
        })
        .eq('id', gemId);

      if (error) {
        console.error('❌ useGems: Error updating gem for invoice:', error);
        throw error;
      }
      
      console.log(`✅ useGems: Successfully updated gem ${gemId} for invoice`);
      await fetchGems();
      return { success: true };
    } catch (err) {
      console.error('❌ useGems: Update gem for invoice error:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update gem for invoice' };
    }
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
    updateGemStatus,
    deleteGem,
    updateGemQuantityForConsignment,
    updateGemQuantityForInvoice,
    refetch: fetchGems
  };
};
