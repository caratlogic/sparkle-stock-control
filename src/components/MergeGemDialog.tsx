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
  const [newPrice, setNewPrice] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const totalCarat = selectedGems.reduce((sum, gem) => sum + gem.carat, 0);
  const totalCostPrice = selectedGems.reduce((sum, gem) => sum + gem.costPrice, 0);
  const totalPrice = selectedGems.reduce((sum, gem) => sum + gem.price, 0);
  const totalInStock = selectedGems.reduce((sum, gem) => sum + (gem.inStock || 0), 0);

  useEffect(() => {
    if (open && selectedGems.length > 0) {
      // Generate a suggested stock ID based on the first gem
      const firstGem = selectedGems[0];
      const prefix = firstGem.stockId.replace(/\d+$/, '');
      setNewStockId(`${prefix}M${Date.now().toString().slice(-4)}`);
      setNewPrice(totalPrice);
      setNotes(`Merged ${selectedGems.length} gems: ${selectedGems.map(g => g.stockId).join(', ')}`);
    }
  }, [open, selectedGems, totalPrice]);

  // Validation function for merge compatibility
  const validateMergeCompatibility = () => {
    if (selectedGems.length < 2) return { isValid: false, error: "Please select at least 2 gems to merge" };

    const firstGem = selectedGems[0];
    const stockTypes = [...new Set(selectedGems.map(gem => gem.stockType))];
    
    // Check if there are any single stones - not allowed for merge
    const hasSingle = selectedGems.some(gem => gem.stockType === 'single');
    if (hasSingle) {
      return { 
        isValid: false, 
        error: "Single stone merges are not allowed. Only parcel-to-parcel or set-to-set merges are permitted." 
      };
    }

    // Check if all gems have the same stock type
    if (stockTypes.length > 1) {
      return { 
        isValid: false, 
        error: `Cannot mix different stock types. Found: ${stockTypes.join(", ")}` 
      };
    }

    // For parcel merges, check gem type, shape, and color compatibility
    if (firstGem.stockType === 'parcel') {
      const incompatibleGem = selectedGems.find(gem => 
        gem.gemType !== firstGem.gemType ||
        gem.cut !== firstGem.cut ||
        gem.color !== firstGem.color
      );

      if (incompatibleGem) {
        const issues = [];
        if (incompatibleGem.gemType !== firstGem.gemType) issues.push("gem type");
        if (incompatibleGem.cut !== firstGem.cut) issues.push("cut/shape");
        if (incompatibleGem.color !== firstGem.color) issues.push("color");
        
        return { 
          isValid: false, 
          error: `Parcel merge requires same ${issues.join(", ")}. Found mismatch in ${incompatibleGem.stockId}` 
        };
      }
    }

    // For set merges, check compatibility (add similar logic if needed)
    if (firstGem.stockType === 'set') {
      // Add set-specific validation rules here if needed
    }

    return { isValid: true, error: null };
  };

  const handleMerge = async () => {
    if (!newStockId.trim()) {
      toast.error("Please enter a stock ID for the merged gem");
      return;
    }

    // Validate merge compatibility
    const validation = validateMergeCompatibility();
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setLoading(true);
    try {
      // Create the new merged gem based on the first selected gem
      const firstGem = selectedGems[0];
      const newGem: Omit<Gem, 'id' | 'stockId' | 'dateAdded'> = {
        gemType: firstGem.gemType,
        stockType: firstGem.stockType, // Inherit stock type from original gems
        carat: totalCarat,
        cut: firstGem.cut,
        color: firstGem.color,
        description: `Merged from ${selectedGems.length} gems`,
        measurements: firstGem.measurements,
        price: newPrice,
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
        inStock: totalInStock, // Sum of all original gems' quantities
        reserved: 0,
        sold: 0,
        ownershipStatus: firstGem.ownershipStatus,
        associatedEntity: firstGem.associatedEntity,
        partnerPercentage: firstGem.partnerPercentage
      };

      // Add the new merged gem
      const result = await addGem(newGem, newStockId);
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
            
            {/* Validation Warning */}
            {(() => {
              const validation = validateMergeCompatibility();
              if (!validation.isValid && selectedGems.length >= 2) {
                return (
                  <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive font-medium">⚠️ Merge Not Allowed</p>
                    <p className="text-sm text-destructive">{validation.error}</p>
                  </div>
                );
              }
              return null;
            })()}

            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
              {selectedGems.map((gem) => (
                <div key={gem.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">{gem.stockId}</Badge>
                    <Badge variant={gem.stockType === 'parcel' ? 'default' : 'secondary'} className="text-xs">
                      {gem.stockType}
                    </Badge>
                    <span className="text-sm">
                      {gem.gemType} • {gem.cut} • {gem.color} • {gem.carat}ct • ${gem.price.toLocaleString()}
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

          {/* New Price */}
          <div className="space-y-2">
            <Label htmlFor="newPrice">New Selling Price *</Label>
            <Input
              id="newPrice"
              type="number"
              step="0.01"
              value={newPrice}
              onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
              placeholder="Enter new selling price"
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
          <Button onClick={handleMerge} disabled={loading || !validateMergeCompatibility().isValid}>
            {loading ? 'Merging...' : `Merge ${selectedGems.length} Gems`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};