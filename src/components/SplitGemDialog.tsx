import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";
import { Gem } from '@/types/gem';
import { useGems } from '@/hooks/useGems';
import { logSplitOperation } from '@/utils/mergeSplitOperations';
import { toast } from "sonner";

interface SplitPortion {
  stockId: string;
  carat: number;
  costPrice: number;
  price: number;
}

interface SplitGemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedGem: Gem | null;
  onSuccess: () => void;
}

export const SplitGemDialog = ({ open, onOpenChange, selectedGem, onSuccess }: SplitGemDialogProps) => {
  const { addGem, updateGem } = useGems();
  const [splitPortions, setSplitPortions] = useState<SplitPortion[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && selectedGem) {
      // Initialize with 2 portions
      const prefix = selectedGem.stockId.replace(/\d+$/, '');
      const timestamp = Date.now().toString().slice(-4);
      setSplitPortions([
        {
          stockId: `${prefix}S${timestamp}A`,
          carat: Math.round((selectedGem.carat / 2) * 100) / 100,
          costPrice: Math.round((selectedGem.costPrice / 2) * 100) / 100,
          price: Math.round((selectedGem.price / 2) * 100) / 100,
        },
        {
          stockId: `${prefix}S${timestamp}B`,
          carat: Math.round((selectedGem.carat / 2) * 100) / 100,
          costPrice: Math.round((selectedGem.costPrice / 2) * 100) / 100,
          price: Math.round((selectedGem.price / 2) * 100) / 100,
        }
      ]);
      setNotes(`Split from ${selectedGem.stockId}`);
    }
  }, [open, selectedGem]);

  const addPortion = () => {
    if (!selectedGem) return;
    
    const prefix = selectedGem.stockId.replace(/\d+$/, '');
    const timestamp = Date.now().toString().slice(-4);
    const letter = String.fromCharCode(65 + splitPortions.length); // A, B, C, etc.
    
    setSplitPortions([...splitPortions, {
      stockId: `${prefix}S${timestamp}${letter}`,
      carat: 0,
      costPrice: 0,
      price: 0,
    }]);
  };

  const removePortion = (index: number) => {
    if (splitPortions.length <= 2) {
      toast.error("You must have at least 2 portions");
      return;
    }
    setSplitPortions(splitPortions.filter((_, i) => i !== index));
  };

  const updatePortion = (index: number, field: keyof SplitPortion, value: string) => {
    const newPortions = [...splitPortions];
    if (field === 'stockId') {
      newPortions[index][field] = value;
    } else {
      newPortions[index][field] = parseFloat(value) || 0;
    }
    setSplitPortions(newPortions);
  };

  const totalCarat = splitPortions.reduce((sum, portion) => sum + portion.carat, 0);
  const totalCostPrice = splitPortions.reduce((sum, portion) => sum + portion.costPrice, 0);
  const totalPrice = splitPortions.reduce((sum, portion) => sum + portion.price, 0);

  const isValid = () => {
    if (!selectedGem) return false;
    
    // Check if all portions have valid data
    const allPortionsValid = splitPortions.every(portion => 
      portion.stockId.trim() && 
      portion.carat > 0 && 
      portion.costPrice >= 0 && 
      portion.price >= 0
    );

    // Check if totals match original (within reasonable tolerance)
    const caratMatch = Math.abs(totalCarat - selectedGem.carat) < 0.01;
    const costMatch = Math.abs(totalCostPrice - selectedGem.costPrice) < 0.01;
    const priceMatch = Math.abs(totalPrice - selectedGem.price) < 0.01;

    return allPortionsValid && caratMatch && costMatch && priceMatch;
  };

  const handleSplit = async () => {
    if (!selectedGem || !isValid()) {
      toast.error("Please ensure all portions are valid and totals match the original gem");
      return;
    }

    setLoading(true);
    try {
      const newGems: Gem[] = [];

      // Create new gems for each portion
      for (const portion of splitPortions) {
        const newGem: Omit<Gem, 'id' | 'stockId' | 'dateAdded'> = {
          gemType: selectedGem.gemType,
          stockType: 'single',
          carat: portion.carat,
          cut: selectedGem.cut,
          color: selectedGem.color,
          description: selectedGem.description,
          measurements: selectedGem.measurements,
          price: portion.price,
          retailPrice: selectedGem.retailPrice,
          costPrice: portion.costPrice,
          certificateNumber: `SPLIT-${portion.stockId}`,
          status: 'In Stock',
          notes: `${notes}. Original: ${selectedGem.stockId}`,
          imageUrl: selectedGem.imageUrl,
          treatment: selectedGem.treatment,
          certificateType: selectedGem.certificateType,
          supplier: selectedGem.supplier,
          purchaseDate: selectedGem.purchaseDate,
          origin: selectedGem.origin,
          inStock: 1,
          reserved: 0,
          sold: 0,
          ownershipStatus: selectedGem.ownershipStatus,
          associatedEntity: selectedGem.associatedEntity,
          partnerPercentage: selectedGem.partnerPercentage
        };

        const result = await addGem(newGem);
        if (!result.success) {
          throw new Error(result.error || `Failed to create split gem ${portion.stockId}`);
        }
        const createdGem = { ...newGem, stockId: portion.stockId, id: '', dateAdded: new Date().toISOString() } as Gem;
        newGems.push(createdGem);
      }

      // Update the original gem to mark it as split/out of stock
      await updateGem(selectedGem.id, {
        status: 'Sold', // Mark as sold to remove from active inventory
        notes: `${selectedGem.notes || ''}\nSplit into: ${splitPortions.map(p => p.stockId).join(', ')}`.trim(),
        inStock: 0,
        sold: selectedGem.inStock || 1
      });

      // Log the split operation
      await logSplitOperation(selectedGem, newGems, 'admin@diamond.com', notes);

      toast.success(`Successfully split ${selectedGem.stockId} into ${splitPortions.length} gems`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error splitting gem:', error);
      toast.error('Failed to split gem. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedGem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Split Gem</DialogTitle>
          <DialogDescription>
            Split {selectedGem.stockId} into multiple portions. Totals must match the original gem.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Original Gem Info */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{selectedGem.stockId}</Badge>
              <span className="text-sm text-muted-foreground">Original Gem</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div>
                <div className="font-medium">{selectedGem.carat}ct</div>
                <div className="text-sm text-muted-foreground">Carat</div>
              </div>
              <div>
                <div className="font-medium">${selectedGem.costPrice.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Cost Price</div>
              </div>
              <div>
                <div className="font-medium">${selectedGem.price.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Selling Price</div>
              </div>
            </div>
          </div>

          {/* Split Portions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Split Portions ({splitPortions.length})</Label>
              <Button variant="outline" size="sm" onClick={addPortion}>
                <Plus className="h-4 w-4 mr-1" />
                Add Portion
              </Button>
            </div>

            {splitPortions.map((portion, index) => (
              <div key={index} className="grid grid-cols-5 gap-3 p-3 border rounded-lg">
                <div>
                  <Label className="text-xs">Stock ID</Label>
                  <Input
                    value={portion.stockId}
                    onChange={(e) => updatePortion(index, 'stockId', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Carat</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={portion.carat}
                    onChange={(e) => updatePortion(index, 'carat', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Cost Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={portion.costPrice}
                    onChange={(e) => updatePortion(index, 'costPrice', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Selling Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={portion.price}
                    onChange={(e) => updatePortion(index, 'price', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removePortion(index)}
                    disabled={splitPortions.length <= 2}
                    className="w-full"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Comparison */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-lg font-bold">{totalCarat.toFixed(2)}ct</div>
              <div className="text-sm text-muted-foreground">Total Carat</div>
              <div className={`text-xs ${Math.abs(totalCarat - selectedGem.carat) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                Original: {selectedGem.carat}ct
              </div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-lg font-bold">${totalCostPrice.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Cost</div>
              <div className={`text-xs ${Math.abs(totalCostPrice - selectedGem.costPrice) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                Original: ${selectedGem.costPrice}
              </div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-lg font-bold">${totalPrice.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Price</div>
              <div className={`text-xs ${Math.abs(totalPrice - selectedGem.price) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                Original: ${selectedGem.price}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about the split operation"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSplit} disabled={loading || !isValid()}>
            {loading ? 'Splitting...' : `Split into ${splitPortions.length} Gems`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};