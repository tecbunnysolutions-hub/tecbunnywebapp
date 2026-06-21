const { Client } = require('pg');

async function main() {
  console.log('Connecting to database...');

  const client = new Client({
    user: 'postgres',
    host: 'db.yzrznydkqcacjiwalmlw.supabase.co',
    database: 'postgres',
    password: 'Bunny@6010#1',
    port: 5432,
    ssl: { rejectUnauthorized: false } // Required/recommended for Supabase connections
  });

  await client.connect();
  console.log('Connected.');

  try {
    // 1. Find and drop stock constraints in products and inventory_current
    console.log('Checking and dropping constraints...');
    const dropConstraintsQuery = `
      DO $$
      DECLARE
        r RECORD;
      BEGIN
        -- Drop check constraints on products table that restrict stock_quantity to >= 0
        FOR r IN 
          SELECT constraint_name 
          FROM information_schema.constraint_column_usage 
          WHERE table_name = 'products' AND column_name = 'stock_quantity'
        LOOP
          EXECUTE 'ALTER TABLE public.products DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name) || ' CASCADE';
          RAISE NOTICE 'Dropped constraint % on products', r.constraint_name;
        END LOOP;

        -- Drop check constraints on inventory_current table that restrict stock_quantity to >= 0
        FOR r IN 
          SELECT constraint_name 
          FROM information_schema.constraint_column_usage 
          WHERE table_name = 'inventory_current' AND column_name = 'stock_quantity'
        LOOP
          EXECUTE 'ALTER TABLE public.inventory_current DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name) || ' CASCADE';
          RAISE NOTICE 'Dropped constraint % on inventory_current', r.constraint_name;
        END LOOP;
      END;
      $$;
    `;
    await client.query(dropConstraintsQuery);
    console.log('Dropped negative stock check constraints successfully.');

    // 2. Re-define the allocate_order_inventory_atomic function with allow_negative = TRUE (7th param of record_atomic_stock_movement)
    console.log('Updating allocate_order_inventory_atomic function...');
    const updateFunctionQuery = `
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
            -- Pass TRUE for allow_negative (7th parameter) in record_atomic_stock_movement
            PERFORM public.record_atomic_stock_movement(
              v_item.product_id, 
              'online_sale', 
              v_item.quantity, 
              v_order_id::TEXT, 
              'online_order', 
              'Inventory allocated for order ' || v_order_id, 
              TRUE, 
              p_customer_id
            );
          END IF;
        END LOOP;
        SELECT to_jsonb(o.*) INTO v_order_row FROM public.orders o WHERE id = v_order_id;
        RETURN jsonb_build_object('success', TRUE, 'order', v_order_row);
      EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM);
      END;
      $$;
    `;
    await client.query(updateFunctionQuery);
    console.log('Updated allocate_order_inventory_atomic function successfully.');

    // 3. Grant execute permissions back to service_role to match migrations
    console.log('Updating function permissions...');
    await client.query(`
      REVOKE ALL ON FUNCTION public.allocate_order_inventory_atomic(TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, TEXT, TEXT, JSONB, UUID) FROM PUBLIC, anon, authenticated;
      GRANT EXECUTE ON FUNCTION public.allocate_order_inventory_atomic(TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, TEXT, TEXT, JSONB, UUID) TO service_role;
    `);
    console.log('Updated permissions successfully.');

  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await client.end();
    console.log('Disconnected.');
  }
}

main();
