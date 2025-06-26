
export interface Consignment {
  id: string;
  consignmentNumber: string;
  customerId: string;
  dateCreated: string;
  returnDate: string;
  status: 'pending' | 'returned' | 'purchased' | 'inactive';
  notes?: string;
  items?: ConsignmentItem[];
  customer?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ConsignmentItem {
  id: string;
  consignmentId: string;
  gemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  gem?: {
    id: string;
    stockId: string;
    gemType: string;
    carat: number;
    color: string;
    shape?: string;
    measurementsMm?: string;
    stoneDescription?: string;
  };
}
