-- Add campaign halt/stop capability
-- Allows administrators to stop running campaigns immediately

-- Add new columns to mkt_campaigns table
ALTER TABLE IF EXISTS mkt_campaigns
ADD COLUMN IF NOT EXISTS halted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS halted_by UUID,
ADD COLUMN IF NOT EXISTS halted_reason TEXT;

-- Add HALTED status value (PostgreSQL enum extension if needed)
-- Note: If mkt_campaigns.status is not an enum, ensure HALTED is a valid string value

-- Create index for filtering halted campaigns
CREATE INDEX IF NOT EXISTS idx_mkt_campaigns_halted_at
ON mkt_campaigns(halted_at DESC) WHERE halted_at IS NOT NULL;

-- Create index for campaign status filtering
CREATE INDEX IF NOT EXISTS idx_mkt_campaigns_status
ON mkt_campaigns(status);

-- Audit log: record who halted campaigns
-- This helps with compliance and incident investigation
CREATE TABLE IF NOT EXISTS campaign_halt_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES mkt_campaigns(id) ON DELETE CASCADE,
  halted_by UUID,
  halted_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT,
  user_email TEXT,
  ip_address TEXT
);

CREATE INDEX IF NOT EXISTS idx_campaign_halt_audit_campaign_id
ON campaign_halt_audit(campaign_id);

CREATE INDEX IF NOT EXISTS idx_campaign_halt_audit_halted_at
ON campaign_halt_audit(halted_at DESC);

-- Add comment documenting the halt functionality
COMMENT ON COLUMN mkt_campaigns.halted_at IS 'Timestamp when campaign was halted/stopped by administrator';
COMMENT ON COLUMN mkt_campaigns.halted_by IS 'User ID of administrator who halted the campaign';
COMMENT ON COLUMN mkt_campaigns.halted_reason IS 'Reason provided by administrator for halting campaign';
