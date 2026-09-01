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
  ('opt-dvr-4ch',           '4-Ch Analog DVR',                   'analog_dvr',     4,   5850, 4500),
  ('opt-dvr-8ch',           '8-Ch Analog DVR',                   'analog_dvr',     8,   8970, 6900),
  ('opt-dvr-16ch',          '16-Ch Analog DVR',                  'analog_dvr',     16,  16250,12500),
  -- Analog SMPS
  ('opt-smps-4ch',          '10 Amps 12V SMPS Power Supply',     'analog_smps',    4,   1299, 999),
  ('opt-smps-8ch',          '20 Amps 12V SMPS Power Supply',     'analog_smps',    8,   1949, 1499),
  -- Analog cameras
  ('opt-cam-2mp-dome',      '2.4MP Indoor Dome Camera',          'analog_camera',  NULL, 2079, 1599),
  ('opt-cam-2mp-bullet',    '2.4MP Outdoor Bullet Camera (Dual Light)', 'analog_camera', NULL, 2469, 1899),
  ('opt-cam-5mp-bullet',    '5MP Night Vision Bullet Camera',    'analog_camera',  NULL, 2859, 2199),
  ('opt-cam-5mp-dual',      '5MP Dual Light Bullet Camera',      'analog_camera',  NULL, 3249, 2499),
  -- Analog cable (90m roll, per-metre rate)
  ('cable-coaxial-100m',    'CCTV 3+1 Cable (90m Roll)',         'analog_cable',   90,  18.77, 14.43),

  -- IP NVRs
  ('nvr-8',                 '8-Channel NVR (IP)',                'ip_nvr',         8,   6370, 4900),
  ('nvr-16',                '16-Channel NVR (IP)',               'ip_nvr',         16,  11570,8900),
  ('nvr-32',                '32-Channel NVR (IP)',               'ip_nvr',         32,  16899,12999),
  -- IP POE switches (Normal)
  ('poe-4-normal',          '4-Port POE Switch (Normal)',        'ip_poe',         4,   3899, 2999),
  ('poe-8-normal',          '8-Port POE Switch (Normal)',        'ip_poe',         8,   6499, 4999),
  ('poe-16-normal',         '16-Port POE Switch (Normal)',       'ip_poe',         16,  7799, 5999),
  ('poe-24-normal',         '24-Port POE Switch (Normal)',       'ip_poe',         24,  11699,8999),
  -- IP POE switches (GIGA)
  ('poe-4-giga',            '4-Port POE Switch (GIGA)',          'ip_poe',         4,   4549, 3499),
  ('poe-8-giga',            '8-Port POE Switch (GIGA)',          'ip_poe',         8,   7799, 5999),
  ('poe-16-giga',           '16-Port POE Switch (GIGA)',         'ip_poe',         16,  10399,7999),
  ('poe-24-giga',           '24-Port POE Switch (GIGA)',         'ip_poe',         24,  15599,11999),
  -- IP cameras
  ('ip-2-standard',         '2MP IP Camera (Standard)',          'ip_camera',      NULL, 3899, 2999),
  ('ip-2-dual',             '2MP IP Camera (Dual Light)',        'ip_camera',      NULL, 4549, 3499),
  ('ip-4-standard',         '4MP IP Camera (Standard)',          'ip_camera',      NULL, 5199, 3999),
  ('ip-4-dual',             '4MP IP Camera (Dual Light)',        'ip_camera',      NULL, 5849, 4499),
  -- IP cables (per-100m unit)
  ('cable-lan-cat5',        'LAN Cat 5E Cable (100m Roll)',      'ip_cable',       100, 20.79, 15.99),
  ('cable-lan-cat6',        'LAN Cat 6 Cable (100m Roll)',       'ip_cable',       100, 42.89, 32.99),

  -- Storage
  ('hdd-surveillance-500gb','500 GB Surveillance HDD',           'hdd',            NULL, 7799, 5999),
  ('hdd-surveillance-1tb',  '1 TB Surveillance HDD',             'hdd',            NULL, 12999,9999),
  ('hdd-surveillance-2tb',  '2 TB Surveillance HDD',             'hdd',            NULL, 18199,13999),
  -- Monitors
  ('monitor-19',            '19-inch LED Monitor',               'monitor',        NULL, 3899, 2999),
  ('monitor-22',            '22-inch LED Monitor',               'monitor',        NULL, 5199, 3999),
  -- Racks
  ('rack-2u',               '2U Wall Mount Rack',                'rack',           NULL, 1299, 999),
  ('rack-3u',               '3U Wall Mount Rack',                'rack',           NULL, 1949, 1499),
  -- Conduit
  ('conduit-pipe',          'Conduit Pipe (per meter)',          'conduit',        NULL, 20,   15),
  -- Installation
  ('installation',          'On-site Installation & Configuration','installation', NULL, 1950, 1500),
  -- Accessories
  ('wall-mount-addon',      'Wall Mount Installation Kit',       'accessory',      NULL, 455,  350),
  ('spike-guard',           'Spike Guard / Power Surge Protector','accessory',     NULL, 585,  450)
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
