
export interface Diamond {
  id: string;
  stock_number: string;
  availability: string;
  shape?: string;
  weight?: number;
  color?: string;
  clarity?: string;
  cut_grade?: string;
  polish?: string;
  symmetry?: string;
  fluorescence_intensity?: string;
  fluorescence_color?: string;
  measurements?: string;
  bgm?: string;
  eye_clean?: boolean;
  lab?: string;
  report_number?: string;
  rap_lab_report_id?: string;
  treatment?: string;
  rap_net_price?: number;
  rap_net_discount_percent?: number;
  cash_price?: number;
  cash_price_discount_percent?: number;
  cost_price?: number;
  retail_price: number;
  depth_percent?: number;
  table_percent?: number;
  girdle_percent?: number;
  girdle_thin?: string;
  girdle_thick?: string;
  girdle_condition?: string;
  culet_size?: string;
  culet_condition?: string;
  crown_height?: number;
  crown_angle?: number;
  pavilion_depth?: number;
  pavilion_angle?: number;
  star_length?: number;
  laser_inscription?: string;
  cert_comment?: string;
  key_to_symbols?: string;
  member_comment?: string;
  shade?: string;
  white_inclusion?: string;
  black_inclusion?: string;
  open_inclusion?: string;
  milky?: string;
  color_comment?: string;
  fancy_color?: string;
  fancy_color_intensity?: string;
  fancy_color_overtone?: string;
  country?: string;
  state?: string;
  city?: string;
  origin?: string;
  brand?: string;
  seller_spec?: string;
  sarine_loupe?: string;
  report_file_name?: string;
  report2_file_name?: string;
  website_link?: string;
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  image5?: string;
  video_url1?: string;
  video_url2?: string;
  video_url3?: string;
  video_url4?: string;
  video_url5?: string;
  document1?: string;
  document2?: string;
  document3?: string;
  document1_type?: string;
  document2_type?: string;
  document3_type?: string;
  trade_show?: string;
  report_issue_date?: string;
  report_type?: string;
  lab_location?: string;
  pair_stock_number?: string;
  is_matched_pair_separable?: boolean;
  allow_rap_link_feed?: boolean;
  parcel_stones?: number;
  tracr_id?: string;
  status: string;
  in_stock: number;
  reserved: number;
  sold: number;
  date_added: string;
  created_at: string;
  updated_at: string;
  purchase_date?: string;
  supplier?: string;
  notes?: string;
  updated_by?: string;
  stock_type?: string;
  ownership_status?: string;
  associated_entity?: string;
  partner_percentage?: number;
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
