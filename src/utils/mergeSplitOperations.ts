import { supabase } from '@/integrations/supabase/client';
import { MergeSplitOperation } from '@/types/mergeSplit';
import { Gem } from '@/types/gem';

// Utility function to create merge/split operation records without using hooks
export const createMergeSplitRecord = async (operation: MergeSplitOperation): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('merge_split_history')
      .insert([operation]);

    if (error) {
      console.error('Error adding merge/split record:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in createMergeSplitRecord:', err);
    return false;
  }
};

// Demo function to show how merge operations would be logged
export const logMergeOperation = async (
  originalGems: Gem[],
  newGem: Gem,
  userEmail: string
): Promise<boolean> => {
  const operation: MergeSplitOperation = {
    operation_type: 'Merge',
    user_email: userEmail,
    original_stock_numbers: originalGems.map(gem => gem.stockId),
    new_stock_numbers: [newGem.stockId],
    original_carat: originalGems.reduce((sum, gem) => sum + gem.carat, 0),
    new_carat: newGem.carat,
    original_total_cost: originalGems.reduce((sum, gem) => sum + gem.costPrice, 0),
    new_total_cost: newGem.costPrice,
    original_total_selling: originalGems.reduce((sum, gem) => sum + gem.price, 0),
    new_total_selling: newGem.price,
    notes: `Merged ${originalGems.length} gems into one`
  };

  return await createMergeSplitRecord(operation);
};

// Demo function to show how split operations would be logged
export const logSplitOperation = async (
  originalGem: Gem,
  newGems: Gem[],
  userEmail: string,
  notes?: string
): Promise<boolean> => {
  const operation: MergeSplitOperation = {
    operation_type: 'Split',
    user_email: userEmail,
    original_stock_numbers: [originalGem.stockId],
    new_stock_numbers: newGems.map(gem => gem.stockId),
    original_carat: originalGem.carat,
    new_carat: newGems.reduce((sum, gem) => sum + gem.carat, 0),
    original_total_cost: originalGem.costPrice,
    new_total_cost: newGems.reduce((sum, gem) => sum + gem.costPrice, 0),
    original_total_selling: originalGem.price,
    new_total_selling: newGems.reduce((sum, gem) => sum + gem.price, 0),
    notes: notes || `Split 1 gem into ${newGems.length} gems`
  };

  return await createMergeSplitRecord(operation);
};

// Sample data insertion function for testing
export const insertSampleMergeSplitData = async () => {
  const sampleOperations: MergeSplitOperation[] = [
    {
      operation_type: 'Split',
      user_email: 'admin@diamond.com',
      original_stock_numbers: ['PAR001'],
      new_stock_numbers: ['PAR002', 'PAR003'],
      original_carat: 50,
      new_carat: 50,
      original_total_cost: 25000,
      new_total_cost: 25000,
      original_total_selling: 35000,
      new_total_selling: 35000,
      notes: 'Split large parcel for individual sales'
    },
    {
      operation_type: 'Merge',
      user_email: 'admin@diamond.com',
      original_stock_numbers: ['EM001', 'EM002', 'EM003'],
      new_stock_numbers: ['EM004'],
      original_carat: 15,
      new_carat: 15,
      original_total_cost: 18000,
      new_total_cost: 18000,
      original_total_selling: 25000,
      new_total_selling: 25000,
      notes: 'Merged similar emeralds into a set'
    }
  ];

  for (const operation of sampleOperations) {
    await createMergeSplitRecord(operation);
  }
};