-- Advanced Lead Scoring: ML-based quality prediction
-- Integrates with engagement history, conversion patterns, industry signals

-- 1. Lead Scoring Factors Table: Historical reference for scoring decisions
CREATE TABLE IF NOT EXISTS lead_scoring_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  weight NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  description TEXT,
  category TEXT, -- 'engagement', 'firmographic', 'behavioral', 'temporal'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name)
);

-- 2. Lead Engagement History: Track all touchpoints
CREATE TABLE IF NOT EXISTS lead_engagement_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES sls_leads(id),
  interaction_type TEXT NOT NULL, -- 'site_visit', 'assessment', 'whatsapp_click', 'form_submit', 'call', 'email_open'
  duration_seconds INT,
  engagement_score INT DEFAULT 0,
  source_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_id, interaction_type, created_at)
);

-- 3. Lead Conversion Patterns: Aggregate historical conversions
CREATE TABLE IF NOT EXISTS lead_conversion_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL, -- e.g., 'CCTV', 'Networking', 'Hospital'
  budget_range TEXT NOT NULL, -- e.g., '1-5L', '5-10L', '10L+'
  typical_conversion_days INT,
  typical_touchpoints INT,
  conversion_probability_percent INT,
  avg_deal_value BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(industry, budget_range)
);

-- 4. Advanced Lead Scoring Function: ML-inspired scoring algorithm
CREATE OR REPLACE FUNCTION calculate_advanced_lead_score(
  lead_id UUID
)
RETURNS INT AS $$
DECLARE
  v_lead RECORD;
  v_base_score NUMERIC := 40;
  v_engagement_score NUMERIC := 0;
  v_firmographic_score NUMERIC := 0;
  v_behavioral_score NUMERIC := 0;
  v_temporal_score NUMERIC := 0;
  v_conversion_pattern_score NUMERIC := 0;
  v_final_score INT;
  
  -- Engagement multipliers
  v_site_visits INT;
  v_assessment_complete BOOLEAN;
  v_form_submits INT;
  v_contact_initiated INT;
  v_response_time_hours NUMERIC;
  
  -- Firmographic data
  v_industry TEXT;
  v_budget_estimate NUMERIC;
  v_source_name TEXT;
  
  -- Conversion patterns
  v_pattern RECORD;
  
BEGIN
  -- Fetch lead data
  SELECT * INTO v_lead FROM sls_leads WHERE id = lead_id;
  IF v_lead IS NULL THEN
    RETURN 0;
  END IF;

  -- ============================================
  -- 1. ENGAGEMENT SCORE (0-25 pts)
  -- ============================================
  SELECT COUNT(*) INTO v_site_visits
  FROM lead_engagement_history
  WHERE lead_id = lead_id AND interaction_type = 'site_visit'
    AND created_at > NOW() - INTERVAL '60 days';
  
  v_engagement_score := LEAST(v_site_visits * 2, 8);
  
  SELECT EXISTS(
    SELECT 1 FROM lead_engagement_history
    WHERE lead_id = lead_id AND interaction_type = 'assessment'
  ) INTO v_assessment_complete;
  
  v_engagement_score := v_engagement_score + (CASE WHEN v_assessment_complete THEN 8 ELSE 0 END);
  
  SELECT COUNT(*) INTO v_form_submits
  FROM lead_engagement_history
  WHERE lead_id = lead_id AND interaction_type IN ('form_submit', 'contact_form')
    AND created_at > NOW() - INTERVAL '30 days';
  
  v_engagement_score := v_engagement_score + LEAST(v_form_submits * 3, 9);

  -- ============================================
  -- 2. FIRMOGRAPHIC SCORE (0-20 pts)
  -- Signals: company size, budget, industry vertical
  -- ============================================
  v_source_name := COALESCE(
    (SELECT name FROM sls_lead_sources WHERE id = v_lead.source_id),
    'Direct'
  );
  v_industry := COALESCE(v_lead.industry, v_source_name);
  v_budget_estimate := COALESCE(v_lead.estimated_value, 0);
  
  -- Budget tier score
  IF v_budget_estimate >= 10000000 THEN
    v_firmographic_score := 10;
  ELSIF v_budget_estimate >= 5000000 THEN
    v_firmographic_score := 8;
  ELSIF v_budget_estimate >= 1000000 THEN
    v_firmographic_score := 6;
  ELSIF v_budget_estimate > 0 THEN
    v_firmographic_score := 4;
  END IF;
  
  -- High-value industries bonus
  IF v_industry IN ('Hospital', 'Enterprise', 'Government', 'Banking') THEN
    v_firmographic_score := v_firmographic_score + 8;
  ELSIF v_industry IN ('CCTV', 'Networking', 'SME') THEN
    v_firmographic_score := v_firmographic_score + 5;
  END IF;
  
  v_firmographic_score := LEAST(v_firmographic_score, 20);

  -- ============================================
  -- 3. BEHAVIORAL SCORE (0-20 pts)
  -- Signals: urgency, responsiveness, engagement velocity
  -- ============================================
  
  -- Quick response to contact attempts
  IF v_lead.last_contact_at IS NOT NULL THEN
    v_response_time_hours := EXTRACT(EPOCH FROM (v_lead.last_contact_at - v_lead.created_at)) / 3600;
    IF v_response_time_hours <= 1 THEN
      v_behavioral_score := v_behavioral_score + 10;
    ELSIF v_response_time_hours <= 6 THEN
      v_behavioral_score := v_behavioral_score + 8;
    ELSIF v_response_time_hours <= 24 THEN
      v_behavioral_score := v_behavioral_score + 5;
    END IF;
  END IF;
  
  -- Urgency signals
  IF v_lead.status IN ('hot', 'urgent') THEN
    v_behavioral_score := v_behavioral_score + 7;
  ELSIF v_lead.status = 'warm' THEN
    v_behavioral_score := v_behavioral_score + 4;
  END IF;
  
  v_behavioral_score := LEAST(v_behavioral_score, 20);

  -- ============================================
  -- 4. TEMPORAL SCORE (0-15 pts)
  -- Signals: lead recency, follow-up consistency
  -- ============================================
  
  -- Fresh leads score higher
  IF v_lead.created_at > NOW() - INTERVAL '3 days' THEN
    v_temporal_score := 15;
  ELSIF v_lead.created_at > NOW() - INTERVAL '7 days' THEN
    v_temporal_score := 10;
  ELSIF v_lead.created_at > NOW() - INTERVAL '30 days' THEN
    v_temporal_score := 5;
  ELSE
    v_temporal_score := 1;
  END IF;
  
  -- Penalty for overdue follow-ups (negative impact)
  IF v_lead.next_followup_at < NOW() AND v_lead.status != 'converted' THEN
    v_temporal_score := v_temporal_score - 3;
  END IF;
  
  v_temporal_score := GREATEST(LEAST(v_temporal_score, 15), 0);

  -- ============================================
  -- 5. CONVERSION PATTERN SCORE (0-20 pts)
  -- Historical patterns from similar leads
  -- ============================================
  
  SELECT * INTO v_pattern FROM lead_conversion_patterns
  WHERE industry = v_industry
    AND (
      (v_budget_estimate >= 10000000 AND budget_range = '10L+') OR
      (v_budget_estimate >= 5000000 AND budget_range = '5-10L') OR
      (v_budget_estimate >= 1000000 AND budget_range = '1-5L') OR
      (v_budget_estimate > 0 AND budget_range = '<1L')
    )
  LIMIT 1;
  
  IF v_pattern.id IS NOT NULL THEN
    -- Higher conversion probability = higher score
    v_conversion_pattern_score := (v_pattern.conversion_probability_percent / 5)::INT;
    v_conversion_pattern_score := LEAST(v_conversion_pattern_score, 20);
  END IF;

  -- ============================================
  -- FINAL SCORE CALCULATION
  -- ============================================
  v_final_score := ROUND(
    v_base_score +
    v_engagement_score +
    v_firmographic_score +
    v_behavioral_score +
    v_temporal_score +
    v_conversion_pattern_score
  )::INT;
  
  -- Clamp to 1-100 range
  v_final_score := GREATEST(1, LEAST(v_final_score, 100));
  
  -- Update lead with new score
  UPDATE sls_leads
  SET
    lead_score = v_final_score,
    updated_at = NOW()
  WHERE id = lead_id;
  
  RETURN v_final_score;
END;
$$ LANGUAGE plpgsql;

-- 6. Log Lead Engagement: Record every interaction
CREATE OR REPLACE FUNCTION log_lead_engagement(
  lead_id UUID,
  interaction_type TEXT,
  duration_seconds INT DEFAULT NULL,
  source_url TEXT DEFAULT NULL,
  metadata JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_engagement_score INT := 0;
BEGIN
  -- Map interaction types to engagement scores
  v_engagement_score := CASE interaction_type
    WHEN 'site_visit' THEN 3
    WHEN 'assessment' THEN 15
    WHEN 'form_submit' THEN 12
    WHEN 'whatsapp_click' THEN 8
    WHEN 'call' THEN 10
    WHEN 'email_open' THEN 5
    WHEN 'download' THEN 6
    WHEN 'video_watch' THEN 5
    ELSE 2
  END;
  
  INSERT INTO lead_engagement_history (
    lead_id,
    interaction_type,
    duration_seconds,
    engagement_score,
    source_url,
    metadata
  ) VALUES (
    lead_id,
    interaction_type,
    duration_seconds,
    v_engagement_score,
    source_url,
    metadata
  )
  ON CONFLICT (lead_id, interaction_type, created_at) DO NOTHING;
  
  -- Recalculate lead score after engagement
  PERFORM calculate_advanced_lead_score(lead_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 7. Bulk Score Recalculation (for periodic updates)
CREATE OR REPLACE FUNCTION recalculate_all_lead_scores()
RETURNS TABLE(lead_id UUID, new_score INT, updated_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    calculate_advanced_lead_score(l.id),
    NOW()
  FROM sls_leads l
  WHERE l.deleted_at IS NULL
    AND l.created_at > NOW() - INTERVAL '90 days'
  ORDER BY l.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 8. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lead_engagement_history_lead_id ON lead_engagement_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_engagement_history_type_date ON lead_engagement_history(interaction_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_conversion_patterns_industry_budget ON lead_conversion_patterns(industry, budget_range);

-- 9. Initialize scoring factors
INSERT INTO lead_scoring_factors (name, weight, category, description) VALUES
  ('Site Visits', 1.0, 'engagement', 'Number of visits to product pages'),
  ('Assessment Completion', 2.5, 'engagement', 'Completed qualification assessment'),
  ('Form Submissions', 2.0, 'engagement', 'Contact form or inquiry submissions'),
  ('Industry Vertical', 1.8, 'firmographic', 'High-value industry (hospital, enterprise)'),
  ('Budget Tier', 2.2, 'firmographic', 'Estimated project value'),
  ('Response Time', 1.5, 'behavioral', 'How quickly lead responded'),
  ('Lead Status', 1.3, 'behavioral', 'Current status (hot/warm/cold)'),
  ('Lead Recency', 2.0, 'temporal', 'Days since lead creation'),
  ('Follow-up Timeliness', 1.2, 'temporal', 'Whether follow-ups are on schedule')
ON CONFLICT (name) DO NOTHING;

-- 10. Sample conversion patterns (can be populated from historical data)
INSERT INTO lead_conversion_patterns (industry, budget_range, typical_conversion_days, typical_touchpoints, conversion_probability_percent, avg_deal_value) VALUES
  ('CCTV', '1-5L', 7, 3, 35, 3000000),
  ('CCTV', '5-10L', 10, 4, 45, 7500000),
  ('CCTV', '10L+', 14, 5, 55, 15000000),
  ('Networking', '1-5L', 5, 2, 42, 2500000),
  ('Networking', '5-10L', 8, 3, 52, 7000000),
  ('Hospital', '5-10L', 21, 6, 65, 8000000),
  ('Hospital', '10L+', 28, 7, 72, 18000000),
  ('Enterprise', '10L+', 30, 8, 78, 25000000)
ON CONFLICT (industry, budget_range) DO NOTHING;

GRANT EXECUTE ON FUNCTION calculate_advanced_lead_score TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION log_lead_engagement TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION recalculate_all_lead_scores TO authenticated, service_role;
