import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  dateCreated: string;
  status: string;
  subtotal: number;
  discountPercentage: number;
  total: number;
  validUntil: string | null;
  notes: string | null;
  terms: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
  currency?: string;
}

export interface QuotationItem {
  id: string;
  quotationId: string;
  gemId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  createdAt: string;
}

export const useQuotations = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const quotationsWithItems = data?.map(quotation => ({
        id: quotation.id,
        quotationNumber: quotation.quotation_number,
        customerId: quotation.customer_id,
        dateCreated: quotation.date_created,
        status: quotation.status,
        subtotal: quotation.subtotal,
        discountPercentage: quotation.discount_percentage,
        total: quotation.total,
        validUntil: quotation.valid_until,
        notes: quotation.notes,
        terms: quotation.terms,
        createdAt: quotation.created_at,
        updatedAt: quotation.updated_at,
        updatedBy: quotation.updated_by,
        currency: quotation.currency || 'USD',
      })) || [];

      setQuotations(quotationsWithItems);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch quotations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotationItems = async (quotationId: string): Promise<QuotationItem[]> => {
    try {
      const { data, error } = await supabase
        .from('quotation_items')
        .select('*')
        .eq('quotation_id', quotationId);

      if (error) {
        throw error;
      }

      return data?.map(item => ({
        id: item.id,
        quotationId: item.quotation_id,
        gemId: item.gem_id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        discount: item.discount,
        totalPrice: item.total_price,
        createdAt: item.created_at,
      })) || [];
    } catch (error) {
      console.error('Error fetching quotation items:', error);
      return [];
    }
  };

  const updateQuotationStatus = async (quotationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('quotations')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', quotationId);

      if (error) {
        throw error;
      }

      // Refresh quotations after update
      await fetchQuotations();
      
      return { success: true };
    } catch (error) {
      console.error('Error updating quotation status:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update quotation status' 
      };
    }
  };

  const deleteQuotation = async (quotationId: string) => {
    try {
      // First delete quotation items
      const { error: itemsError } = await supabase
        .from('quotation_items')
        .delete()
        .eq('quotation_id', quotationId);

      if (itemsError) {
        throw itemsError;
      }

      // Then delete the quotation
      const { error: quotationError } = await supabase
        .from('quotations')
        .delete()
        .eq('id', quotationId);

      if (quotationError) {
        throw quotationError;
      }

      // Refresh quotations after deletion
      await fetchQuotations();
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting quotation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete quotation' 
      };
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  return {
    quotations,
    loading,
    fetchQuotations,
    fetchQuotationItems,
    updateQuotationStatus,
    deleteQuotation,
  };
};