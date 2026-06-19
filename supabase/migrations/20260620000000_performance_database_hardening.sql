-- Database performance, integrity, and RLS optimizations
-- Migration: 20260620000000_performance_database_hardening.sql

BEGIN;

-- 1. Create a secure view for auth users to avoid N+1 REST/admin calls
CREATE OR REPLACE VIEW public.auth_users_summary AS
SELECT 
  id,
  email,
  email_confirmed_at,
  last_sign_in_at,
  created_at,
  updated_at,
  banned_until
FROM auth.users;

-- Revoke all privileges on this view to prevent client-side data leaks
REVOKE ALL ON public.auth_users_summary FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.auth_users_summary TO service_role;

-- 2. Optimize checking functions to prevent N+1 profiles table querying in RLS policies
CREATE OR REPLACE FUNCTION public.is_superadmin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.role() = 'service_role' 
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin'
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role = 'superadmin'
    );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.role() = 'service_role' 
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin')
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'superadmin')
    );
$$;

CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.role() = 'service_role' 
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'manager', 'superadmin')
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'manager', 'superadmin')
    );
$$;

CREATE OR REPLACE FUNCTION public.is_staff_member()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.role() = 'service_role' 
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'manager', 'sales', 'accounts', 'superadmin')
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'manager', 'sales', 'accounts', 'superadmin')
    );
$$;

-- 3. Enhance allocate_order_inventory_atomic to support both wrapped cart_items objects and raw arrays
CREATE OR REPLACE FUNCTION public.allocate_order_inventory_atomic(
  p_customer_name   TEXT,
  p_customer_id     UUID,
  p_customer_email  TEXT,
  p_customer_phone  TEXT,
  p_delivery_address TEXT,
  p_notes           TEXT,
  p_payment_method  TEXT,
  p_subtotal        NUMERIC,
  p_gst_amount      NUMERIC,
  p_total           NUMERIC,
  p_discount_amount NUMERIC,
  p_shipping_amount NUMERIC,
  p_payment_status  TEXT,
  p_order_type      TEXT,
  p_items           JSONB,
  p_agent_id        UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_item         RECORD;
  v_order_id     UUID;
  v_order_row    JSONB;
BEGIN
  IF p_customer_id IS DISTINCT FROM auth.uid() AND NOT public.is_staff_member() THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Access denied: cannot allocate inventory for another user');
  END IF;

  INSERT INTO public.orders (
    customer_id, customer_name, customer_email, customer_phone, delivery_address, notes, payment_method, subtotal, gst_amount, total, discount_amount, shipping_amount, payment_status, status, items, agent_id
  ) VALUES (
    p_customer_id, p_customer_name, p_customer_email, p_customer_phone, p_delivery_address, p_notes, p_payment_method, p_subtotal, p_gst_amount, p_total, p_discount_amount, p_shipping_amount, COALESCE(p_payment_status, 'Awaiting Payment'), 'Pending', p_items, p_agent_id
  ) RETURNING id INTO v_order_id;

  -- Process and lock products in consistent sorted order to prevent concurrency deadlocks
  -- Support both wrapped cart_items object format and raw items array format
  FOR v_item IN 
    SELECT 
      COALESCE((value->>'product_id')::UUID, (value->>'id')::UUID) AS product_id,
      (value->>'quantity')::INTEGER AS quantity
    FROM (
      SELECT 
        CASE 
          WHEN jsonb_typeof(p_items) = 'array' THEN p_items
          WHEN jsonb_typeof(p_items) = 'object' AND p_items ? 'cart_items' THEN p_items->'cart_items'
          ELSE '[]'::jsonb
        END AS items_arr
    ) t,
    jsonb_array_elements(t.items_arr)
    WHERE COALESCE((value->>'product_id')::UUID, (value->>'id')::UUID) IS NOT NULL
    ORDER BY 1 -- Sort consistently by product ID
  LOOP
    IF v_item.quantity > 0 THEN
      PERFORM public.record_atomic_stock_movement(v_item.product_id, 'online_sale', v_item.quantity, v_order_id::TEXT, 'online_order', 'Inventory allocated for order ' || v_order_id, FALSE, p_customer_id);
    END IF;
  END LOOP;
  SELECT to_jsonb(o.*) INTO v_order_row FROM public.orders o WHERE id = v_order_id;
  RETURN jsonb_build_object('success', TRUE, 'order', v_order_row);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.allocate_order_inventory_atomic(TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, TEXT, TEXT, JSONB, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.allocate_order_inventory_atomic(TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, TEXT, TEXT, JSONB, UUID) TO service_role;

COMMIT;
