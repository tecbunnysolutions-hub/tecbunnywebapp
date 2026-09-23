-- Affiliate Partner Programme v8.0. Amounts are always recorded before GST.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.affiliate_program_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL UNIQUE REFERENCES public.sales_agents(id) ON DELETE CASCADE,
  tier text NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
  platinum_status text NOT NULL DEFAULT 'not_enrolled' CHECK (platinum_status IN ('not_enrolled', 'pending_deposit', 'active', 'expired', 'cancelled')),
  platinum_started_at timestamptz,
  platinum_ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.affiliate_investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_profile_id uuid NOT NULL REFERENCES public.affiliate_program_profiles(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'refunded', 'forfeited')),
  received_at timestamptz,
  refunded_at timestamptz,
  reference text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.affiliate_product_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  commission_eligible boolean NOT NULL DEFAULT true,
  reason text,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.affiliate_commission_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_profile_id uuid NOT NULL REFERENCES public.affiliate_program_profiles(id) ON DELETE RESTRICT,
  order_id uuid NOT NULL,
  payout_type text NOT NULL CHECK (payout_type IN ('base_advance', 'base_settlement', 'price_increase_share', 'platinum_bonus')),
  order_state text NOT NULL CHECK (order_state IN ('booking_paid', 'settled', 'cancelled', 'returned', 'refunded')),
  eligible_base_amount numeric(12,2) NOT NULL,
  affiliate_quoted_amount numeric(12,2) NOT NULL,
  commission_amount numeric(12,2) NOT NULL CHECK (commission_amount >= 0),
  payable_on date NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'approved', 'paid', 'void')),
  calculation jsonb NOT NULL DEFAULT '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (affiliate_profile_id, order_id, payout_type)
);

CREATE INDEX IF NOT EXISTS affiliate_commission_ledger_profile_payable_idx
  ON public.affiliate_commission_ledger (affiliate_profile_id, payable_on, status);

CREATE OR REPLACE VIEW public.affiliate_commission_reports AS
SELECT
  ap.id AS affiliate_profile_id,
  ap.agent_id,
  ap.tier,
  date_trunc('month', acl.payable_on)::date AS payout_month,
  COALESCE(sum(acl.commission_amount) FILTER (WHERE acl.status <> 'void'), 0) AS gross_commission,
  COALESCE(sum(acl.commission_amount) FILTER (WHERE acl.status = 'paid'), 0) AS paid_commission,
  COALESCE(sum(acl.commission_amount) FILTER (WHERE acl.status IN ('scheduled', 'approved')), 0) AS pending_commission
FROM public.affiliate_program_profiles ap
LEFT JOIN public.affiliate_commission_ledger acl ON acl.affiliate_profile_id = ap.id
GROUP BY ap.id, ap.agent_id, ap.tier, date_trunc('month', acl.payable_on)::date;

ALTER TABLE public.affiliate_program_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_product_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commission_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliates view their profile" ON public.affiliate_program_profiles
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.sales_agents sa WHERE sa.id = agent_id AND sa.user_id = auth.uid()));
CREATE POLICY "affiliates view their investments" ON public.affiliate_investments
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.affiliate_program_profiles ap JOIN public.sales_agents sa ON sa.id = ap.agent_id WHERE ap.id = affiliate_profile_id AND sa.user_id = auth.uid()));
CREATE POLICY "affiliates view their commission ledger" ON public.affiliate_commission_ledger
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.affiliate_program_profiles ap JOIN public.sales_agents sa ON sa.id = ap.agent_id WHERE ap.id = affiliate_profile_id AND sa.user_id = auth.uid()));
CREATE POLICY "authenticated users view product eligibility" ON public.affiliate_product_rules
  FOR SELECT TO authenticated USING (true);

GRANT SELECT ON public.affiliate_commission_reports TO service_role;
