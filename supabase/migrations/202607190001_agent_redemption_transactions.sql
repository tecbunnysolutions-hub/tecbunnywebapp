CREATE OR REPLACE FUNCTION public.approve_agent_redemption(
  p_redemption_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_redemption public.agent_redemption_requests%ROWTYPE;
BEGIN
  UPDATE public.agent_redemption_requests
  SET status = 'approved'
  WHERE id = p_redemption_id
    AND status = 'pending'
  RETURNING * INTO v_redemption;

  IF NOT FOUND THEN
    SELECT * INTO v_redemption
    FROM public.agent_redemption_requests
    WHERE id = p_redemption_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Redemption request not found' USING ERRCODE = 'P0002';
    END IF;

    RAISE EXCEPTION 'Redemption must be pending to approve. Current status: %', v_redemption.status
      USING ERRCODE = 'P0001';
  END IF;

  RETURN jsonb_build_object(
    'id', v_redemption.id,
    'agent_id', v_redemption.agent_id,
    'status', v_redemption.status,
    'points_to_redeem', v_redemption.points_to_redeem
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.process_agent_redemption(
  p_redemption_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_redemption public.agent_redemption_requests%ROWTYPE;
  v_balance numeric;
BEGIN
  SELECT * INTO v_redemption
  FROM public.agent_redemption_requests
  WHERE id = p_redemption_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Redemption request not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_redemption.status <> 'approved' THEN
    RAISE EXCEPTION 'Redemption must be approved before processing. Current status: %', v_redemption.status
      USING ERRCODE = 'P0001';
  END IF;

  SELECT points_balance INTO v_balance
  FROM public.sales_agents
  WHERE id = v_redemption.agent_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sales agent not found for redemption' USING ERRCODE = 'P0002';
  END IF;

  IF v_balance < v_redemption.points_to_redeem THEN
    RAISE EXCEPTION 'Insufficient points balance' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.sales_agents
  SET points_balance = points_balance - v_redemption.points_to_redeem,
      updated_at = NOW()
  WHERE id = v_redemption.agent_id;

  UPDATE public.agent_redemption_requests
  SET status = 'processed',
      processed_at = NOW()
  WHERE id = p_redemption_id
  RETURNING * INTO v_redemption;

  RETURN jsonb_build_object(
    'id', v_redemption.id,
    'agent_id', v_redemption.agent_id,
    'status', v_redemption.status,
    'points_to_redeem', v_redemption.points_to_redeem,
    'processed_at', v_redemption.processed_at
  );
END;
$$;