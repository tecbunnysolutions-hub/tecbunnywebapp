-- =============================================================================
-- Migration: Seed Custom Setup prices into Supabase
-- Date: 2026-08-04
-- =============================================================================
-- Why this exists:
--   The CCTV "Custom Setup" builder reads its price catalogue at runtime from
--   `public.custom_setup_inventory` via getCustomSetupInventoryFromDb()
--   (packages/core/src/config-db.ts):
--
--     supabase.from('custom_setup_inventory').select('*').eq('is_active', true)
--
--   and the pricing builder (custom-setup-pricing-server.ts) reads the fields
--   id, label, category, capacity, mrp, sale from each row.
--
--   The LIVE table only had (product_id, quantity, metadata, audit cols) with
--   NO is_active / label / category / capacity / mrp / sale columns, so that
--   query errored, was swallowed, returned [], and the app ALWAYS fell back to
--   the hard-coded FALLBACK_* prices in packages/core/src/custom-setup-pricing.ts.
--
--   This migration:
--     1. Adds the price-catalogue columns the app reads.
--     2. Seeds them with the exact values from the code fallbacks so the CCTV
--        builder now sources prices from Supabase.
--     3. Re-affirms the website build-up quotation component prices
--        (public.service_quote_components) so both "custom setup" surfaces are
--        in sync with the app.
--
--   Categories consumed by the pricing builder:
--     analog_dvr, analog_smps, analog_camera, analog_cable,
--     ip_nvr, ip_poe, ip_camera, ip_cable,
--     hdd, monitor, rack, conduit, installation, accessory
--
--   Idempotent (safe to re-run). Prices below mirror custom-setup-pricing.ts.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Extend custom_setup_inventory with the price-catalogue columns the app reads
-- -----------------------------------------------------------------------------
ALTER TABLE public.custom_setup_inventory
  ADD COLUMN IF NOT EXISTS code      text,
  ADD COLUMN IF NOT EXISTS label     text,
  ADD COLUMN IF NOT EXISTS category  text,
  ADD COLUMN IF NOT EXISTS capacity  numeric(10,2),
  ADD COLUMN IF NOT EXISTS mrp       numeric(10,2),
  ADD COLUMN IF NOT EXISTS sale      numeric(10,2),
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Stable natural key we upsert on.
CREATE UNIQUE INDEX IF NOT EXISTS custom_setup_inventory_code_key
  ON public.custom_setup_inventory (code)
  WHERE code IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 2. Seed CCTV price entries (mirrors FALLBACK_* in custom-setup-pricing.ts)
--    capacity: channel/port count for recorders/switches, coverage metres for
--    cables. mrp/sale: for cables these are the per-metre-unit prices.
-- -----------------------------------------------------------------------------
INSERT INTO public.custom_setup_inventory
  (id, code, label, category, capacity, mrp, sale, is_active, quantity, metadata)
SELECT gen_random_uuid(), v.code, v.label, v.category, v.capacity, v.mrp, v.sale, true, 0, '{}'::jsonb
FROM (VALUES
  -- Analog DVRs
  ('opt-dvr-4ch',           '4-Ch Analog DVR',                   'analog_dvr',     4,   3500, 2999),
  ('opt-dvr-8ch',           '8-Ch Analog DVR',                   'analog_dvr',     8,   5500, 4799),
  ('opt-dvr-16ch',          '16-Ch Analog DVR',                  'analog_dvr',     16,  9500, 8299),
  -- Analog SMPS
  ('opt-smps-4ch',          '4 Channel 12V SMPS',                'analog_smps',    4,   999,  749),
  ('opt-smps-8ch',          '8 Channel 12V SMPS',                'analog_smps',    8,   1699, 1299),
  -- Analog cameras
  ('opt-cam-2mp-dome',      '2.4MP Indoor Dome Camera',          'analog_camera',  NULL, 2200, 1857),
  ('opt-cam-2mp-bullet',    '2.4MP Outdoor Bullet Camera',       'analog_camera',  NULL, 2300, 2043),
  ('opt-cam-5mp-bullet',    '5MP Night Vision Bullet Camera',    'analog_camera',  NULL, 3800, 3299),
  -- Analog cable (per-100m unit)
  ('cable-coaxial-100m',    'CCTV 3+1 Cable (DVR Only)',         'analog_cable',   100, 22,   15.5),

  -- IP NVRs
  ('nvr-8',                 '8-Channel NVR (IP)',                'ip_nvr',         8,   5500, 3950),
  ('nvr-16',                '16-Channel NVR (IP)',               'ip_nvr',         16,  9500, 6800),
  ('nvr-32',                '32-Channel NVR (IP)',               'ip_nvr',         32,  16500,12200),
  -- IP POE switches (Normal)
  ('poe-4-normal',          '4-Port POE Switch (Normal)',        'ip_poe',         4,   2800, 1850),
  ('poe-8-normal',          '8-Port POE Switch (Normal)',        'ip_poe',         8,   4500, 3200),
  ('poe-16-normal',         '16-Port POE Switch (Normal)',       'ip_poe',         16,  8900, 6400),
  ('poe-24-normal',         '24-Port POE Switch (Normal)',       'ip_poe',         24,  13500,9800),
  -- IP POE switches (GIGA)
  ('poe-4-giga',            '4-Port POE Switch (GIGA)',          'ip_poe',         4,   3600, 2600),
  ('poe-8-giga',            '8-Port POE Switch (GIGA)',          'ip_poe',         8,   5800, 4200),
  ('poe-16-giga',           '16-Port POE Switch (GIGA)',         'ip_poe',         16,  11200,8200),
  ('poe-24-giga',           '24-Port POE Switch (GIGA)',         'ip_poe',         24,  16800,12500),
  -- IP cameras
  ('ip-2-standard',         '2MP Normal',                        'ip_camera',      NULL, 2500, 1650),
  ('ip-2-dual',             '2MP Dual Light',                    'ip_camera',      NULL, 3100, 2150),
  ('ip-4-standard',         '4MP Normal',                        'ip_camera',      NULL, 3800, 2750),
  ('ip-4-dual',             '4MP Dual Light',                    'ip_camera',      NULL, 4500, 3250),
  -- IP cables (per-100m unit)
  ('cable-lan-cat5',        'LAN Cat5 Cable (100m)',             'ip_cable',       100, 28,   19.5),
  ('cable-lan-cat6',        'LAN Cat6 Cable (100m)',             'ip_cable',       100, 38,   26.5),

  -- Storage
  ('hdd-surveillance-500gb','500 GB Surveillance HDD',           'hdd',            NULL, 2200, 1450),
  ('hdd-surveillance-1tb',  '1 TB Surveillance HDD',             'hdd',            NULL, 4200, 3150),
  ('hdd-surveillance-2tb',  '2 TB Surveillance HDD',             'hdd',            NULL, 6800, 4950),
  -- Monitors
  ('monitor-19',            '19-inch LED Monitor',               'monitor',        NULL, 5500, 3800),
  ('monitor-22',            '22-inch LED Monitor',               'monitor',        NULL, 7800, 5400),
  -- Racks
  ('rack-2u',               '2U Wall Mount Rack',                'rack',           NULL, 1800, 1200),
  ('rack-3u',               '3U Wall Mount Rack',                'rack',           NULL, 2400, 1650),
  -- Conduit
  ('conduit-pipe',          'Conduit Pipe',                      'conduit',        NULL, 800,  500),
  -- Installation
  ('installation',          'On-site Installation & Configuration','installation', NULL, 2500, 1500),
  -- Accessories
  ('wall-mount-addon',      'Wall Mount Installation Kit',       'accessory',      NULL, 600,  350),
  ('spike-guard',           'Spike Guard / Power Surge Protector','accessory',     NULL, 750,  450)
) AS v(code, label, category, capacity, mrp, sale)
ON CONFLICT (code) WHERE code IS NOT NULL DO UPDATE SET
  label      = EXCLUDED.label,
  category   = EXCLUDED.category,
  capacity   = EXCLUDED.capacity,
  mrp        = EXCLUDED.mrp,
  sale       = EXCLUDED.sale,
  is_active  = true,
  updated_at = now();

-- -----------------------------------------------------------------------------
-- 3. Re-affirm website / software build-up quotation component prices so the
--    quotation "custom setup" is also in sync. Mirrors section 4 of
--    20260804010000_service_booking_fees.sql (idempotent).
-- -----------------------------------------------------------------------------
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

COMMIT;
