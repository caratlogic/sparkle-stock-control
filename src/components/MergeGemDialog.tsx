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
import { X } from "lucide-react";
import { Gem } from '@/types/gem';
import { useGems } from '@/hooks/useGems';
import { logMergeOperation } from '@/utils/mergeSplitOperations';
import { toast } from "sonner";

interface MergeGemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedGems: Gem[];
  onSuccess: () => void;
}

export const MergeGemDialog = ({ open, onOpenChange, selectedGems, onSuccess }: MergeGemDialogProps) => {
  const { addGem, updateGem } = useGems();
  const [newStockId, setNewStockId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const totalCarat = selectedGems.reduce((sum, gem) => sum + gem.carat, 0);
  const totalCostPrice = selectedGems.reduce((sum, gem) => sum + gem.costPrice, 0);
  const totalPrice = selectedGems.reduce((sum, gem) => sum + gem.price, 0);

  useEffect(() => {
    if (open && selectedGems.length > 0) {
      // Generate a suggested stock ID based on the first gem
      const firstGem = selectedGems[0];
      const prefix = firstGem.stockId.replace(/\d+$/, '');
      setNewStockId(`${prefix}M${Date.now().toString().slice(-4)}`);
      setNotes(`Merged ${selectedGems.length} gems: ${selectedGems.map(g => g.stockId).join(', ')}`);
    }
  }, [open, selectedGems]);

  const handleMerge = async () => {
    if (!newStockId.trim()) {
      toast.error("Please enter a stock ID for the merged gem");
      return;
    }

    if (selectedGems.length < 2) {
      toast.error("Please select at least 2 gems to merge");
      return;
    }

    setLoading(true);
    try {
      // Create the new merged gem based on the first selected gem
      const firstGem = selectedGems[0];
      const newGem: Omit<Gem, 'id' | 'stockId' | 'dateAdded'> = {
        gemType: firstGem.gemType,
        stockType: 'single', // Merged gems become single stones
        carat: totalCarat,
        cut: firstGem.cut,
        color: firstGem.color,
        description: `Merged from ${selectedGems.length} gems`,
        measurements: firstGem.measurements,
        price: totalPrice,
        retailPrice: firstGem.retailPrice,
        costPrice: totalCostPrice,
        certificateNumber: `MERGED-${newStockId}`,
        status: 'In Stock',
        notes: notes,
        imageUrl: firstGem.imageUrl,
        treatment: firstGem.treatment,
        certificateType: firstGem.certificateType,
        supplier: firstGem.supplier,
        purchaseDate: firstGem.purchaseDate,
        origin: firstGem.origin,
        inStock: 1,
        reserved: 0,
        sold: 0,
        ownershipStatus: firstGem.ownershipStatus,
        associatedEntity: firstGem.associatedEntity,
        partnerPercentage: firstGem.partnerPercentage
      };

      // Add the new merged gem
      const result = await addGem(newGem);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create merged gem');
      }

      // Update the original gems to mark them as merged/out of stock
      for (const gem of selectedGems) {
        await updateGem(gem.id, {
          status: 'Sold', // Mark as sold to remove from active inventory
          notes: `${gem.notes || ''}\nMerged into ${newStockId}`.trim(),
          inStock: 0,
          sold: gem.inStock || 1
        });
      }

      // Log the merge operation
      const mergedGem = { ...newGem, stockId: newStockId, id: '', dateAdded: new Date().toISOString() } as Gem;
      await logMergeOperation(selectedGems, mergedGem, 'admin@diamond.com');

      toast.success(`Successfully merged ${selectedGems.length} gems into ${newStockId}`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error merging gems:', error);
      toast.error('Failed to merge gems. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeGem = (gemId: string) => {
    // This would be handled by the parent component
    // For now, just show a message
    toast.info("Use the gem selection in the parent component to modify selection");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Merge Gems</DialogTitle>
          <DialogDescription>
            Combine multiple gems into a single gem. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Gems */}
          <div>
            <Label className="text-sm font-medium">Selected Gems ({selectedGems.length})</Label>
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
              {selectedGems.map((gem) => (
                <div key={gem.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">{gem.stockId}</Badge>
                    <span className="text-sm">
                      {gem.gemType} • {gem.carat}ct • ${gem.price.toLocaleString()}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGem(gem.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">{totalCarat.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Carat</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">${totalCostPrice.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">${totalPrice.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Price</div>
            </div>
          </div>

          {/* New Stock ID */}
          <div className="space-y-2">
            <Label htmlFor="newStockId">New Stock ID *</Label>
            <Input
              id="newStockId"
              value={newStockId}
              onChange={(e) => setNewStockId(e.target.value)}
              placeholder="Enter stock ID for merged gem"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about the merge operation"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleMerge} disabled={loading || selectedGems.length < 2}>
            {loading ? 'Merging...' : `Merge ${selectedGems.length} Gems`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};