-- Atomic commission award: insert commission record and increment agent points in a single transaction
-- If either operation fails, the entire transaction rolls back.
-- Prevents commission records without corresponding points increments.

CREATE OR REPLACE FUNCTION award_commission_atomic(
  p_order_id uuid,
  p_agent_id uuid,
  p_commission_amount numeric,
  p_commission_data jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_commission_id uuid;
  v_error text;
BEGIN
  -- Start transaction (implicit in PL/pgSQL)
  
  -- Step 1: Insert commission record (with UNIQUE(order_id) constraint preventing duplicates)
  BEGIN
    INSERT INTO sales_agent_commissions (
      order_id,
      agent_id,
      commission_amount,
      commission_type,
      calculation_details,
      status,
      metadata,
      created_at,
      updated_at
    ) VALUES (
      p_order_id,
      p_agent_id,
      p_commission_amount,
      'order_fulfillment',
      p_commission_data,
      'pending',
      jsonb_build_object('awarded_at', NOW()),
      NOW(),
      NOW()
    )
    ON CONFLICT (order_id) DO NOTHING
    RETURNING id INTO v_commission_id;
    
    IF v_commission_id IS NULL THEN
      -- Duplicate order_id; this is not an error but means commission already awarded
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Commission already awarded for this order',
        'code', 'DUPLICATE_COMMISSION'
      );
    END IF;
    
  EXCEPTION WHEN OTHERS THEN
    v_error := SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Failed to insert commission: ' || v_error,
      'code', 'COMMISSION_INSERT_FAILED'
    );
  END;
  
  -- Step 2: Increment agent points atomically
  BEGIN
    UPDATE sales_agents
    SET points_balance = points_balance + p_commission_amount,
        updated_at = NOW()
    WHERE id = p_agent_id;
    
    IF NOT FOUND THEN
      -- Agent does not exist; rollback the commission insert
      RAISE EXCEPTION 'Agent % does not exist', p_agent_id;
    END IF;
    
  EXCEPTION WHEN OTHERS THEN
    v_error := SQLERRM;
    -- Rollback entire transaction (both commission insert and points update)
    RAISE EXCEPTION 'Failed to increment agent points: %', v_error;
  END;
  
  -- Both operations succeeded; return success with commission ID
  RETURN jsonb_build_object(
    'success', true,
    'commission_id', v_commission_id,
    'agent_id', p_agent_id,
    'commission_amount', p_commission_amount
  );
  
EXCEPTION WHEN OTHERS THEN
  -- Catch-all; transaction will rollback automatically
  v_error := SQLERRM;
  RETURN jsonb_build_object(
    'success', false,
    'error', 'Atomic commission award failed: ' || v_error,
    'code', 'TRANSACTION_FAILED'
  );
END;
$$;

-- Grant execute to service role only
GRANT EXECUTE ON FUNCTION award_commission_atomic TO service_role;
