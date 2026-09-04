import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OFF_USER_AGENT = 'WineJournalMobile/1.0 (https://world.openfoodfacts.org)';

type OffProduct = {
  code?: string;
  product_name?: string;
  product_name_en?: string;
  generic_name?: string;
  brands?: string;
  countries?: string;
  categories?: string;
  image_url?: string;
  image_front_url?: string;
  nutriments?: { alcohol?: number | string };
};

type OffResponse = {
  status?: number;
  product?: OffProduct;
};

type CatalogResult = {
  external_id: string;
  external_source: string;
  name: string;
  producer?: string;
  vintage?: number;
  region?: string;
  country?: string;
  grape_variety?: string;
  wine_type?: string;
  alcohol_content?: number;
  image_url?: string;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function firstListItem(value?: string): string | undefined {
  const item = value?.split(',')[0]?.trim();
  return item || undefined;
}

function mapWineType(categories?: string): string | undefined {
  if (!categories) return undefined;
  const normalized = categories.toLowerCase();
  if (normalized.includes('sparkling')) return 'sparkling';
  if (normalized.includes('rosé') || normalized.includes('rose')) return 'rose';
  if (normalized.includes('white')) return 'white';
  if (normalized.includes('red')) return 'red';
  if (normalized.includes('wine')) return 'other';
  return undefined;
}

function parseVintage(name: string): number | undefined {
  const match = name.match(/\b((?:19|20)\d{2})\b/);
  if (!match) return undefined;
  const year = Number(match[1]);
  return Number.isFinite(year) ? year : undefined;
}

function mapOffProduct(barcode: string, product: OffProduct) {
  const name = (
    product.product_name
    || product.product_name_en
    || product.generic_name
    || firstListItem(product.brands)
    || ''
  ).trim();

  if (!name) return null;

  const alcoholRaw = product.nutriments?.alcohol;
  const alcohol = typeof alcoholRaw === 'number'
    ? alcoholRaw
    : typeof alcoholRaw === 'string'
      ? Number(alcoholRaw)
      : undefined;

  return {
    external_id: product.code?.trim() || barcode,
    external_source: 'openfoodfacts',
    name,
    producer: firstListItem(product.brands),
    vintage: parseVintage(name),
    country: firstListItem(product.countries),
    wine_type: mapWineType(product.categories),
    alcohol_content: typeof alcohol === 'number' && Number.isFinite(alcohol) ? alcohol : undefined,
    image_url: product.image_front_url?.trim() || product.image_url?.trim() || undefined,
  };
}

async function fetchOffProduct(code: string): Promise<OffProduct | null> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=code,product_name,product_name_en,generic_name,brands,countries,categories,image_url,image_front_url,nutriments`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': OFF_USER_AGENT,
    },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Open Food Facts lookup failed (${response.status})`);
  }

  const payload = await response.json() as OffResponse;
  if (payload.status === 0 || !payload.product) return null;
  return payload.product;
}

function offCandidates(barcode: string): string[] {
  const candidates = [barcode];
  if (barcode.length < 14) {
    candidates.push(barcode.padStart(14, '0'));
  }
  if (barcode.length === 14 && barcode.startsWith('0')) {
    const stripped = barcode.replace(/^0+/, '');
    if (stripped.length >= 8) candidates.push(stripped);
  }
  return [...new Set(candidates)];
}

async function lookupOff(barcode: string): Promise<OffProduct | null> {
  for (const code of offCandidates(barcode)) {
    const product = await fetchOffProduct(code);
    if (product) return product;
  }
  return null;
}

const KNOWN_BARCODES: Record<string, CatalogResult> = {
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

function knownBarcode(barcode: string) {
  return KNOWN_BARCODES[barcode] ?? null;
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

    if (!supabaseUrl || !supabaseAnonKey) {
      return jsonResponse({ error: 'Supabase environment is not configured' }, 500);
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
    const barcode = typeof body.barcode === 'string'
      ? body.barcode.replace(/\D/g, '')
      : '';

    if (barcode.length < 8 || barcode.length > 14) {
      return jsonResponse({ error: 'That barcode does not look valid.' }, 400);
    }

    const product = await lookupOff(barcode);
    const mapped = product ? mapOffProduct(barcode, product) : knownBarcode(barcode);
    return jsonResponse({ result: mapped });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return jsonResponse({ error: message }, 500);
  }
});
