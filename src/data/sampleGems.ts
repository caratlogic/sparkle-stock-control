
import { Gem } from '../types/gem';

export const sampleGems: Gem[] = [
  {
    id: '1',
    stockId: 'DM0001',
    gemType: 'Diamond',
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
    stockId: 'EM0001',
    gemType: 'Emerald',
    carat: 2.15,
    cut: 'Emerald',
    color: 'Vivid Green',
    clarity: 'VS1',
    price: 18500,
    costPrice: 13200,
    certificateNumber: 'GRS-2345678901',
    status: 'Reserved',
    dateAdded: '2024-06-18',
    notes: 'Large emerald with excellent color'
  },
  {
    id: '3',
    stockId: 'RB0001',
    gemType: 'Ruby',
    carat: 0.95,
    cut: 'Oval',
    color: 'Vivid Red',
    clarity: 'VS2',
    price: 8500,
    costPrice: 6100,
    certificateNumber: 'SSEF-3456789012',
    status: 'In Stock',
    dateAdded: '2024-06-15'
  },
  {
    id: '4',
    stockId: 'SP0001',
    gemType: 'Sapphire',
    carat: 1.50,
    cut: 'Round',
    color: 'Blue',
    clarity: 'SI1',
    price: 9500,
    costPrice: 6800,
    certificateNumber: 'AIGS-4567890123',
    status: 'Sold',
    dateAdded: '2024-06-10',
    notes: 'Sold to Johnson Jewelry'
  },
  {
    id: '5',
    stockId: 'AM0001',
    gemType: 'Amethyst',
    carat: 3.02,
    cut: 'Emerald',
    color: 'Deep Purple',
    clarity: 'VVS2',
    price: 1500,
    costPrice: 950,
    certificateNumber: 'GIT-5678901234',
    status: 'In Stock',
    dateAdded: '2024-06-25',
    notes: 'Large amethyst with excellent clarity'
  },
  {
    id: '6',
    stockId: 'AQ0001',
    gemType: 'Aquamarine',
    carat: 4.25,
    cut: 'Oval',
    color: 'Deep Blue',
    clarity: 'VVS1',
    price: 3200,
    costPrice: 2100,
    certificateNumber: 'GUILD-6789012345',
    status: 'In Stock',
    dateAdded: '2024-06-22',
    notes: 'Beautiful aquamarine with excellent blue color'
  }
];
