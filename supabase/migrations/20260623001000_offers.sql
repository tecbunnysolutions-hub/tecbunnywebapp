CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'buy_x_get_y', 'free_shipping')),
  discount_value NUMERIC(12,2),
  minimum_purchase_amount NUMERIC(12,2),
  maximum_discount_amount NUMERIC(12,2),
  offer_code TEXT UNIQUE,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  display_on_homepage BOOLEAN NOT NULL DEFAULT FALSE,
  customer_eligibility TEXT NOT NULL DEFAULT 'all',
  banner_text TEXT,
  banner_color TEXT,
  terms_and_conditions TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  usage_limit_per_customer INTEGER,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_date > start_date),
  CHECK (usage_count >= 0),
  CHECK (usage_limit IS NULL OR usage_limit > 0),
  CHECK (usage_limit_per_customer IS NULL OR usage_limit_per_customer > 0),
  CHECK (usage_limit IS NULL OR usage_count <= usage_limit),
  CHECK (usage_limit IS NULL OR usage_limit_per_customer IS NULL OR usage_limit_per_customer <= usage_limit)
);

CREATE INDEX IF NOT EXISTS idx_offers_active_dates ON public.offers (is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_offers_featured ON public.offers (is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_offers_homepage ON public.offers (display_on_homepage) WHERE display_on_homepage = TRUE;
CREATE INDEX IF NOT EXISTS idx_offers_priority_created ON public.offers (priority DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offers_offer_code ON public.offers (offer_code) WHERE offer_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.offer_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID,
  email TEXT,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offer_usage_offer_id ON public.offer_usage (offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_usage_user_id ON public.offer_usage (user_id);
CREATE INDEX IF NOT EXISTS idx_offer_usage_email ON public.offer_usage (email) WHERE email IS NOT NULL;

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active offers" ON public.offers;
CREATE POLICY "Public can read active offers"
ON public.offers
FOR SELECT
TO anon, authenticated
USING (is_active = TRUE AND start_date <= NOW() AND end_date >= NOW());

DROP POLICY IF EXISTS "Staff can manage offers" ON public.offers;
CREATE POLICY "Staff can manage offers"
ON public.offers
FOR ALL
TO authenticated
USING (public.is_staff_member())
WITH CHECK (public.is_staff_member());

DROP POLICY IF EXISTS "Service role can manage offers" ON public.offers;
CREATE POLICY "Service role can manage offers"
ON public.offers
FOR ALL
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Staff can read offer usage" ON public.offer_usage;
CREATE POLICY "Staff can read offer usage"
ON public.offer_usage
FOR SELECT
TO authenticated
USING (public.is_staff_member());

DROP POLICY IF EXISTS "Service role can manage offer usage" ON public.offer_usage;
CREATE POLICY "Service role can manage offer usage"
ON public.offer_usage
FOR ALL
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

DROP TRIGGER IF EXISTS update_offers_updated_at ON public.offers;
CREATE TRIGGER update_offers_updated_at
BEFORE UPDATE ON public.offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
