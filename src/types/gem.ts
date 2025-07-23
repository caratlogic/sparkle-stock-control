
export type GemType = 'Diamond' | 'Emerald' | 'Ruby' | 'Sapphire' | 'Amethyst' | 'Aquamarine' | 'Garnet' | 'Opal' | 'Topaz' | 'Tourmaline';

export interface GemCertificate {
  id?: string;
  gemId?: string;
  certificateType: string;
  certificateNumber: string;
  issuingAuthority?: string;
  issueDate?: string;
  expiryDate?: string;
  certificateUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Gem {
  id: string;
  stockId: string;
  gemType: GemType;
  stockType: 'single' | 'parcel' | 'set';
  carat: number;
  cut: 'Round' | 'Princess' | 'Emerald' | 'Asscher' | 'Marquise' | 'Oval' | 'Radiant' | 'Pear' | 'Heart' | 'Cushion' | 'Cabochon' | 'Faceted' | 'Raw';
  color: string;
  description: string;
  measurements: string;
  price: number;
  retailPrice?: number;
  costPrice: number;
  certificateNumber: string;
  status: 'In Stock' | 'Sold' | 'Reserved';
  dateAdded: string;
  notes?: string;
  imageUrl?: string;
  treatment?: string;
  colorComment?: string;
  certificateType?: string;
  supplier?: string;
  purchaseDate?: string;
  origin?: string;
  inStock?: number;
  reserved?: number;
  sold?: number;
  updatedAt?: string;
  updatedBy?: string;
  ownershipStatus?: 'P' | 'M' | 'O';
  associatedEntity?: string;
  certificates?: GemCertificate[];
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
  'In Stock', 'Sold', 'Reserved'
] as const;

export const TREATMENT_OPTIONS = [
  'none', 'H', 'NH', 'NO', 'MI'
] as const;

export const COLOR_COMMENT_OPTIONS = [
  'none', 'RB', 'I', 'CF', 'VD', 'PB'
] as const;

export const STOCK_TYPE_OPTIONS = [
  'single', 'parcel', 'set'
] as const;

export const CERTIFICATE_TYPE_OPTIONS = [
  'none', 'AGL', 'AGTA', 'AIGS', 'GIA', 'GRS', 'Gubelin', 'HDK', 'HKJSL', 'IGI', 
  'LOTUS', 'Mason Kay', 'PGS', 'SSEF', 'BELLEROPHON', 'CDC', 'CDTEC', 'GII', 
  'GIT', 'GWLAB', 'ICA', 'Other'
] as const;

export const OWNERSHIP_STATUS_OPTIONS = [
  { value: 'P', label: 'Partner Stone' },
  { value: 'M', label: 'Memo' },
  { value: 'O', label: 'Owned' }
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
