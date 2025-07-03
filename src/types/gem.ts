
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
  inStock: number;
  reserved: number;
  sold: number;
  dateAdded: string;
  purchaseDate?: string;
  treatment?: 'H' | 'NH' | 'NO' | 'MI';
  colorComment?: string;
  certificateType?: 'GRA' | 'GRS' | 'SSEF' | 'GUB' | 'GIA' | 'AGL' | 'CGL' | 'CD' | 'IGI' | 'HRD';
  supplier?: string;
  origin?: string;
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

// Removed STATUS_OPTIONS as we now use quantity-based tracking

// Color options by gem type
// Treatment options
export const TREATMENT_OPTIONS = [
  'H', 'NH', 'NO', 'MI'
] as const;

// Color comment options
export const COLOR_COMMENT_OPTIONS = [
  'RB', 'I', 'CF', 'VD', 'PB'
] as const;

// Certificate type options
export const CERTIFICATE_TYPE_OPTIONS = [
  'GRA', 'GRS', 'SSEF', 'GUB', 'GIA', 'AGL', 'CGL', 'CD', 'IGI', 'HRD'
] as const;

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
