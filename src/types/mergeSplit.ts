export interface MergeSplitHistoryRecord {
  id: string;
  operation_type: string;
  user_id?: string;
  user_email: string;
  original_stock_numbers: string[];
  new_stock_numbers: string[];
  original_carat: number;
  new_carat: number;
  original_total_cost?: number;
  new_total_cost?: number;
  original_total_selling?: number;
  new_total_selling?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MergeSplitOperation {
  operation_type: 'Merge' | 'Split';
  user_email: string;
  original_stock_numbers: string[];
  new_stock_numbers: string[];
  original_carat: number;
  new_carat: number;
  original_total_cost?: number;
  new_total_cost?: number;
  original_total_selling?: number;
  new_total_selling?: number;
  notes?: string;
}

export interface MergeSplitFilters {
  dateFrom?: string;
  dateTo?: string;
  operationType?: 'Merge' | 'Split' | '';
  stockNumber?: string;
  userEmail?: string;
}