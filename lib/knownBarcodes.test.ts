import { knownBarcodeProduct } from './knownBarcodes';

describe('knownBarcodeProduct', () => {
  it('maps Nau Mai Sauvignon Blanc', () => {
    expect(knownBarcodeProduct('9420073800146')).toMatchObject({
      name: 'Nau Mai Sauvignon Blanc',
      producer: 'Nau Mai',
      region: 'Marlborough',
      country: 'New Zealand',
    });
  });

  it('returns null for unknown codes', () => {
    expect(knownBarcodeProduct('3274080005003')).toBeNull();
  });
});
