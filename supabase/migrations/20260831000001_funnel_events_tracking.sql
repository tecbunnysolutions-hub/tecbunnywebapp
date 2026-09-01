-- Comprehensive funnel event tracking for visitor journey attribution
CREATE TABLE IF NOT EXISTS funnel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Session & User
  session_id VARCHAR(100) NOT NULL,
  user_id UUID,
  email VARCHAR(255),
  
  -- Event Details
  event_type VARCHAR(100) NOT NULL, -- assessment_started, assessment_step_completed, assessment_abandoned, assessment_submitted, whatsapp_clicked, phone_clicked, quote_requested, site_survey_requested, resource_downloaded, etc.
  event_data JSONB DEFAULT '{}'::jsonb,
  
  -- Source Attribution
  source VARCHAR(100), -- organic, google_ads, facebook, instagram, linkedin, youtube, whatsapp_direct, direct, industry_page, referral, etc.
  referrer VARCHAR(500),
  user_agent TEXT,
  ip_address VARCHAR(45), -- supports IPv4 and IPv6
  
  -- Timestamps
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_funnel_events_session_id ON funnel_events(session_id);
CREATE INDEX IF NOT EXISTS idx_funnel_events_email ON funnel_events(email);
CREATE INDEX IF NOT EXISTS idx_funnel_events_event_type ON funnel_events(event_type);
CREATE INDEX IF NOT EXISTS idx_funnel_events_source ON funnel_events(source);
CREATE INDEX IF NOT EXISTS idx_funnel_events_occurred_at ON funnel_events(occurred_at DESC);

-- Enable RLS
ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;

-- Public can insert events (anonymous tracking)
CREATE POLICY "Anyone can insert funnel events" ON funnel_events
  FOR INSERT WITH CHECK (true);

-- Admin/sales/marketing can read funnel events for analytics
CREATE POLICY "Sales and analytics teams can read funnel events" ON funnel_events
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'authenticated'
    AND (
      (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN (
        'admin', 'sales_manager', 'sales_executive', 'marketing_manager', 'marketing_executive'
      )
    )
  );

-- Add lead_source column to contact_messages if it doesn't exist
ALTER TABLE contact_messages
ADD COLUMN IF NOT EXISTS lead_source VARCHAR(100);

-- Index for source attribution queries
CREATE INDEX IF NOT EXISTS idx_contact_messages_lead_source 
  ON contact_messages(lead_source);

COMMENT ON TABLE funnel_events IS 'Tracks all visitor interactions in the lead funnel for attribution and conversion analysis';
COMMENT ON COLUMN funnel_events.source IS 'Marketing source attribution for lead quality analysis';
