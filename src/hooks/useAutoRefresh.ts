import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseAutoRefreshProps {
  onRefresh: () => void;
  tables?: string[];
  enabled?: boolean;
}

export const useAutoRefresh = ({ 
  onRefresh, 
  tables = [], 
  enabled = true 
}: UseAutoRefreshProps) => {
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled || tables.length === 0) return;

    // Create a single channel for all table subscriptions
    const channel = supabase.channel('auto-refresh-changes');

    // Subscribe to changes for each table
    tables.forEach(tableName => {
      channel.on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: tableName
        },
        (payload) => {
          console.log(`Change detected in ${tableName}:`, payload);
          // Add a small delay to avoid rapid-fire refreshes
          setTimeout(() => {
            onRefresh();
          }, 500);
        }
      );
    });

    // Subscribe to the channel
    channel.subscribe();
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [onRefresh, tables, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);
};