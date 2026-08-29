-- =============================================================================
-- Migration: Service booking fees + website build-up quotation catalogue
-- Date: 2026-08-04
-- =============================================================================
-- Business model implemented here:
--   * Field/remote services (CCTV, IT, Printer, Networking, Mobile, Software)
--     charge a small UPFRONT "booking fee" when the customer books a visit.
--   * The ACTUAL repair/service amount is billed later, after the engineer
--     visits and diagnoses/repairs the device, or after full requirements are
--     captured for remote work.
--   * If the job is completed and billed, the booking fee is WAIVED
--     (adjusted / deducted) in the final invoice.
--   * Website / software build-up is quotation-only: no booking fee, priced as
--     a set of selectable components the customer picks to build a quote.
--
-- IMPORTANT: matches the LIVE `public.services` schema, which is the enterprise
-- shape: (id uuid, company_id, category_id, name, slug, category, description,
-- base_price numeric, status public.record_status, metadata jsonb, audit cols).
-- There is NO title/price/icon/features/is_active column on this table, so the
-- upfront amount goes in `base_price` and rich display fields go in `metadata`.
-- This migration is idempotent (safe to re-run).
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Extend the existing `services` table with booking-fee metadata
-- -----------------------------------------------------------------------------
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS booking_fee            numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS booking_fee_waivable   boolean       NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS pricing_model          text          NOT NULL DEFAULT 'booking_fee',
  ADD COLUMN IF NOT EXISTS is_quotation_only      boolean       NOT NULL DEFAULT false;

-- pricing_model explains how the row is charged:
--   'booking_fee' -> collect booking_fee now, bill actual later, waive fee on completion
--   'quotation'   -> no upfront charge, built from quote components
--   'fixed'       -> flat price paid in full (default legacy behaviour)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'services_pricing_model_check'
  ) THEN
    ALTER TABLE public.services
      ADD CONSTRAINT services_pricing_model_check
      CHECK (pricing_model IN ('booking_fee', 'quotation', 'fixed'));
  END IF;
END $$;

-- Slug is the stable natural key we upsert on.
CREATE UNIQUE INDEX IF NOT EXISTS services_slug_key
  ON public.services (slug)
  WHERE slug IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 2. Upsert the 6 booking-fee services
--    base_price == booking_fee so the upfront amount the customer pays to book
--    is what shows as the service price. Real repair cost is captured per
--    service_request (see section 5). Display fields live in metadata.
-- -----------------------------------------------------------------------------
INSERT INTO public.services
  (slug, name, category, description, base_price, status,
   booking_fee, booking_fee_waivable, pricing_model, is_quotation_only,
   metadata, created_at, updated_at)
VALUES
  ('cctv-services', 'CCTV Services', 'CCTV',
   'On-site CCTV installation, repair and maintenance. Pay a small booking fee to schedule a visit; the actual service is billed after inspection.',
   499, 'active',
   499, true, 'booking_fee', false,
   jsonb_build_object(
     'title', 'CCTV Services',
     'icon', 'Shield',
     'display_order', 10,
     'features', jsonb_build_array('On-site engineer visit','Diagnosis & inspection','Booking fee adjusted in final bill'),
     'terms_and_conditions', 'Booking fee of Rs.499 is collected to schedule the visit. Actual charges are billed after the service is diagnosed/completed. The booking fee is waived (adjusted) in the final invoice when the job is completed.'
   ),
   now(), now()),

  ('it-services', 'IT Services', 'IT',
   'On-site IT support, hardware and system troubleshooting. Pay a booking fee to schedule a visit; the actual service is billed after diagnosis.',
   499, 'active',
   499, true, 'booking_fee', false,
   jsonb_build_object(
     'title', 'IT Services',
     'icon', 'Laptop',
     'display_order', 20,
     'features', jsonb_build_array('On-site engineer visit','Hardware & system diagnosis','Booking fee adjusted in final bill'),
     'terms_and_conditions', 'Booking fee of Rs.499 is collected to schedule the visit. Actual charges are billed after the service is diagnosed/completed. The booking fee is waived (adjusted) in the final invoice when the job is completed.'
   ),
   now(), now()),

  ('printer-services', 'Printer Services', 'Printer',
   'On-site printer repair, servicing and setup. Pay a booking fee to schedule a visit; the actual service is billed after inspection.',
   499, 'active',
   499, true, 'booking_fee', false,
   jsonb_build_object(
     'title', 'Printer Services',
     'icon', 'Settings',
     'display_order', 30,
     'features', jsonb_build_array('On-site engineer visit','Printer diagnosis & servicing','Booking fee adjusted in final bill'),
     'terms_and_conditions', 'Booking fee of Rs.499 is collected to schedule the visit. Actual charges are billed after the service is diagnosed/completed. The booking fee is waived (adjusted) in the final invoice when the job is completed.'
   ),
   now(), now()),

  ('networking-services', 'Networking Services', 'Networking',
   'On-site networking setup, cabling and troubleshooting. Pay a booking fee to schedule a visit; the actual service is billed after assessment.',
   499, 'active',
   499, true, 'booking_fee', false,
   jsonb_build_object(
     'title', 'Networking Services',
     'icon', 'Zap',
     'display_order', 40,
     'features', jsonb_build_array('On-site engineer visit','Network assessment & setup','Booking fee adjusted in final bill'),
     'terms_and_conditions', 'Booking fee of Rs.499 is collected to schedule the visit. Actual charges are billed after the service is diagnosed/completed. The booking fee is waived (adjusted) in the final invoice when the job is completed.'
   ),
   now(), now()),

  ('mobile-repair-services', 'Mobile Repair Services', 'Mobile',
   'Mobile phone diagnosis and repair. Pay a small booking fee to schedule; the actual repair is billed after inspection.',
   199, 'active',
   199, true, 'booking_fee', false,
   jsonb_build_object(
     'title', 'Mobile Repair Services',
     'icon', 'Smartphone',
     'display_order', 50,
     'features', jsonb_build_array('Device diagnosis','Repair estimate on inspection','Booking fee adjusted in final bill'),
     'terms_and_conditions', 'Booking fee of Rs.199 is collected to book the repair. Actual charges are billed after the device is inspected/repaired. The booking fee is waived (adjusted) in the final invoice when the repair is completed.'
   ),
   now(), now()),

  ('software-remote-services', 'Software Services (Remote Service)', 'Software',
   'Remote software installation, configuration and troubleshooting. Pay a booking fee to reserve a remote session; the actual service is billed after details are captured.',
   299, 'active',
   299, true, 'booking_fee', false,
   jsonb_build_object(
     'title', 'Software Services (Remote Service)',
     'icon', 'RefreshCw',
     'display_order', 60,
     'features', jsonb_build_array('Remote session','Software install/config/troubleshoot','Booking fee adjusted in final bill'),
     'terms_and_conditions', 'Booking fee of Rs.299 is collected to reserve the remote session. Actual charges are billed after the service scope/details are captured. The booking fee is waived (adjusted) in the final invoice when the service is completed.'
   ),
   now(), now())

ON CONFLICT (slug) WHERE slug IS NOT NULL DO UPDATE SET
  name                 = EXCLUDED.name,
  category             = EXCLUDED.category,
  description          = EXCLUDED.description,
  base_price           = EXCLUDED.base_price,
  status               = EXCLUDED.status,
  booking_fee          = EXCLUDED.booking_fee,
  booking_fee_waivable = EXCLUDED.booking_fee_waivable,
  pricing_model        = EXCLUDED.pricing_model,
  is_quotation_only    = EXCLUDED.is_quotation_only,
  metadata             = EXCLUDED.metadata,
  updated_at           = now();

-- -----------------------------------------------------------------------------
-- 3. Upsert the parent "Software / Website Build-up" quotation service
--    (no booking fee; it is priced by selecting components below).
-- -----------------------------------------------------------------------------
INSERT INTO public.services
  (slug, name, category, description, base_price, status,
   booking_fee, booking_fee_waivable, pricing_model, is_quotation_only,
   metadata, created_at, updated_at)
VALUES
  ('software-website-buildup', 'Software/Website Buildup Services', 'Development',
   'Custom software and website build-up. Priced on quotation - pick the components you need to build your quote.',
   0, 'active',
   0, false, 'quotation', true,
   jsonb_build_object(
     'title', 'Software / Website Build-up Services',
     'icon', 'Settings',
     'display_order', 70,
     'is_featured', true,
     'features', jsonb_build_array('Modular components','Transparent quotation','Pay only for what you choose'),
     'terms_and_conditions', 'This service is quotation-only. The final price is the sum of the selected components. No booking fee applies.'
   ),
   now(), now())
ON CONFLICT (slug) WHERE slug IS NOT NULL DO UPDATE SET
  name                 = EXCLUDED.name,
  category             = EXCLUDED.category,
  description          = EXCLUDED.description,
  base_price           = EXCLUDED.base_price,
  status               = EXCLUDED.status,
  booking_fee          = EXCLUDED.booking_fee,
  booking_fee_waivable = EXCLUDED.booking_fee_waivable,
  pricing_model        = EXCLUDED.pricing_model,
  is_quotation_only    = EXCLUDED.is_quotation_only,
  metadata             = EXCLUDED.metadata,
  updated_at           = now();

-- -----------------------------------------------------------------------------
-- 4. Child table for the website build-up quotation components (items a-g)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_quote_components (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id    uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  code          text NOT NULL,
  name          text NOT NULL,
  description   text,
  price         numeric(10,2) NOT NULL DEFAULT 0,
  display_order int NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (service_id, code)
);

CREATE INDEX IF NOT EXISTS service_quote_components_service_id_idx
  ON public.service_quote_components (service_id);

INSERT INTO public.service_quote_components
  (service_id, code, name, description, price, display_order)
SELECT s.id, v.code, v.name, v.description, v.price, v.display_order
FROM public.services s
JOIN (VALUES
  ('PDR',        'Creating PDR',                    'Product/Project Definition & Requirements document',      1999, 10),
  ('DESIGN',     'Designing & Layout',              'UI/UX design and page layout',                            1999, 20),
  ('DOMAIN',     'Domain and Email Services',       'Domain registration and email hosting setup',              999, 30),
  ('PAYMENT_PG', 'Payment PG and Integration',      'Payment gateway setup and integration',                   1999, 40),
  ('DATABASE',   'Database Integration',            'Database design and integration',                          999, 50),
  ('WHATSAPP',   'WhatsApp API and Configuration',  'WhatsApp Business API onboarding and configuration',      1999, 60),
  ('EMAIL_CFG',  'Email Configuration',             'Business email accounts configuration',                    599, 70)
) AS v(code, name, description, price, display_order) ON true
WHERE s.slug = 'software-website-buildup'
ON CONFLICT (service_id, code) DO UPDATE SET
  name          = EXCLUDED.name,
  description   = EXCLUDED.description,
  price         = EXCLUDED.price,
  display_order = EXCLUDED.display_order,
  is_active     = true,
  updated_at    = now();

-- -----------------------------------------------------------------------------
-- 5. Booking-fee lifecycle tracking on `service_requests`
--    Captures what was collected up-front, the final billed amount, whether the
--    booking fee was waived, and the net amount still due from the customer.
-- -----------------------------------------------------------------------------
ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS booking_fee_amount  numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS booking_fee_paid    boolean       NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS booking_fee_waived  boolean       NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS final_bill_amount   numeric(10,2),
  ADD COLUMN IF NOT EXISTS amount_due          numeric(10,2)
    GENERATED ALWAYS AS (
      GREATEST(
        COALESCE(final_bill_amount, 0)
          -- If the booking fee was paid AND is waived on completion, deduct it
          -- from the final bill (the customer already paid it up-front).
          - CASE WHEN booking_fee_paid AND booking_fee_waived THEN booking_fee_amount ELSE 0 END,
        0
      )
    ) STORED;

COMMENT ON COLUMN public.service_requests.amount_due IS
  'Net payable = final_bill_amount minus the already-paid booking fee when that fee is waived (adjusted) on completion. Never negative.';

COMMIT;
