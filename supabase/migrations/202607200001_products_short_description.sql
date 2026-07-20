-- Restore the short_description column used by scraper imports and admin edit flows.
-- The Supabase schema cache error indicates the live products table is missing this column.

ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS short_description TEXT;