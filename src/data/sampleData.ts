
import { Diamond } from '../types/diamond';

export const sampleDiamonds: Diamond[] = [
  {
    id: '1',
    stockId: 'DM0001',
    carat: 1.25,
    cut: 'Round',
    color: 'D',
    clarity: 'VVS1',
    price: 12500,
    costPrice: 8500,
    certificateNumber: 'GIA-1234567890',
    status: 'In Stock',
    dateAdded: '2024-06-20',
    notes: 'Excellent quality diamond with perfect cut'
  },
  {
    id: '2',
    stockId: 'DM0002',
    carat: 2.15,
    cut: 'Princess',
    color: 'E',
    clarity: 'VS1',
    price: 18500,
    costPrice: 13200,
    certificateNumber: 'GIA-2345678901',
    status: 'Reserved',
    dateAdded: '2024-06-18',
    notes: 'Large princess cut, reserved for VIP client'
  },
  {
    id: '3',
    stockId: 'DM0003',
    carat: 0.95,
    cut: 'Emerald',
    color: 'F',
    clarity: 'VS2',
    price: 8500,
    costPrice: 6100,
    certificateNumber: 'GIA-3456789012',
    status: 'In Stock',
    dateAdded: '2024-06-15'
  },
  {
    id: '4',
    stockId: 'DM0004',
    carat: 1.50,
    cut: 'Oval',
    color: 'G',
    clarity: 'SI1',
    price: 9500,
    costPrice: 6800,
    certificateNumber: 'GIA-4567890123',
    status: 'Sold',
    dateAdded: '2024-06-10',
    notes: 'Sold to Johnson Jewelry'
  },
  {
    id: '5',
    stockId: 'DM0005',
    carat: 3.02,
    cut: 'Round',
    color: 'H',
    clarity: 'VVS2',
    price: 35000,
    costPrice: 26500,
    certificateNumber: 'GIA-5678901234',
    status: 'In Stock',
    dateAdded: '2024-06-25',
    notes: 'Premium 3+ carat diamond'
  }
];
