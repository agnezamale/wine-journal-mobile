# Supabase Edge Functions

This app uses the same Supabase project as the web journal (`yqgdqwefhadgruwmarwa`).
Deploy functions from **this repo**. Do not put `WINE_API_KEY` in the Expo `.env`.

## Deploy functions

1. Log in to the Supabase CLI (or set `SUPABASE_ACCESS_TOKEN` in this terminal only):

   ```bash
   npx supabase login
   npx supabase link --project-ref yqgdqwefhadgruwmarwa
   ```

2. Set secrets from `supabase/.env.local` (gitignored):

   ```bash
   npx supabase secrets set --env-file supabase/.env.local
   ```

3. Deploy:

   ```bash
   npm run functions:deploy:search
   npm run functions:deploy:barcode
   ```

4. In the Supabase Dashboard → Edge Functions, confirm `search-wines` and `lookup-barcode` are active.

The mobile app calls these via `supabase.functions.invoke`.
The phone never sees `WINE_API_KEY`.

Barcode lookup uses Open Food Facts. Scan still lets you type a name if the code is not in that catalog.
