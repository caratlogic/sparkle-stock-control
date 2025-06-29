
export type GemType = 'Diamond' | 'Emerald' | 'Ruby' | 'Sapphire' | 'Amethyst' | 'Aquamarine' | 'Garnet' | 'Opal' | 'Topaz' | 'Tourmaline';

export interface Gem {
  id: string;
  stockId: string;
  gemType: GemType;
  carat: number;
  cut: 'Round' | 'Princess' | 'Emerald' | 'Asscher' | 'Marquise' | 'Oval' | 'Radiant' | 'Pear' | 'Heart' | 'Cushion' | 'Cabochon' | 'Faceted' | 'Raw';
  color: string;
  description: string;
  measurements: string;
  price: number;
  costPrice: number;
  certificateNumber: string;
  status: 'In Stock' | 'Sold' | 'Reserved' | 'On Consignment';
  dateAdded: string;
  notes?: string;
  imageUrl?: string;
  consignmentInfo?: {
    id: string;
    consignmentNumber: string;
    customerId: string;
    status: string;
    dateCreated: string;
    returnDate: string;
    notes?: string;
  };
}

export const GEM_TYPES = [
  'Diamond', 'Emerald', 'Ruby', 'Sapphire', 'Amethyst', 
  'Aquamarine', 'Garnet', 'Opal', 'Topaz', 'Tourmaline'
] as const;

export const CUT_OPTIONS = [
  'Round', 'Princess', 'Emerald', 'Asscher', 'Marquise', 
  'Oval', 'Radiant', 'Pear', 'Heart', 'Cushion', 'Cabochon', 'Faceted', 'Raw'
] as const;

export const STATUS_OPTIONS = [
  'In Stock', 'Sold', 'Reserved', 'On Consignment'
] as const;

// Color options by gem type
export const GEM_COLORS = {
  Diamond: ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'],
  Emerald: ['Vivid Green', 'Green', 'Slightly Bluish Green', 'Yellowish Green', 'Light Green'],
  Ruby: ['Vivid Red', 'Red', 'Slightly Purplish Red', 'Pinkish Red', 'Dark Red'],
  Sapphire: ['Blue', 'Pink', 'Yellow', 'White', 'Orange', 'Purple', 'Green', 'Padparadscha'],
  Amethyst: ['Deep Purple', 'Purple', 'Light Purple', 'Lavender', 'Rose de France'],
  Aquamarine: ['Deep Blue', 'Blue', 'Light Blue', 'Blue-Green', 'Pale Blue'],
  Garnet: ['Red', 'Orange', 'Yellow', 'Green', 'Purple', 'Pink'],
  Opal: ['White', 'Black', 'Crystal', 'Boulder', 'Fire', 'Water'],
  Topaz: ['Blue', 'Pink', 'Yellow', 'White', 'Orange', 'Imperial'],
  Tourmaline: ['Pink', 'Green', 'Blue', 'Watermelon', 'Paraiba', 'Black']
};
