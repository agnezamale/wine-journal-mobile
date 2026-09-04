import type { BarcodeType } from 'expo-camera';

export const WINE_BARCODE_TYPES: BarcodeType[] = ['ean13', 'ean8', 'upc_a', 'upc_e'];

export function normalizeBarcode(value: string): string {
  return value.replace(/\D/g, '');
}

export function isPlausibleBarcode(value: string): boolean {
  const digits = normalizeBarcode(value);
  return digits.length >= 8 && digits.length <= 14;
}
