-- Outbound Event Tracking & Retry System
-- Provides reliable message delivery with automatic retries and dead-letter queue

-- 1. Main outbound events table: tracks every message send attempt
CREATE TABLE IF NOT EXISTS waba_outbound_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference information
  conversation_id UUID,
  lead_id UUID REFERENCES sls_leads(id) ON DELETE SET NULL,
  phone_number TEXT NOT NULL,
  
  -- Message details
  message_type TEXT NOT NULL, -- 'template', 'text', 'media', 'location', 'interactive'
  message_content JSONB NOT NULL, -- Full message payload
  
  -- Retry tracking
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, PROCESSING, DELIVERED, FAILED, DEAD_LETTER
  attempt_count INT NOT NULL DEFAULT 0,
  max_retries INT NOT NULL DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  
  -- Error tracking
  last_error_code TEXT,
  last_error_message TEXT,
  error_history JSONB DEFAULT '[]'::jsonb, -- Array of {attempt, timestamp, error, code}
  
  -- Timing
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  first_attempt_at TIMESTAMPTZ,
  lease_expires_at TIMESTAMPTZ,
  processing_token UUID,
  completed_at TIMESTAMPTZ,
  dead_lettered_at TIMESTAMPTZ,
  
  -- Provider reference
  provider_message_id TEXT, -- Assigned by Infobip or provider
  provider_status TEXT, -- Last known status from provider
  
  -- Metadata for correlation
  correlation_id TEXT,
  idempotency_key TEXT NOT NULL,
  requires_consent BOOLEAN NOT NULL DEFAULT FALSE,
  campaign_id UUID,
  user_id UUID -- User who triggered this send
);

ALTER TABLE waba_outbound_events
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

UPDATE waba_outbound_events
SET idempotency_key = id::TEXT
WHERE idempotency_key IS NULL;

ALTER TABLE waba_outbound_events
  ALTER COLUMN idempotency_key SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_waba_outbound_idempotency_key
ON waba_outbound_events(idempotency_key);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_waba_outbound_status
ON waba_outbound_events(status);

CREATE INDEX IF NOT EXISTS idx_waba_outbound_phone
ON waba_outbound_events(phone_number);

CREATE INDEX IF NOT EXISTS idx_waba_outbound_created_at
ON waba_outbound_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_waba_outbound_next_retry
ON waba_outbound_events(next_retry_at) WHERE status = 'RETRYING';

CREATE INDEX IF NOT EXISTS idx_waba_outbound_dead_letter
ON waba_outbound_events(dead_lettered_at DESC) WHERE status = 'DEAD_LETTER';

CREATE INDEX IF NOT EXISTS idx_waba_outbound_conversation
ON waba_outbound_events(conversation_id) WHERE conversation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_waba_outbound_campaign
ON waba_outbound_events(campaign_id) WHERE campaign_id IS NOT NULL;

ALTER TABLE waba_outbound_events
  ADD COLUMN IF NOT EXISTS lease_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS processing_token UUID,
  ADD COLUMN IF NOT EXISTS requires_consent BOOLEAN NOT NULL DEFAULT FALSE;

-- Claim retry work atomically so multiple worker instances cannot send the same event.
CREATE OR REPLACE FUNCTION claim_waba_outbound_retries(batch_size INT DEFAULT 100)
RETURNS SETOF waba_outbound_events
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE waba_outbound_events
  SET status = 'DEAD_LETTER',
      dead_lettered_at = COALESCE(dead_lettered_at, NOW()),
      lease_expires_at = NULL,
      processing_token = NULL
  WHERE status = 'PROCESSING'
    AND lease_expires_at < NOW()
    AND attempt_count >= max_retries;

  RETURN QUERY
  WITH candidates AS (
    SELECT id
    FROM waba_outbound_events
    WHERE (
      (status = 'RETRYING' AND (next_retry_at IS NULL OR next_retry_at <= NOW()))
      OR (status = 'PENDING' AND next_retry_at IS NOT NULL AND next_retry_at <= NOW())
      OR (status = 'PROCESSING' AND lease_expires_at < NOW() AND attempt_count < max_retries)
    )
    ORDER BY created_at ASC
    LIMIT GREATEST(batch_size, 1)
    FOR UPDATE SKIP LOCKED
  )
  UPDATE waba_outbound_events AS events
    SET status = 'PROCESSING',
      attempt_count = events.attempt_count + 1,
      first_attempt_at = COALESCE(events.first_attempt_at, NOW()),
      lease_expires_at = NOW() + INTERVAL '2 minutes',
      processing_token = gen_random_uuid()
  FROM candidates
  WHERE events.id = candidates.id
  RETURNING events.*;
END;
$$;

-- 2. Dead-Letter Queue view for easy admin access
CREATE OR REPLACE VIEW waba_dead_letter_queue AS
SELECT
  id,
  conversation_id,
  lead_id,
  phone_number,
  message_type,
  status,
  attempt_count,
  last_error_code,
  last_error_message,
  dead_lettered_at,
  correlation_id,
  campaign_id
FROM waba_outbound_events
WHERE status = 'DEAD_LETTER'
ORDER BY dead_lettered_at DESC;

-- 3. Retry History: Detailed audit trail of retries (optional optimization table)
CREATE TABLE IF NOT EXISTS waba_outbound_retry_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES waba_outbound_events(id) ON DELETE CASCADE,
  attempt_number INT NOT NULL,
  status_before TEXT,
  status_after TEXT,
  error_code TEXT,
  error_message TEXT,
  backoff_ms INT, -- How long we waited before this retry
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waba_outbound_retry_event
ON waba_outbound_retry_history(event_id);

CREATE INDEX IF NOT EXISTS idx_waba_outbound_retry_attempted_at
ON waba_outbound_retry_history(attempted_at DESC);

-- 4. Metrics and health checks
CREATE TABLE IF NOT EXISTS waba_outbound_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metric_unit TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tags JSONB -- For filtering by campaign, phone, etc.
);

CREATE INDEX IF NOT EXISTS idx_waba_outbound_metrics_name
ON waba_outbound_metrics(metric_name, timestamp DESC);

-- Comments
COMMENT ON TABLE waba_outbound_events IS 'Tracks all outbound WhatsApp message send attempts with retry and dead-letter tracking';
COMMENT ON COLUMN waba_outbound_events.status IS 'Message status: PENDING (waiting to send), PROCESSING (currently sending), DELIVERED (sent successfully), FAILED (final failure), DEAD_LETTER (exhausted retries)';
COMMENT ON COLUMN waba_outbound_events.attempt_count IS 'Number of send attempts made so far';
COMMENT ON COLUMN waba_outbound_events.error_history IS 'JSON array of all errors encountered during retries';
COMMENT ON TABLE waba_outbound_retry_history IS 'Detailed audit trail of each retry attempt';
COMMENT ON VIEW waba_dead_letter_queue IS 'Easy view for admins to see failed messages that have exhausted retries';
COMMENT ON FUNCTION claim_waba_outbound_retries(INT) IS 'Atomically claims eligible outbound events for retry workers';

CREATE OR REPLACE FUNCTION get_waba_outbound_metrics(window_hours INT DEFAULT 24)
RETURNS TABLE(status TEXT, event_count BIGINT)
LANGUAGE SQL
STABLE
AS $$
  SELECT status, COUNT(*)
  FROM waba_outbound_events
  WHERE created_at >= NOW() - make_interval(hours => GREATEST(window_hours, 1))
  GROUP BY status;
$$;

COMMENT ON FUNCTION get_waba_outbound_metrics(INT) IS 'Returns outbound event counts by status for a time window';
