-- Gateway settlement is a service-only transaction, never a customer mutation.
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL,
  transaction_id text NOT NULL,
  payment_method text NOT NULL,
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'initiated',
  gateway_response jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- CREATE TABLE IF NOT EXISTS does not upgrade an existing ledger. Older
-- installations may use a different ledger shape. Add the entire settlement
-- contract before creating indexes/functions, without renaming legacy fields or
-- inferring gateway references, order associations, amounts or payment states.
-- Historical rows remain unattributed until reconciled against provider data.
ALTER TABLE public.payment_transactions
  ADD COLUMN IF NOT EXISTS order_id text,
  ADD COLUMN IF NOT EXISTS transaction_id text,
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS amount numeric(14,2),
  ADD COLUMN IF NOT EXISTS status text,
  ADD COLUMN IF NOT EXISTS gateway_response jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz;
-- Defaults apply to future inserts only; do not invent historical states/dates.
ALTER TABLE public.payment_transactions
  ALTER COLUMN status SET DEFAULT 'initiated',
  ALTER COLUMN gateway_response SET DEFAULT '{}'::jsonb,
  ALTER COLUMN created_at SET DEFAULT now();
CREATE UNIQUE INDEX IF NOT EXISTS payment_transactions_gateway_reference
  ON public.payment_transactions (payment_method, transaction_id);
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
REVOKE INSERT, UPDATE, DELETE ON public.payment_transactions FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.payment_transactions TO service_role;

CREATE OR REPLACE FUNCTION public.settle_gateway_payment(
  p_order_id text, p_transaction_id text, p_payment_method text,
  p_status text, p_amount numeric, p_gateway_response jsonb
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_transaction public.payment_transactions%ROWTYPE;
BEGIN
  IF p_status IS NULL OR p_status NOT IN ('success', 'failed')
    OR p_payment_method IS NULL OR p_payment_method NOT IN ('payu', 'cashfree')
    OR p_amount IS NULL OR p_amount <= 0 OR p_amount::text IN ('NaN', 'Infinity', '-Infinity') THEN
    RAISE EXCEPTION 'Invalid settlement';
  END IF;
  -- Lock the order first: different attempts for one order serialize too.
  SELECT * INTO v_order FROM public.orders WHERE id::text = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
  SELECT * INTO v_transaction FROM public.payment_transactions
    WHERE payment_method = p_payment_method AND transaction_id = p_transaction_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Unknown payment transaction'; END IF;
  IF v_transaction.order_id::text IS DISTINCT FROM p_order_id
    OR v_transaction.amount IS NULL OR round(v_transaction.amount::numeric, 2) <> round(p_amount, 2) THEN
    RAISE EXCEPTION 'Payment transaction mismatch';
  END IF;
  IF p_payment_method = 'cashfree' AND (
    p_gateway_response->>'order_id' IS DISTINCT FROM p_transaction_id
    OR p_gateway_response->>'order_currency' IS DISTINCT FROM 'INR'
    OR p_gateway_response->>'order_status' IS DISTINCT FROM 'PAID'
    OR round(v_order.total::numeric, 2) IS DISTINCT FROM round(p_amount, 2)
  ) THEN RAISE EXCEPTION 'Cashfree order mismatch'; END IF;
  IF v_transaction.status = 'success' THEN
    RETURN jsonb_build_object('status', 'success', 'duplicate', true);
  END IF;
  UPDATE public.payment_transactions SET status = p_status,
    gateway_response = coalesce(gateway_response, '{}'::jsonb) || p_gateway_response
    WHERE payment_method = p_payment_method AND transaction_id = p_transaction_id;
  IF p_status = 'success' THEN
    UPDATE public.orders SET payment_status = 'Payment Confirmed', payment_method = p_payment_method,
      status = CASE WHEN lower(coalesce(status::text, '')) IN ('', 'pending', 'placed', 'awaiting payment', 'payment pending', 'payment confirmation pending') THEN 'Payment Confirmed' ELSE status END,
      updated_at = now() WHERE id::text = p_order_id;
  ELSIF lower(coalesce(v_order.payment_status::text, '')) NOT IN ('paid', 'payment confirmed')
    AND NOT EXISTS (SELECT 1 FROM public.payment_transactions WHERE order_id::text = p_order_id AND status = 'success') THEN
    UPDATE public.orders SET payment_status = 'Payment Failed', updated_at = now() WHERE id::text = p_order_id;
  END IF;
  RETURN jsonb_build_object('status', p_status, 'duplicate', false);
END;
$$;
REVOKE ALL ON FUNCTION public.settle_gateway_payment(text, text, text, text, numeric, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_gateway_payment(text, text, text, text, numeric, jsonb) TO service_role;
