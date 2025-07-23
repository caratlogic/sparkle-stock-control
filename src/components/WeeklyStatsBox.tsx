import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Diamond } from 'lucide-react';
import { Gem } from '../types/gem';

interface WeeklyStatsBoxProps {
  gems: Gem[];
}

export const WeeklyStatsBox = ({ gems }: WeeklyStatsBoxProps) => {
  // Calculate stones added this week
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const stonesAddedThisWeek = gems.filter(gem => {
    const gemDate = new Date(gem.dateAdded);
    return gemDate >= oneWeekAgo && gemDate <= now;
  }).length;

  // Calculate total selling price and total cost price
  const totalSellingPrice = gems.reduce((total, gem) => {
    return total + (gem.price || 0);
  }, 0);

  const totalCostPrice = gems.reduce((total, gem) => {
    return total + (gem.costPrice || 0);
  }, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Stones Added This Week</CardTitle>
          <Diamond className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stonesAddedThisWeek}</div>
          <p className="text-xs text-muted-foreground">
            New stones in inventory
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Selling Price</CardTitle>
          <Diamond className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalSellingPrice.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Total inventory value
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cost Price</CardTitle>
          <Diamond className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalCostPrice.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Total cost investment
          </p>
        </CardContent>
      </Card>
    </div>
  );
};