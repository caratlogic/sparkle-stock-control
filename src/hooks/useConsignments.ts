import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Consignment {
  id: string;
  consignmentNumber: string;
  customerId: string;
  customerDetails: {
    id: string;
    customerId: string;
    name: string;
    email: string;
    phone: string;
    company?: string;
    taxId?: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country?: string;
    };
    dateAdded: string;
    totalPurchases: number;
    lastPurchaseDate?: string;
    notes?: string;
  };
  status: 'pending' | 'returned' | 'purchased' | 'inactive';
  dateCreated: string;
  returnDate: string;
  notes?: string;
  items: ConsignmentItem[];
}

interface ConsignmentItem {
  id: string;
  gemId: string;
  quantity: number;
  caratConsigned: number;
  pricePerCarat: number;
  totalPrice: number;
  productDetails?: {
    stockId: string;
    totalCarat: number;
    cut: string;
    color: string;
    description: string;
    measurements: string;
    certificateNumber: string;
    gemType?: string;
  };
}

export const useConsignments = () => {
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConsignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 useConsignments: Starting fetchConsignments...');
      
      const { data, error } = await supabase
        .from('consignments')
        .select(`
          *,
          customers (*),
          consignment_items (
            *,
            gems (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ useConsignments: Error fetching consignments:', error);
        throw error;
      }

      console.log('✅ useConsignments: Raw consignments data from database:', data);
      console.log(`📊 useConsignments: Found ${data?.length || 0} consignments in database`);

      if (!data || data.length === 0) {
        console.log('⚠️ useConsignments: No consignments found in database');
        setConsignments([]);
        return;
      }

      const transformedConsignments: Consignment[] = data.map((consignment, index) => {
        console.log(`🔄 useConsignments: Processing consignment ${index + 1}/${data.length}:`, {
          id: consignment.id,
          number: consignment.consignment_number,
          status: consignment.status,
          customer: consignment.customers?.name,
          itemsCount: consignment.consignment_items?.length || 0
        });
        
        if (!consignment.customers) {
          console.warn('⚠️ useConsignments: Missing customer data for consignment:', consignment.id);
        }
        
        return {
          id: consignment.id,
          consignmentNumber: consignment.consignment_number,
          customerId: consignment.customer_id,
          customerDetails: {
            id: consignment.customers?.id || '',
            customerId: consignment.customers?.customer_id || '',
            name: consignment.customers?.name || 'Unknown Customer',
            email: consignment.customers?.email || '',
            phone: consignment.customers?.phone || '',
            company: consignment.customers?.company || undefined,
            taxId: consignment.customers?.tax_id || undefined,
            address: {
              street: consignment.customers?.street || '',
              city: consignment.customers?.city || '',
              state: consignment.customers?.state || '',
              zipCode: consignment.customers?.zip_code || '',
              country: consignment.customers?.country || undefined
            },
            dateAdded: consignment.customers?.date_added || '',
            totalPurchases: parseFloat(consignment.customers?.total_purchases?.toString() || '0'),
            lastPurchaseDate: consignment.customers?.last_purchase_date || undefined,
            notes: consignment.customers?.notes || undefined
          },
          status: consignment.status as any,
          dateCreated: consignment.date_created,
          returnDate: consignment.return_date,
          notes: consignment.notes || undefined,
          items: (consignment.consignment_items || []).map((item: any) => ({
            id: item.id,
            gemId: item.gem_id,
            quantity: item.quantity,
            caratConsigned: parseFloat(item.carat_consigned?.toString() || '0'),
            pricePerCarat: parseFloat(item.unit_price?.toString() || '0'),
            totalPrice: parseFloat(item.total_price?.toString() || '0'),
            productDetails: item.gems ? {
              stockId: item.gems.stock_id || '',
              totalCarat: parseFloat(item.gems.carat?.toString() || '0'),
              cut: item.gems.shape || '',
              color: item.gems.color || '',
              description: item.gems.description || '',
              measurements: item.gems.measurements || '',
              certificateNumber: item.gems.certificate_number || '',
              gemType: item.gems.gem_type || undefined
            } : undefined
          }))
        };
      });

      console.log('✅ useConsignments: Successfully transformed consignments:', transformedConsignments);
      console.log(`📈 useConsignments: Setting ${transformedConsignments.length} consignments in state`);
      setConsignments(transformedConsignments);
    } catch (err) {
      console.error('❌ useConsignments: Error in fetchConsignments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch consignments');
    } finally {
      setLoading(false);
      console.log('🏁 useConsignments: fetchConsignments completed');
    }
  };

  const addConsignment = async (consignmentData: any) => {
    try {
      console.log('🔄 useConsignments: Adding new consignment:', consignmentData);
      
      // First, create the consignment
      const { data: consignmentResult, error: consignmentError } = await supabase
        .from('consignments')
        .insert({
          consignment_number: consignmentData.consignmentNumber,
          customer_id: consignmentData.customerId,
          status: consignmentData.status || 'pending',
          date_created: consignmentData.dateCreated,
          return_date: consignmentData.returnDate,
          notes: consignmentData.notes
        })
        .select()
        .single();

      if (consignmentError) {
        console.error('❌ useConsignments: Error creating consignment:', consignmentError);
        throw consignmentError;
      }

      console.log('✅ useConsignments: Successfully created consignment:', consignmentResult);

      // Then, create the consignment items
      if (consignmentData.items && consignmentData.items.length > 0) {
        const itemsToInsert = consignmentData.items.map((item: any) => ({
          consignment_id: consignmentResult.id,
          gem_id: item.gemId,
          quantity: item.quantity,
          carat_consigned: item.caratConsigned,
          unit_price: item.unitPrice,
          total_price: item.totalPrice
        }));

        const { error: itemsError } = await supabase
          .from('consignment_items')
          .insert(itemsToInsert);

        if (itemsError) {
          console.error('❌ useConsignments: Error creating consignment items:', itemsError);
          throw itemsError;
        }

        console.log('✅ useConsignments: Successfully created consignment items');
      }

      // Update gem status to 'On Consignment' for consigned gems
      if (consignmentData.items && consignmentData.items.length > 0) {
        for (const item of consignmentData.items) {
          console.log(`🔄 useConsignments: Updating gem ${item.gemId} status to "On Consignment"`);
          const { error: gemUpdateError } = await supabase
            .from('gems')
            .update({ status: 'On Consignment' })
            .eq('id', item.gemId);
          
          if (gemUpdateError) {
            console.error(`❌ useConsignments: Error updating gem ${item.gemId} status:`, gemUpdateError);
          } else {
            console.log(`✅ useConsignments: Successfully updated gem ${item.gemId} status to "On Consignment"`);
          }
        }
      }

      await fetchConsignments();
      return { success: true, data: consignmentResult };
    } catch (err) {
      console.error('❌ useConsignments: Error in addConsignment:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create consignment' };
    }
  };

  const updateConsignmentStatus = async (consignmentId: string, status: 'returned' | 'purchased' | 'inactive') => {
    try {
      console.log(`🔄 useConsignments: Updating consignment ${consignmentId} status to ${status}`);
      
      const { error } = await supabase
        .from('consignments')
        .update({ status })
        .eq('id', consignmentId);

      if (error) {
        console.error('❌ useConsignments: Error updating consignment status:', error);
        throw error;
      }

      console.log('✅ useConsignments: Successfully updated consignment status');

      // If consignment is returned, adjust quantities (move from reserved to in stock)
      if (status === 'returned') {
        const consignment = consignments.find(c => c.id === consignmentId);
        if (consignment) {
          console.log(`🔄 useConsignments: Adjusting quantities for ${consignment.items.length} gems back to 'In Stock'`);
          for (const item of consignment.items) {
            // Get current gem data
            const { data: currentGem, error: fetchError } = await supabase
              .from('gems')
              .select('in_stock, reserved')
              .eq('id', item.gemId)
              .single();

            if (fetchError) throw fetchError;

            await supabase
              .from('gems')
              .update({ 
                status: 'In Stock',
                in_stock: (currentGem.in_stock || 0) + item.quantity,
                reserved: Math.max(0, (currentGem.reserved || 0) - item.quantity)
              })
              .eq('id', item.gemId);
          }
          console.log('✅ useConsignments: Successfully adjusted quantities for returned consignment');
        }
      }

      // If consignment is purchased, adjust quantities (move from reserved to sold)
      if (status === 'purchased') {
        const consignment = consignments.find(c => c.id === consignmentId);
        if (consignment) {
          console.log(`🔄 useConsignments: Adjusting quantities for ${consignment.items.length} gems to 'Sold'`);
          for (const item of consignment.items) {
            // Get current gem data
            const { data: currentGem, error: fetchError } = await supabase
              .from('gems')
              .select('reserved, sold')
              .eq('id', item.gemId)
              .single();

            if (fetchError) throw fetchError;

            await supabase
              .from('gems')
              .update({ 
                status: 'Sold',
                reserved: Math.max(0, (currentGem.reserved || 0) - item.quantity),
                sold: (currentGem.sold || 0) + item.quantity
              })
              .eq('id', item.gemId);
          }
          console.log('✅ useConsignments: Successfully adjusted quantities for purchased consignment');
        }
      }

      await fetchConsignments();
      return { success: true };
    } catch (err) {
      console.error('❌ useConsignments: Error in updateConsignmentStatus:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update consignment' };
    }
  };

  const getConsignmentByGemId = async (gemId: string) => {
    try {
      console.log(`🔍 useConsignments: Looking for consignment with gem ID: ${gemId}`);
      
      const { data, error } = await supabase
        .from('consignment_items')
        .select(`
          *,
          consignments (*)
        `)
        .eq('gem_id', gemId)
        .eq('consignments.status', 'pending')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ useConsignments: Error fetching consignment by gem ID:', error);
        throw error;
      }
      
      const result = data ? {
        id: data.consignments.id,
        consignmentNumber: data.consignments.consignment_number,
        customerId: data.consignments.customer_id,
        status: data.consignments.status,
        dateCreated: data.consignments.date_created,
        returnDate: data.consignments.return_date,
        notes: data.consignments.notes || undefined,
        items: []
      } : null;
      
      console.log('✅ useConsignments: Found consignment by gem ID:', result);
      return result;
    } catch (err) {
      console.error('❌ useConsignments: Error in getConsignmentByGemId:', err);
      return null;
    }
  };

  const deleteConsignment = async (consignmentId: string) => {
    try {
      console.log(`🗑️ useConsignments: Deleting consignment: ${consignmentId}`);
      
      // First, get the consignment to adjust quantities
      const consignment = consignments.find(c => c.id === consignmentId);
      if (consignment) {
        console.log(`🔄 useConsignments: Adjusting quantities for ${consignment.items.length} gems back to 'In Stock'`);
        for (const item of consignment.items) {
          // Get current gem data
          const { data: currentGem, error: fetchError } = await supabase
            .from('gems')
            .select('in_stock, reserved, sold')
            .eq('id', item.gemId)
            .single();

          if (fetchError) throw fetchError;

          const newInStock = (currentGem.in_stock || 0) + item.quantity;
          const newReserved = Math.max(0, (currentGem.reserved || 0) - item.quantity);
          
          // Determine status based on quantities - if in_stock > 0, always "In Stock"
          let newStatus: 'In Stock' | 'Sold' | 'Reserved';
          if (newInStock > 0) {
            newStatus = 'In Stock';
          } else if (newReserved > 0) {
            newStatus = 'Reserved';
          } else {
            newStatus = 'Sold';
          }

          await supabase
            .from('gems')
            .update({ 
              status: newStatus,
              in_stock: newInStock,
              reserved: newReserved
            })
            .eq('id', item.gemId);
        }
        console.log('✅ useConsignments: Successfully adjusted quantities before deletion');
      }
      
      const { error } = await supabase
        .from('consignments')
        .delete()
        .eq('id', consignmentId);

      if (error) {
        console.error('❌ useConsignments: Error deleting consignment:', error);
        throw error;
      }

      console.log('✅ useConsignments: Successfully deleted consignment');
      await fetchConsignments();
      return { success: true };
    } catch (err) {
      console.error('❌ useConsignments: Error in deleteConsignment:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete consignment' };
    }
  };

  useEffect(() => {
    console.log('🚀 useConsignments: Initializing hook - setting up subscriptions and initial fetch');
    
    fetchConsignments();
    
    // Set up real-time subscription for consignments
    const channel = supabase
      .channel('consignments-realtime-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'consignments' }, 
        (payload) => {
          console.log('🔔 useConsignments: Real-time consignment change detected:', {
            event: payload.eventType,
            table: 'consignments',
            id: (payload.new && typeof payload.new === 'object' && 'id' in payload.new) 
              ? payload.new.id 
              : (payload.old && typeof payload.old === 'object' && 'id' in payload.old) 
                ? payload.old.id 
                : 'unknown',
            payload: payload
          });
          fetchConsignments();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'consignment_items' }, 
        (payload) => {
          console.log('🔔 useConsignments: Real-time consignment_items change detected:', {
            event: payload.eventType,
            table: 'consignment_items',
            id: (payload.new && typeof payload.new === 'object' && 'id' in payload.new) 
              ? payload.new.id 
              : (payload.old && typeof payload.old === 'object' && 'id' in payload.old) 
                ? payload.old.id 
                : 'unknown',
            payload: payload
          });
          fetchConsignments();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'customers' }, 
        (payload) => {
          console.log('🔔 useConsignments: Real-time customers change detected:', {
            event: payload.eventType,
            table: 'customers',
            id: (payload.new && typeof payload.new === 'object' && 'id' in payload.new) 
              ? payload.new.id 
              : (payload.old && typeof payload.old === 'object' && 'id' in payload.old) 
                ? payload.old.id 
                : 'unknown'
          });
          fetchConsignments();
        }
      )
      .subscribe((status) => {
        console.log('📡 useConsignments: Subscription status:', status);
      });

    return () => {
      console.log('🧹 useConsignments: Cleaning up - removing subscriptions');
      supabase.removeChannel(channel);
    };
  }, []);

  // Add effect to log state changes
  useEffect(() => {
    console.log('📊 useConsignments: State updated:', {
      consignmentsCount: consignments.length,
      loading,
      error,
      consignmentNumbers: consignments.map(c => c.consignmentNumber)
    });
  }, [consignments, loading, error]);

  return {
    consignments,
    loading,
    error,
    addConsignment,
    updateConsignmentStatus,
    deleteConsignment,
    getConsignmentByGemId,
    refetch: fetchConsignments
  };
};
