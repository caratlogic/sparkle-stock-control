
export interface Diamond {
  id: string;
  stockId: string;
  carat: number;
  cut: 'Round' | 'Princess' | 'Emerald' | 'Asscher' | 'Marquise' | 'Oval' | 'Radiant' | 'Pear' | 'Heart' | 'Cushion';
  color: 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M';
  clarity: 'IF' | 'VVS1' | 'VVS2' | 'VS1' | 'VS2' | 'SI1' | 'SI2' | 'I1' | 'I2' | 'I3';
  price: number;
  certificateNumber: string;
  status: 'In Stock' | 'Sold' | 'Reserved';
  dateAdded: string;
  notes?: string;
}

export const CUT_OPTIONS = [
  'Round', 'Princess', 'Emerald', 'Asscher', 'Marquise', 
  'Oval', 'Radiant', 'Pear', 'Heart', 'Cushion'
] as const;

export const COLOR_OPTIONS = [
  'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'
] as const;

export const CLARITY_OPTIONS = [
  'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'
] as const;

export const STATUS_OPTIONS = [
  'In Stock', 'Sold', 'Reserved'
] as const;
