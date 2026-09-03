-- Track abandoned assessment funnels for recovery campaigns
CREATE TABLE IF NOT EXISTS abandoned_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  company VARCHAR(255),
  phone VARCHAR(20),
  
  -- Which step did they complete?
  completed_step INT NOT NULL DEFAULT 1, -- 1, 2, or 3
  
  -- What were they interested in?
  service VARCHAR(100),
  timeline VARCHAR(100),
  business_type VARCHAR(100),
  industry VARCHAR(100),
  project_stage VARCHAR(100),
  project_size VARCHAR(100),
  city VARCHAR(100),
  budget VARCHAR(100),
  current_problem TEXT,
  
  -- Context
  source_context VARCHAR(100),
  user_agent TEXT,
  referrer VARCHAR(255),
  
  -- Timeline
  abandoned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  recovery_email_sent_at TIMESTAMP WITH TIME ZONE,
  recovery_clicked_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'abandoned', -- abandoned, recovered, converted
  recovery_attempts INT DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for recovery email queries
CREATE INDEX IF NOT EXISTS idx_abandoned_assessments_status_email 
  ON abandoned_assessments(status, email);

CREATE INDEX IF NOT EXISTS idx_abandoned_assessments_abandoned_at 
  ON abandoned_assessments(abandoned_at DESC);

-- Enable RLS
ALTER TABLE abandoned_assessments ENABLE ROW LEVEL SECURITY;

-- Public can insert their own abandoned assessment
CREATE POLICY "Users can insert abandoned assessments" ON abandoned_assessments
  FOR INSERT WITH CHECK (true);

-- Admin/sales can read abandoned assessments for recovery
CREATE POLICY "Sales and admin can read abandoned assessments" ON abandoned_assessments
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'authenticated'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'sales_manager', 'sales_executive', 'marketing_manager', 'marketing_executive')
  );

-- Update abandoned status when user completes assessment
CREATE OR REPLACE FUNCTION mark_abandoned_assessment_recovered()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE abandoned_assessments
  SET status = 'converted', updated_at = CURRENT_TIMESTAMP
  WHERE email = NEW.email AND status = 'abandoned';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mark_abandoned_on_contact_message
AFTER INSERT ON contact_messages
FOR EACH ROW
EXECUTE FUNCTION mark_abandoned_assessment_recovered();

COMMENT ON TABLE abandoned_assessments IS 'Tracks assessment funnel abandonment for recovery campaigns';
