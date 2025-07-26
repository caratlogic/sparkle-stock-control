import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, ArrowRight } from 'lucide-react';
import { useMergeSplitHistory } from '@/hooks/useMergeSplitHistory';
import { MergeSplitHistoryRecord } from '@/types/mergeSplit';
import { format } from 'date-fns';

interface RecentMergeSplitCardProps {
  onViewFullHistory?: () => void;
}

export const RecentMergeSplitCard: React.FC<RecentMergeSplitCardProps> = ({ onViewFullHistory }) => {
  const { getRecentOperations } = useMergeSplitHistory();
  const [recentOperations, setRecentOperations] = useState<MergeSplitHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentOperations = async () => {
      setLoading(true);
      try {
        const operations = await getRecentOperations(5);
        setRecentOperations(operations);
      } catch (error) {
        console.error('Error fetching recent operations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOperations();
  }, [getRecentOperations]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <History className="h-4 w-4" />
            Recent Merges/Splits
          </CardTitle>
          <CardDescription>Last 5 operations</CardDescription>
        </div>
        {onViewFullHistory && (
          <Button variant="ghost" size="sm" onClick={onViewFullHistory}>
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        ) : recentOperations.length === 0 ? (
          <div className="flex items-center justify-center py-4">
            <div className="text-sm text-muted-foreground">No recent operations</div>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOperations.map((operation) => (
              <div key={operation.id} className="flex items-center justify-between p-2 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={operation.operation_type === 'Merge' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {operation.operation_type}
                  </Badge>
                  <div>
                    <div className="text-sm font-medium">
                      {operation.original_stock_numbers.join(', ')} → {operation.new_stock_numbers.join(', ')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {operation.original_carat}ct → {operation.new_carat}ct
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(operation.created_at), 'MMM dd')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {operation.user_email.split('@')[0]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};