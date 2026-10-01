export interface CarVersion {
  version: string;
  price: number;
  transmission: string;
  traction: string;
}

export type SafetyProgram =
  | 'Latin NCAP'
  | 'Euro NCAP'
  | 'Global NCAP'
  | 'ANCAP'
  | 'C-NCAP'
  | 'KNCAP'
  | 'JNCAP'
  | 'ASEAN NCAP'
  | 'IIHS'
  | 'NHTSA'
  | 'Bharat NCAP';

export interface SafetyRating {
  program: SafetyProgram;
  stars: number;
  year: number;
  source: string;
  note?: string;
}

export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  type: 'sedan' | 'suv' | 'pickup' | 'hatchback' | 'minivan' | 'wagon' | 'coupe' | 'convertible';
  fuel: 'gasolina' | 'diesel' | 'electrico' | 'hibrido' | 'hibrido_enchufable';
  seats: number;
  price: number;
  transmission: 'manual' | 'automatica';
  traction: '4x2' | '4x4' | 'awd';
  image_url: string;
  description: string;
  origin: string;
  versions: CarVersion[];
  // Performance
  hp?: number;
  torque_nm?: number;
  top_speed_kmh?: number;
  // Efficiency
  fuel_consumption_city_km_l?: number;
  fuel_consumption_highway_km_l?: number;
  fuel_consumption_mixed_km_l?: number;
  fuel_tank_liters?: number;
  // Electric / PHEV
  electric_range_km?: number;
  battery_kwh?: number;
  home_full_charging_cost?: number;
  fast_full_charging_cost?: number;
  // Dimensions
  length_mm?: number;
  width_mm?: number;
  height_mm?: number;
  wheelbase_mm?: number;
  ground_clearance_mm?: number;
  trunk_liters?: number;
  // Safety
  airbags?: number;
  adas?: string[];
  latin_ncap_stars?: number;
  safety_ratings?: SafetyRating[];
  isofix?: boolean;
  // Technology
  infotainment?: string[];
  warranty_years?: number;
  warranty_km?: number;
  // Origin (country)
  origin_country?: string;
  // Brand official website URL
  brand_url?: string;
  // Additional images for gallery
  images?: string[];
}

export interface Filters {
  brand: string[];
  type: string[];
  fuel: string[];
  seats: number[];
  priceRange: [number, number];
  transmission: string[];
  traction: string[];
  minAirbags: number;
  origin_country: string[];
  model: string[];
  yearRange: [number, number];
}

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  emailVerified?: boolean;
  pendingEmail?: string | null;
}

export interface DocumentVersion {
  id: number;
  document_type: 'privacy_policy' | 'responsibility_declaration';
  version: string;
  content: string;
  hash_sha256: string;
  effective_date: string;
  is_active: boolean;
}

export interface DocumentSignature {
  id: number;
  user_id: string;
  document_type: string;
  document_version: string;
  signature_hash: string;
  signed_at: string;
  ip_address: string;
}

export interface Favorite {
  id: number;
  user_id: string;
  car_id: number;
  created_at: string;
}
