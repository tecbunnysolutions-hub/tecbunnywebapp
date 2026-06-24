-- TecBunny regional area/team setup.
-- Safe to run once from Supabase SQL Editor and idempotent on repeat runs.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.areas
  ADD COLUMN IF NOT EXISTS sales_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS service_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS services_enabled BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.area_pincodes (
  pincode TEXT PRIMARY KEY,
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT area_pincodes_valid_pincode CHECK (pincode ~ '^[1-9][0-9]{5}$')
);

CREATE TABLE IF NOT EXISTS public.user_area_assignments (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, area_id)
);

CREATE TABLE IF NOT EXISTS public.area_postal_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  pincode TEXT NOT NULL,
  office_name TEXT NOT NULL,
  block_taluka TEXT,
  district TEXT,
  state TEXT,
  division TEXT,
  region TEXT,
  circle TEXT,
  branch_type TEXT,
  delivery_status TEXT,
  raw_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (area_id, pincode, office_name)
);

CREATE INDEX IF NOT EXISTS idx_area_pincodes_area_active
  ON public.area_pincodes(area_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_area_area_user
  ON public.user_area_assignments(area_id, user_id);
CREATE INDEX IF NOT EXISTS idx_areas_sales_manager
  ON public.areas(sales_manager_id);
CREATE INDEX IF NOT EXISTS idx_areas_service_manager
  ON public.areas(service_manager_id);
CREATE INDEX IF NOT EXISTS idx_area_postal_location_lookup
  ON public.area_postal_locations(area_id, pincode);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas(id),
  ADD COLUMN IF NOT EXISTS delivery_pincode TEXT,
  ADD COLUMN IF NOT EXISTS assigned_sales_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_service_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.service_tickets
  ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas(id),
  ADD COLUMN IF NOT EXISTS service_pincode TEXT,
  ADD COLUMN IF NOT EXISTS assigned_service_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.area_pincodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_area_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.area_postal_locations ENABLE ROW LEVEL SECURITY;

-- This setup is managed only by server-side service-role APIs. Staff access to
-- orders and tickets remains controlled by the existing regional RLS policies.
REVOKE ALL ON public.areas FROM anon;
REVOKE ALL ON public.area_pincodes FROM anon;
REVOKE ALL ON public.user_area_assignments FROM anon;
REVOKE ALL ON public.area_postal_locations FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.areas TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.area_pincodes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_area_assignments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.area_postal_locations TO service_role;

CREATE OR REPLACE FUNCTION public.superadmin_save_area_team(
  p_area_id UUID,
  p_code TEXT,
  p_name TEXT,
  p_is_active BOOLEAN,
  p_services_enabled BOOLEAN,
  p_pincodes TEXT[],
  p_sales_manager_id UUID,
  p_service_manager_id UUID,
  p_sales_team_ids UUID[],
  p_service_engineer_ids UUID[],
  p_postal_locations JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_area_id UUID;
  v_user_id UUID;
  v_role TEXT;
BEGIN
  IF NULLIF(TRIM(p_code), '') IS NULL OR NULLIF(TRIM(p_name), '') IS NULL THEN
    RAISE EXCEPTION 'Area code and name are required';
  END IF;

  IF EXISTS (
    SELECT 1 FROM unnest(COALESCE(p_pincodes, ARRAY[]::TEXT[])) value
    WHERE value !~ '^[1-9][0-9]{5}$'
  ) THEN
    RAISE EXCEPTION 'Every pincode must be a valid six-digit Indian pincode';
  END IF;

  IF p_sales_manager_id IS NOT NULL THEN
    SELECT role INTO v_role FROM public.profiles WHERE id = p_sales_manager_id AND is_active = TRUE;
    IF v_role IS DISTINCT FROM 'sales_manager' THEN
      RAISE EXCEPTION 'Selected Sales Manager does not have sales_manager role';
    END IF;
  END IF;

  IF p_service_manager_id IS NOT NULL THEN
    SELECT role INTO v_role FROM public.profiles WHERE id = p_service_manager_id AND is_active = TRUE;
    IF v_role IS DISTINCT FROM 'service_manager' THEN
      RAISE EXCEPTION 'Selected Service Manager does not have service_manager role';
    END IF;
  END IF;

  FOREACH v_user_id IN ARRAY COALESCE(p_sales_team_ids, ARRAY[]::UUID[]) LOOP
    SELECT role INTO v_role FROM public.profiles WHERE id = v_user_id AND is_active = TRUE;
    IF v_role IS NULL OR v_role NOT IN ('sales_executive', 'store_executive', 'sales_agent') THEN
      RAISE EXCEPTION 'Sales team member % has incompatible role %', v_user_id, v_role;
    END IF;
  END LOOP;

  FOREACH v_user_id IN ARRAY COALESCE(p_service_engineer_ids, ARRAY[]::UUID[]) LOOP
    SELECT role INTO v_role FROM public.profiles WHERE id = v_user_id AND is_active = TRUE;
    IF v_role IS DISTINCT FROM 'service_engineer' THEN
      RAISE EXCEPTION 'Service team member % does not have service_engineer role', v_user_id;
    END IF;
  END LOOP;

  IF p_area_id IS NULL THEN
    INSERT INTO public.areas (
      code, name, is_active, services_enabled, sales_manager_id, service_manager_id
    ) VALUES (
      UPPER(TRIM(p_code)), TRIM(p_name), COALESCE(p_is_active, TRUE),
      COALESCE(p_services_enabled, FALSE),
      p_sales_manager_id, p_service_manager_id
    )
    RETURNING id INTO v_area_id;
  ELSE
    UPDATE public.areas
    SET code = UPPER(TRIM(p_code)),
        name = TRIM(p_name),
        is_active = COALESCE(p_is_active, TRUE),
        services_enabled = COALESCE(p_services_enabled, FALSE),
        sales_manager_id = p_sales_manager_id,
        service_manager_id = p_service_manager_id,
        updated_at = NOW()
    WHERE id = p_area_id
    RETURNING id INTO v_area_id;

    IF v_area_id IS NULL THEN
      RAISE EXCEPTION 'Area not found';
    END IF;
  END IF;

  DELETE FROM public.area_pincodes WHERE area_id = v_area_id;
  INSERT INTO public.area_pincodes (pincode, area_id, is_active)
  SELECT DISTINCT value, v_area_id, TRUE
  FROM unnest(COALESCE(p_pincodes, ARRAY[]::TEXT[])) value;

  DELETE FROM public.area_postal_locations WHERE area_id = v_area_id;
  INSERT INTO public.area_postal_locations (
    area_id, pincode, office_name, block_taluka, district, state,
    division, region, circle, branch_type, delivery_status, raw_data
  )
  SELECT
    v_area_id,
    record.pincode,
    record.office_name,
    record.block_taluka,
    record.district,
    record.state,
    record.division,
    record.region,
    record.circle,
    record.branch_type,
    record.delivery_status,
    COALESCE(record.raw_data, '{}'::JSONB)
  FROM jsonb_to_recordset(COALESCE(p_postal_locations, '[]'::JSONB)) AS record(
    pincode TEXT,
    office_name TEXT,
    block_taluka TEXT,
    district TEXT,
    state TEXT,
    division TEXT,
    region TEXT,
    circle TEXT,
    branch_type TEXT,
    delivery_status TEXT,
    raw_data JSONB
  )
  WHERE record.pincode ~ '^[1-9][0-9]{5}$'
    AND NULLIF(TRIM(record.office_name), '') IS NOT NULL
  ON CONFLICT (area_id, pincode, office_name) DO UPDATE SET
    block_taluka = EXCLUDED.block_taluka,
    district = EXCLUDED.district,
    state = EXCLUDED.state,
    division = EXCLUDED.division,
    region = EXCLUDED.region,
    circle = EXCLUDED.circle,
    branch_type = EXCLUDED.branch_type,
    delivery_status = EXCLUDED.delivery_status,
    raw_data = EXCLUDED.raw_data,
    updated_at = NOW();

  DELETE FROM public.user_area_assignments WHERE area_id = v_area_id;

  INSERT INTO public.user_area_assignments (user_id, area_id, is_primary)
  SELECT DISTINCT user_id, v_area_id, FALSE
  FROM unnest(
    array_remove(
      ARRAY[p_sales_manager_id, p_service_manager_id]
      || COALESCE(p_sales_team_ids, ARRAY[]::UUID[])
      || COALESCE(p_service_engineer_ids, ARRAY[]::UUID[]),
      NULL
    )
  ) user_id
  ON CONFLICT (user_id, area_id) DO UPDATE SET
    created_at = NOW();

  RETURN v_area_id;
END;
$$;

REVOKE ALL ON FUNCTION public.superadmin_save_area_team(
  UUID, TEXT, TEXT, BOOLEAN, BOOLEAN, TEXT[], UUID, UUID, UUID[], UUID[], JSONB
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.superadmin_save_area_team(
  UUID, TEXT, TEXT, BOOLEAN, BOOLEAN, TEXT[], UUID, UUID, UUID[], UUID[], JSONB
) TO service_role;

NOTIFY pgrst, 'reload schema';
