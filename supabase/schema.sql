  -- Run in Supabase SQL Editor (Project: yqgdqwefhadgruwmarwa)
  -- Dashboard → SQL → New query

  create table if not exists wines (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users not null,
    name text not null,
    producer text,
    vintage int,
    region text,
    country text,
    grape_variety text,
    wine_type text check (wine_type in ('red','white','rose','sparkling','other')),
    price decimal,
    barcode text,
    external_id text,
    external_source text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );

  create index if not exists wines_barcode_idx on wines (user_id, barcode) where barcode is not null;
  create index if not exists wines_user_id_idx on wines (user_id);

  create table if not exists tasting_notes (
    id uuid primary key default gen_random_uuid(),
    wine_id uuid references wines on delete cascade not null,
    rating int check (rating between 1 and 5),
    aroma text,
    taste text,
    notes text,
    tasted_at date default current_date
  );

  create table if not exists wine_photos (
    id uuid primary key default gen_random_uuid(),
    wine_id uuid references wines on delete cascade not null,
    storage_path text not null,
    is_primary boolean default false
  );

  create table if not exists recommendation_runs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users not null,
    prompt_summary text,
    results jsonb not null,
    created_at timestamptz default now()
  );

  alter table wines enable row level security;
  alter table tasting_notes enable row level security;
  alter table wine_photos enable row level security;
  alter table recommendation_runs enable row level security;

  create policy "Users manage own wines"
    on wines for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

  create policy "Users manage tasting notes for own wines"
    on tasting_notes for all
    using (exists (select 1 from wines w where w.id = tasting_notes.wine_id and w.user_id = auth.uid()))
    with check (exists (select 1 from wines w where w.id = tasting_notes.wine_id and w.user_id = auth.uid()));

  create policy "Users manage photos for own wines"
    on wine_photos for all
    using (exists (select 1 from wines w where w.id = wine_photos.wine_id and w.user_id = auth.uid()))
    with check (exists (select 1 from wines w where w.id = wine_photos.wine_id and w.user_id = auth.uid()));

  create policy "Users manage own recommendation runs"
    on recommendation_runs for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
