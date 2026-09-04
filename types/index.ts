export type WineType = 'red' | 'white' | 'rose' | 'sparkling' | 'other';

export interface Wine {
  id: string;
  user_id: string;
  name: string;
  producer?: string;
  vintage?: number;
  region?: string;
  country?: string;
  grape_variety?: string;
  wine_type?: WineType;
  price?: number;
  barcode?: string;
  external_id?: string;
  external_source?: string;
  created_at: string;
  updated_at: string;
}

/** Fields accepted when creating or updating a wine row. */
export type WineInput = {
  name: string;
  producer?: string | null;
  vintage?: number | null;
  region?: string | null;
  country?: string | null;
  grape_variety?: string | null;
  wine_type?: WineType | null;
  price?: number | null;
  barcode?: string | null;
  external_id?: string | null;
  external_source?: string | null;
};

export interface TastingNote {
  id: string;
  wine_id: string;
  rating?: number;
  aroma?: string;
  taste?: string;
  notes?: string;
  tasted_at: string;
}

export interface WinePhoto {
  id: string;
  wine_id: string;
  storage_path: string;
  is_primary: boolean;
}

/** Wine row joined with optional tasting note (for lists/detail). */
export interface WineWithNote extends Wine {
  tasting_note?: TastingNote | null;
  primary_photo?: WinePhoto | null;
}

export interface CatalogWine {
  external_id: string;
  external_source: string;
  name: string;
  producer?: string;
  vintage?: number;
  region?: string;
  country?: string;
  grape_variety?: string;
  wine_type?: WineType;
  price?: number;
}

export interface Recommendation {
  name: string;
  producer?: string;
  region?: string;
  grape_variety?: string;
  wine_type?: WineType;
  reason: string;
  confidence?: number;
  external_id?: string;
}

/** Shared shape for add/edit wine forms. */
export interface WineFormValues {
  name: string;
  producer: string;
  vintage: string;
  region: string;
  country: string;
  grape_variety: string;
  wine_type: WineType | '';
  price: string;
  barcode: string;
  rating: number;
  aroma: string;
  taste: string;
  notes: string;
}
