import { supabase } from './supabase';
import type { CatalogWine } from '../types';

async function readFunctionError(error: { message?: string; context?: unknown }, data: unknown) {
  const fromData = data && typeof data === 'object' && 'error' in data
    ? String((data as { error: unknown }).error)
    : null;
  if (fromData) return fromData;

  const context = error.context;
  if (context && typeof context === 'object' && 'json' in context) {
    try {
      const body = await (context as Response).json() as {
        error?: unknown;
        message?: unknown;
      };
      if (body.error) return String(body.error);
      if (body.message) return String(body.message);
    } catch {
      // Ignore parse failures and fall back to the generic client message.
    }
  }

  return error.message || 'Function failed';
}

async function invokeFunction<T>(name: string, body?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body });

  if (error) {
    throw new Error(await readFunctionError(error, data));
  }

  if (data && typeof data === 'object' && 'error' in data && (data as { error?: unknown }).error) {
    throw new Error(String((data as { error: unknown }).error));
  }

  return data as T;
}

export function searchWines(query: string, limit = 10) {
  return invokeFunction<{ results: CatalogWine[]; total?: number }>('search-wines', {
    query,
    limit,
  });
}

export function getCatalogWine(id: string) {
  return invokeFunction<{ result: CatalogWine | null }>('search-wines', { id });
}

export function lookupBarcode(barcode: string) {
  return invokeFunction<{ result: CatalogWine | null }>('lookup-barcode', { barcode });
}

export function recommendWines(count = 5, occasion?: string) {
  return invokeFunction<{ recommendations: unknown[] }>('recommend-wines', { count, occasion });
}
