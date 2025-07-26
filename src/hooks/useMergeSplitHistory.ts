import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MergeSplitHistoryRecord, MergeSplitOperation, MergeSplitFilters } from '@/types/mergeSplit';
import { useToast } from '@/hooks/use-toast';

export const useMergeSplitHistory = () => {
  const [history, setHistory] = useState<MergeSplitHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchHistory = async (filters?: MergeSplitFilters) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('merge_split_history')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }
      if (filters?.operationType) {
        query = query.eq('operation_type', filters.operationType);
      }
      if (filters?.userEmail) {
        query = query.ilike('user_email', `%${filters.userEmail}%`);
      }
      if (filters?.stockNumber) {
        query = query.or(
          `original_stock_numbers.cs.{${filters.stockNumber}},new_stock_numbers.cs.{${filters.stockNumber}}`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching merge/split history:', error);
        setError(error.message);
        toast({
          title: "Error",
          description: "Failed to fetch merge/split history",
          variant: "destructive",
        });
        return;
      }

      setHistory(data || []);
    } catch (err) {
      console.error('Error in fetchHistory:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addMergeSplitRecord = async (operation: MergeSplitOperation) => {
    try {
      const { error } = await supabase
        .from('merge_split_history')
        .insert([operation]);

      if (error) {
        console.error('Error adding merge/split record:', error);
        toast({
          title: "Error",
          description: "Failed to record merge/split operation",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: `${operation.operation_type} operation recorded successfully`,
      });

      // Refresh the history
      await fetchHistory();
      return true;
    } catch (err) {
      console.error('Error in addMergeSplitRecord:', err);
      toast({
        title: "Error",
        description: "Failed to record operation",
        variant: "destructive",
      });
      return false;
    }
  };

  const getRecentOperations = async (limit: number = 5) => {
    try {
      const { data, error } = await supabase
        .from('merge_split_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent operations:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error in getRecentOperations:', err);
      return [];
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchHistory();

    const channel = supabase
      .channel('merge_split_history_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'merge_split_history'
        },
        () => {
          fetchHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    history,
    loading,
    error,
    fetchHistory,
    addMergeSplitRecord,
    getRecentOperations,
    refetch: fetchHistory
  };
};