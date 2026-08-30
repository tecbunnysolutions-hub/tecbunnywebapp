-- Commission integrity constraints and atomic points increment helper.

-- Prevent duplicate commissions at the database level.
-- The application-level existence check is an optimisation only; this is the guarantee.
DO $$
BEGIN
  -- Only add constraint if it doesn't already exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'uq_commission_order'
      AND table_name = 'sales_agent_commissions'
  ) THEN
    ALTER TABLE sales_agent_commissions
      ADD CONSTRAINT uq_commission_order UNIQUE (order_id);
  END IF;
END $$;

-- Atomic agent-points increment so concurrent award calls cannot cause a lost update.
CREATE OR REPLACE FUNCTION increment_agent_points(p_agent_id uuid, p_amount numeric)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE sales_agents
  SET    points_balance = COALESCE(points_balance, 0) + p_amount
  WHERE  id = p_agent_id;
$$;
