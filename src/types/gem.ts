
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
  partnerPercentage?: number;
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

export const STATUS_OPTIONS = [
  'In Stock', 'Sold', 'Reserved'
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
