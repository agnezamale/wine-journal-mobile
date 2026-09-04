-- Run once in Supabase SQL Editor (Project: yqgdqwefhadgruwmarwa)
-- Adds wineapi profile fields so journal cards can show full details.

alter table wines add column if not exists description text;
alter table wines add column if not exists alcohol_content decimal;
alter table wines add column if not exists average_rating decimal;
alter table wines add column if not exists body text;
alter table wines add column if not exists acidity text;
alter table wines add column if not exists appellation text;
alter table wines add column if not exists image_url text;
