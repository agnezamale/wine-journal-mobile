import { isPlausibleBarcode, normalizeBarcode } from './barcode';

describe('barcode', () => {
  it('strips non-digits', () => {
    expect(normalizeBarcode(' 3-27408-000500-3 ')).toBe('3274080005003');
  });

  it('accepts EAN-13 and UPC lengths', () => {
    expect(isPlausibleBarcode('3274080005003')).toBe(true);
    expect(isPlausibleBarcode('012345678905')).toBe(true);
    expect(isPlausibleBarcode('123')).toBe(false);
    expect(isPlausibleBarcode('abc')).toBe(false);
  });
});
