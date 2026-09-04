-- Run once in Supabase SQL Editor (Project: yqgdqwefhadgruwmarwa)
-- Dashboard → SQL → New query
-- Creates the private wine-photos bucket and per-user access policies.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wine-photos',
  'wine-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

drop policy if exists "Users read own wine photos" on storage.objects;
create policy "Users read own wine photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'wine-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users upload own wine photos" on storage.objects;
create policy "Users upload own wine photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'wine-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users update own wine photos" on storage.objects;
create policy "Users update own wine photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'wine-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users delete own wine photos" on storage.objects;
create policy "Users delete own wine photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'wine-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
