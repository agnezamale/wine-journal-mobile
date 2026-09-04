import type { CatalogWine, WineInput } from '../types';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function searchText(wine: CatalogWine): string {
  return [wine.name, wine.producer].filter(Boolean).join(' ');
}

function hasWholeWord(haystack: string, token: string): boolean {
  const pattern = new RegExp(
    `(^|[^\\p{L}\\p{N}])${escapeRegex(token)}([^\\p{L}\\p{N}]|$)`,
    'iu',
  );
  return pattern.test(haystack);
}

export function isStrongCatalogMatch(wine: CatalogWine, query: string): boolean {
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length >= 2);

  if (tokens.length === 0) return false;

  const haystack = searchText(wine);
  return tokens.every((token) => hasWholeWord(haystack, token));
}

export function visibleCatalogResults(
  results: CatalogWine[],
  query: string,
  showAll: boolean,
): { visible: CatalogWine[]; hiddenCount: number } {
  const strong = results.filter((wine) => isStrongCatalogMatch(wine, query));
  const preferred = strong.length > 0 ? strong : results.slice(0, 3);
  const hiddenCount = Math.max(0, results.length - preferred.length);

  if (showAll || hiddenCount === 0) {
    return { visible: results, hiddenCount: 0 };
  }

  return { visible: preferred, hiddenCount };
}

export function catalogToWineInput(wine: CatalogWine): WineInput {
  return {
    name: wine.name,
    producer: wine.producer ?? null,
    vintage: wine.vintage ?? null,
    region: wine.region ?? null,
    country: wine.country ?? null,
    grape_variety: wine.grape_variety ?? null,
    wine_type: wine.wine_type ?? null,
    external_id: wine.external_id,
    external_source: wine.external_source,
  };
}
