import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type WineApiSearchItem = {
  id?: string;
  name?: string;
  vintage?: number | string | null;
  type?: string | null;
  winery?: string | { name?: string } | null;
  region?: string | { name?: string; country?: string } | null;
  country?: string | null;
  grapes?: Array<string | { name?: string }> | null;
  averageRating?: number | null;
  confidence?: number | null;
};

type WineApiSearchResponse = {
  results?: WineApiSearchItem[];
  total?: number;
  limit?: number;
  offset?: number;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function asName(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value && typeof value === 'object' && 'name' in value) {
    const name = (value as { name?: unknown }).name;
    if (typeof name === 'string' && name.trim()) return name.trim();
  }
  return undefined;
}

function mapWineType(type?: string | null): string | undefined {
  if (!type) return undefined;
  const normalized = type.toLowerCase().replace(/[^a-z]/g, '');
  if (normalized.includes('spark')) return 'sparkling';
  if (normalized.includes('rose') || normalized.includes('ros')) return 'rose';
  if (normalized.includes('white')) return 'white';
  if (normalized.includes('red')) return 'red';
  return 'other';
}

function mapCatalogWine(item: WineApiSearchItem) {
  const grapes = (item.grapes ?? [])
    .map((grape) => (typeof grape === 'string' ? grape : grape?.name))
    .filter((name): name is string => Boolean(name));

  const vintageRaw = item.vintage;
  const vintage = vintageRaw == null || vintageRaw === ''
    ? undefined
    : Number(vintageRaw);

  return {
    external_id: String(item.id ?? ''),
    external_source: 'wineapi.io',
    name: item.name?.trim() || 'Unknown wine',
    producer: asName(item.winery),
    vintage: Number.isFinite(vintage) ? vintage : undefined,
    region: asName(item.region),
    country: typeof item.country === 'string'
      ? item.country
      : asName((item.region as { country?: string } | null)?.country),
    grape_variety: grapes.length ? grapes.join(', ') : undefined,
    wine_type: mapWineType(item.type),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const wineApiKey = Deno.env.get('WINE_API_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      return jsonResponse({ error: 'Supabase environment is not configured' }, 500);
    }
    if (!wineApiKey) {
      return jsonResponse({ error: 'WINE_API_KEY secret is not set' }, 500);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization header' }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const query = typeof body.query === 'string' ? body.query.trim() : '';
    const limit = Math.min(Math.max(Number(body.limit) || 10, 1), 20);

    if (query.length < 2) {
      return jsonResponse({ results: [], total: 0 });
    }

    const url = new URL('https://api.wineapi.io/wines/search');
    url.searchParams.set('q', query);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('offset', '0');

    const apiResponse = await fetch(url.toString(), {
      headers: {
        'X-API-Key': wineApiKey,
        Accept: 'application/json',
      },
    });

    if (apiResponse.status === 401) {
      return jsonResponse({ error: 'Invalid wine API key' }, 502);
    }
    if (apiResponse.status === 429) {
      return jsonResponse({ error: 'Wine API rate limit exceeded. Try again later.' }, 429);
    }
    if (!apiResponse.ok) {
      const details = await apiResponse.text();
      return jsonResponse({
        error: 'Wine API search failed',
        details: details.slice(0, 300),
      }, 502);
    }

    const payload = await apiResponse.json() as WineApiSearchResponse;
    const results = (payload.results ?? [])
      .map(mapCatalogWine)
      .filter((wine) => wine.external_id);

    return jsonResponse({
      results,
      total: payload.total ?? results.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return jsonResponse({ error: message }, 500);
  }
});
