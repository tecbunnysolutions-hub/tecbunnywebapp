-- Commission integrity constraints and atomic points increment helper.

-- Prevent duplicate commissions at the database level.
-- The application-level existence check is an optimisation only; this is the guarantee.
ALTER TABLE sales_agent_commissions
  ADD CONSTRAINT uq_commission_order UNIQUE (order_id);

-- Atomic agent-points increment so concurrent award calls cannot cause a lost update.
CREATE OR REPLACE FUNCTION increment_agent_points(p_agent_id uuid, p_amount numeric)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE sales_agents
  SET    points_balance = COALESCE(points_balance, 0) + p_amount
  WHERE  id = p_agent_id;
$$;
