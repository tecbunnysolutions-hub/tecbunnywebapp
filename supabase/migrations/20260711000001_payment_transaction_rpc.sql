-- Create an RPC to handle the payment transaction and order update atomically
CREATE OR REPLACE FUNCTION complete_payment_transaction(
    p_order_id UUID,
    p_transaction_id TEXT,
    p_payment_method TEXT,
    p_status TEXT,
    p_gateway_response JSONB,
    p_is_success BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges to ensure atomic update across both tables
AS $$
DECLARE
    v_order_status TEXT;
    v_payment_status TEXT;
    v_updated_transaction RECORD;
BEGIN
    -- 1. Upsert the payment transaction
    INSERT INTO payment_transactions (order_id, transaction_id, payment_method, status, gateway_response, updated_at, created_at)
    VALUES (p_order_id, p_transaction_id, p_payment_method, p_status, p_gateway_response, NOW(), NOW())
    ON CONFLICT (transaction_id) 
    DO UPDATE SET 
        status = EXCLUDED.status,
        gateway_response = EXCLUDED.gateway_response,
        updated_at = EXCLUDED.updated_at
    RETURNING * INTO v_updated_transaction;

    -- 2. Determine order updates
    IF p_is_success THEN
        v_order_status := 'Payment Confirmed';
        v_payment_status := 'Payment Confirmed';
    ELSE
        -- Do not change the overall order status on failure, just the payment status
        v_payment_status := 'Payment Failed';
    END IF;

    -- 3. Update the order
    IF p_is_success THEN
        UPDATE orders
        SET 
            status = v_order_status,
            payment_status = v_payment_status,
            updated_at = NOW()
        WHERE id = p_order_id
          AND status NOT IN ('Cancelled', 'Rejected', 'Completed', 'Delivered');
    ELSE
        UPDATE orders
        SET 
            payment_status = v_payment_status,
            updated_at = NOW()
        WHERE id = p_order_id
          AND status NOT IN ('Cancelled', 'Rejected', 'Completed', 'Delivered');
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'transaction', row_to_json(v_updated_transaction)
    );
EXCEPTION WHEN OTHERS THEN
    -- In Postgres, any unhandled exception rolls back the transaction automatically
    RAISE EXCEPTION 'Payment transaction completion failed: %', SQLERRM;
END;
$$;
