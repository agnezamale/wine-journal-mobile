import type { CatalogWine } from '../types';

/** Last-resort names for GTINs missing from Open Food Facts. */
const KNOWN_BARCODES: Record<string, CatalogWine> = {
  '9420073800146': {
    external_id: '9420073800146',
    external_source: 'gtin',
    name: 'Nau Mai Sauvignon Blanc',
    producer: 'Nau Mai',
    region: 'Marlborough',
    country: 'New Zealand',
    wine_type: 'white',
    grape_variety: 'Sauvignon Blanc',
  },
};

export function knownBarcodeProduct(barcode: string): CatalogWine | null {
  return KNOWN_BARCODES[barcode] ?? null;
}
