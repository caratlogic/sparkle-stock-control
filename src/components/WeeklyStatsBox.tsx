import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Diamond } from 'lucide-react';
import { Gem } from '../types/gem';
interface WeeklyStatsBoxProps {
  gems: Gem[];
}
export const WeeklyStatsBox = ({
  gems
}: WeeklyStatsBoxProps) => {
  // Calculate stones added this week
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const stonesAddedThisWeek = gems.filter(gem => {
    const gemDate = new Date(gem.dateAdded);
    return gemDate >= oneWeekAgo && gemDate <= now;
  }).length;

  // Calculate total cost price and selling price based on available inventory
  const totalCostPrice = gems.reduce((total, gem) => {
    // Handle gems with 0 carat (bulk gems) vs individual gems
    if (gem.carat === 0) {
      // For bulk gems, cost_price is likely per unit
      return total + (gem.inStock * gem.costPrice);
    } else {
      // For individual gems: Total Cost Price = Total Carat Available × Cost Price per Carat
      // Total Carat Available = carat * inStock
      // Cost Price per Carat = costPrice / carat  
      // So: Total Cost Price = (carat * inStock) * (costPrice / carat) = inStock * costPrice
      return total + (gem.inStock * gem.costPrice);
    }
  }, 0);
  const totalSellingPrice = gems.reduce((total, gem) => {
    // Handle gems with 0 carat (bulk gems) vs individual gems
    if (gem.carat === 0) {
      // For bulk gems, price is likely per unit
      return total + (gem.inStock * (gem.retailPrice || gem.price));
    } else {
      // For individual gems: Total Selling Price = Total Carat Available × Selling Price per Carat
      return total + (gem.inStock * (gem.retailPrice || gem.price));
    }
  }, 0);
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
          <CardTitle className="text-sm font-medium">Total Cost Price</CardTitle>
          <Diamond className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalCostPrice.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Total inventory cost value
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
            Total inventory selling value
          </p>
        </CardContent>
      </Card>
    </div>;
};