import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GemTable } from './GemTable';
import { DiamondTable } from './DiamondTable';
import { GemForm } from './GemForm';
import { DiamondForm } from './DiamondForm';
import { useGems } from '../hooks/useGems';
import { useDiamonds } from '../hooks/useDiamonds';
import { Gem } from '../types/gem';
import { Diamond } from '../types/diamond';
import { Badge } from '@/components/ui/badge';
import { Gem as GemIcon, Diamond as DiamondIcon, TrendingUp, DollarSign } from 'lucide-react';

interface StoneInventoryDashboardProps {
  onCreateInvoice?: (gem: Gem) => void;
  onCreateConsignment?: (gem: Gem) => void;
  onCreateDiamondInvoice?: (diamond: Diamond) => void;
  onCreateDiamondConsignment?: (diamond: Diamond) => void;
}

export const StoneInventoryDashboard = ({ 
  onCreateInvoice, 
  onCreateConsignment,
  onCreateDiamondInvoice,
  onCreateDiamondConsignment 
}: StoneInventoryDashboardProps) => {
  const {
    gems,
    loading: gemsLoading,
    addGem,
    updateGem,
    deleteGem
  } = useGems();

  const {
    diamonds,
    loading: diamondsLoading,
    addDiamond,
    updateDiamond,
    deleteDiamond
  } = useDiamonds();

  const [showGemForm, setShowGemForm] = useState(false);
  const [showDiamondForm, setShowDiamondForm] = useState(false);
  const [editingGem, setEditingGem] = useState<Gem | null>(null);
  const [editingDiamond, setEditingDiamond] = useState<Diamond | null>(null);
  const [activeTab, setActiveTab] = useState('gems');

  // Calculate summary statistics
  const gemStats = {
    totalItems: gems.length,
    totalValue: gems.reduce((sum, gem) => sum + (gem.price * gem.inStock), 0),
    inStock: gems.filter(gem => gem.status === 'In Stock').length,
    reserved: gems.filter(gem => gem.status === 'Reserved').length,
    sold: gems.filter(gem => gem.status === 'Sold').length
  };

  const diamondStats = {
    totalItems: diamonds.length,
    totalValue: diamonds.reduce((sum, diamond) => sum + (diamond.retail_price * diamond.in_stock), 0),
    inStock: diamonds.filter(diamond => diamond.status === 'In Stock').length,
    reserved: diamonds.filter(diamond => diamond.status === 'Reserved').length,
    sold: diamonds.filter(diamond => diamond.status === 'Sold').length
  };

  const totalStats = {
    totalItems: gemStats.totalItems + diamondStats.totalItems,
    totalValue: gemStats.totalValue + diamondStats.totalValue,
    inStock: gemStats.inStock + diamondStats.inStock,
    reserved: gemStats.reserved + diamondStats.reserved,
    sold: gemStats.sold + diamondStats.sold
  };

  const handleGemSubmit = async (gemData: any) => {
    try {
      if (editingGem) {
        await updateGem(editingGem.id, gemData);
      } else {
        await addGem(gemData);
      }
      setShowGemForm(false);
      setEditingGem(null);
    } catch (error) {
      console.error('Error saving gem:', error);
    }
  };

  const handleDiamondSubmit = async (diamondData: any) => {
    try {
      if (editingDiamond) {
        await updateDiamond(editingDiamond.id, diamondData);
      } else {
        await addDiamond(diamondData);
      }
      setShowDiamondForm(false);
      setEditingDiamond(null);
    } catch (error) {
      console.error('Error saving diamond:', error);
    }
  };

  const handleEditGem = (gem: Gem) => {
    setEditingGem(gem);
    setShowGemForm(true);
  };

  const handleEditDiamond = (diamond: Diamond) => {
    setEditingDiamond(diamond);
    setShowDiamondForm(true);
  };

  if (showGemForm) {
    return (
      <GemForm
        gem={editingGem}
        onSubmit={handleGemSubmit}
        onCancel={() => {
          setShowGemForm(false);
          setEditingGem(null);
        }}
      />
    );
  }

  if (showDiamondForm) {
    return (
      <DiamondForm
        diamond={editingDiamond}
        onSubmit={handleDiamondSubmit}
        onCancel={() => {
          setShowDiamondForm(false);
          setEditingDiamond(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalItems}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                <GemIcon className="h-3 w-3 mr-1" />
                {gemStats.totalItems} Gems
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <DiamondIcon className="h-3 w-3 mr-1" />
                {diamondStats.totalItems} Diamonds
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalStats.totalValue.toLocaleString()}
            </div>
            <div className="flex gap-2 mt-2">
              <div className="text-xs text-muted-foreground">
                Gems: ${gemStats.totalValue.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Diamonds: ${diamondStats.totalValue.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <Badge variant="default">{totalStats.inStock}</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Gems:</span>
                <span>{gemStats.inStock}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Diamonds:</span>
                <span>{diamondStats.inStock}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Reserved:</span>
                <span>{totalStats.reserved}</span>
              </div>
              <div className="flex justify-between">
                <span>Sold:</span>
                <span>{totalStats.sold}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Stone Inventory Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="gems" className="flex items-center gap-2">
                <GemIcon className="h-4 w-4" />
                Gems ({gemStats.totalItems})
              </TabsTrigger>
              <TabsTrigger value="diamonds" className="flex items-center gap-2">
                <DiamondIcon className="h-4 w-4" />
                Diamonds ({diamondStats.totalItems})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gems" className="mt-6">
              <GemTable
                gems={gems}
                onEdit={handleEditGem}
                onDelete={deleteGem}
                onAdd={() => setShowGemForm(true)}
                onCreateInvoice={onCreateInvoice}
                onCreateConsignment={onCreateConsignment}
              />
            </TabsContent>

            <TabsContent value="diamonds" className="mt-6">
              <DiamondTable
                diamonds={diamonds}
                onEdit={handleEditDiamond}
                onDelete={deleteDiamond}
                onCreateInvoice={onCreateDiamondInvoice}
                onCreateConsignment={onCreateDiamondConsignment}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};