import { useEffect, useRef, useState } from 'react';
import { searchWines } from '../lib/edgeFunctions';
import type { CatalogWine } from '../types';

export function useWineSearch(debounceMs = 400) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CatalogWine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      const currentRequest = ++requestId.current;
      setLoading(true);
      setError(null);

      try {
        const data = await searchWines(trimmed);
        if (currentRequest !== requestId.current) return;
        setResults(data.results ?? []);
      } catch (err) {
        if (currentRequest !== requestId.current) return;
        const message = err instanceof Error ? err.message : 'Search failed';
        setError(message);
        setResults([]);
      } finally {
        if (currentRequest === requestId.current) {
          setLoading(false);
        }
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
  };
}
