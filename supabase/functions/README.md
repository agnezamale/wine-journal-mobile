# Supabase Edge Functions

This app uses the same Supabase project as the web journal (`yqgdqwefhadgruwmarwa`).
Deploy functions from **this repo**. Do not put `WINE_API_KEY` in the Expo `.env`.

## Deploy `search-wines`

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
   ```

4. In the Supabase Dashboard → Edge Functions → `search-wines`, confirm it is active.

The mobile app calls this via `supabase.functions.invoke('search-wines')`.
The phone never sees `WINE_API_KEY`.
