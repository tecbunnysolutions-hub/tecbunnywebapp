-- Lead Command Center Optimization: Database Functions for Metrics
-- Replaces client-side 5K row aggregation with efficient server-side queries

-- 1. Executive Metrics: Revenue aggregation
CREATE OR REPLACE FUNCTION get_dashboard_revenue_metrics(
  days_back INT DEFAULT 30,
  org_id_filter UUID DEFAULT NULL
)
RETURNS TABLE(
  paid_revenue BIGINT,
  pending_revenue BIGINT,
  today_revenue BIGINT,
  yesterday_revenue BIGINT,
  week_revenue BIGINT,
  payment_count INT,
  paid_count INT,
  pending_count INT
) AS $$
BEGIN
  RETURN QUERY
  WITH period_orders AS (
    SELECT 
      COALESCE(total_amount, total, 0)::BIGINT as amount,
      payment_status,
      created_at,
      DATE(created_at) as order_date
    FROM orders
    WHERE deleted_at IS NULL
      AND created_at >= NOW() - (days_back || ' days')::INTERVAL
      AND (org_id_filter IS NULL OR company_id = org_id_filter)
  )
  SELECT
    SUM(amount) FILTER (WHERE payment_status IN ('PAID', 'SUCCESS', 'CAPTURED', 'COMPLETED', 'PAYMENT RECEIVED', 'RECEIVED'))::BIGINT,
    SUM(amount) FILTER (WHERE payment_status IN ('PENDING', 'UNPAID', 'PROCESSING', 'AWAITING PAYMENT', 'AWAITING'))::BIGINT,
    SUM(amount) FILTER (WHERE DATE(created_at) = CURRENT_DATE)::BIGINT,
    SUM(amount) FILTER (WHERE DATE(created_at) = CURRENT_DATE - 1)::BIGINT,
    SUM(amount) FILTER (WHERE created_at >= DATE_TRUNC('week', NOW()))::BIGINT,
    COUNT(*)::INT,
    COUNT(*) FILTER (WHERE payment_status IN ('PAID', 'SUCCESS', 'CAPTURED', 'COMPLETED', 'PAYMENT RECEIVED', 'RECEIVED'))::INT,
    COUNT(*) FILTER (WHERE payment_status IN ('PENDING', 'UNPAID', 'PROCESSING', 'AWAITING PAYMENT', 'AWAITING'))::INT
  FROM period_orders;
END;
$$ LANGUAGE plpgsql STABLE;

-- 2. Lead Metrics: Lead status and quality
CREATE OR REPLACE FUNCTION get_dashboard_lead_metrics(
  days_back INT DEFAULT 7,
  org_id_filter UUID DEFAULT NULL
)
RETURNS TABLE(
  total_leads INT,
  hot_leads INT,
  warm_leads INT,
  cold_leads INT,
  avg_lead_score NUMERIC,
  converted_leads INT,
  pending_followup INT,
  today_leads INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INT,
    COUNT(*) FILTER (WHERE lead_score >= 75)::INT,
    COUNT(*) FILTER (WHERE lead_score >= 50 AND lead_score < 75)::INT,
    COUNT(*) FILTER (WHERE lead_score < 50)::INT,
    ROUND(AVG(lead_score)::NUMERIC, 1),
    COUNT(*) FILTER (WHERE status = 'converted')::INT,
    COUNT(*) FILTER (WHERE status IN ('pending', 'warm', 'hot') AND next_followup_at <= NOW())::INT,
    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE)::INT
  FROM sls_leads
  WHERE deleted_at IS NULL
    AND (org_id_filter IS NULL OR org_id = org_id_filter);
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. Order Trends: Daily aggregation for chart
CREATE OR REPLACE FUNCTION get_dashboard_order_trend(
  days INT DEFAULT 30,
  org_id_filter UUID DEFAULT NULL
)
RETURNS TABLE(
  order_date DATE,
  order_count INT,
  order_value BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(o.created_at) as order_date,
    COUNT(*)::INT,
    SUM(COALESCE(o.total_amount, o.total, 0))::BIGINT
  FROM orders o
  WHERE o.deleted_at IS NULL
    AND o.created_at >= NOW() - (days || ' days')::INTERVAL
    AND (org_id_filter IS NULL OR o.company_id = org_id_filter)
  GROUP BY DATE(o.created_at)
  ORDER BY order_date DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- 4. Lead Source Performance: Attribution and conversion by source
CREATE OR REPLACE FUNCTION get_dashboard_lead_source_performance(
  org_id_filter UUID DEFAULT NULL
)
RETURNS TABLE(
  source TEXT,
  total_leads INT,
  hot_leads INT,
  warm_leads INT,
  cold_leads INT,
  avg_score NUMERIC,
  conversion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH lead_data AS (
    SELECT
      COALESCE(ls.name, 'Direct') as source,
      COUNT(DISTINCT l.id) as total,
      COUNT(DISTINCT l.id) FILTER (WHERE l.lead_score >= 75) as hot_count,
      COUNT(DISTINCT l.id) FILTER (WHERE l.lead_score >= 50 AND l.lead_score < 75) as warm_count,
      COUNT(DISTINCT l.id) FILTER (WHERE l.lead_score < 50) as cold_count,
      COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'converted') as converted,
      AVG(l.lead_score) as avg_score
    FROM sls_leads l
    LEFT JOIN sls_lead_sources ls ON l.lead_source_id = ls.id
    WHERE l.deleted_at IS NULL
      AND (org_id_filter IS NULL OR l.org_id = org_id_filter)
    GROUP BY ls.name
  )
  SELECT
    source,
    total::INT,
    hot_count::INT,
    warm_count::INT,
    cold_count::INT,
    ROUND(avg_score::NUMERIC, 1),
    CASE 
      WHEN total > 0 THEN ROUND((converted::NUMERIC / total * 100), 1)
      ELSE 0
    END
  FROM lead_data
  ORDER BY total DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- 5. Lead Assignment Status: Monitor workload distribution
CREATE OR REPLACE FUNCTION get_dashboard_lead_assignment_status(
  org_id_filter UUID DEFAULT NULL
)
RETURNS TABLE(
  assigned_to UUID,
  assigned_to_name TEXT,
  total_assigned INT,
  hot_leads INT,
  warm_leads INT,
  cold_leads INT,
  converted INT,
  pending_followup INT
) AS $$
BEGIN
  RETURN QUERY
  WITH lead_assignments AS (
    SELECT
      a.assigned_to,
      COALESCE(u.full_name, u.name, 'Unassigned') as assigned_to_name,
      COUNT(DISTINCT l.id) as total,
      COUNT(DISTINCT l.id) FILTER (WHERE l.lead_score >= 75) as hot_count,
      COUNT(DISTINCT l.id) FILTER (WHERE l.lead_score >= 50 AND l.lead_score < 75) as warm_count,
      COUNT(DISTINCT l.id) FILTER (WHERE l.lead_score < 50) as cold_count,
      COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'converted') as converted,
      COUNT(DISTINCT l.id) FILTER (WHERE l.status IN ('pending', 'warm', 'hot') AND l.next_followup_at <= NOW()) as pending
    FROM sls_lead_assignments a
    LEFT JOIN sls_leads l ON a.lead_id = l.id AND l.deleted_at IS NULL
    LEFT JOIN profiles u ON a.assigned_to = u.id
    WHERE a.deleted_at IS NULL
      AND (org_id_filter IS NULL OR l.org_id = org_id_filter)
    GROUP BY a.assigned_to, assigned_to_name
  )
  SELECT * FROM lead_assignments
  ORDER BY total_assigned DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- 6. Hot Leads: Priority follow-up queue
CREATE OR REPLACE FUNCTION get_hot_leads_priority_queue(
  limit_rows INT DEFAULT 20,
  org_id_filter UUID DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  company TEXT,
  estimated_value BIGINT,
  lead_score INT,
  source TEXT,
  assigned_to_name TEXT,
  last_contact_at TIMESTAMP,
  next_followup_at TIMESTAMP,
  status TEXT,
  contact_method TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.name,
    l.company,
    COALESCE(l.estimated_value, 0)::BIGINT,
    l.lead_score,
    COALESCE(ls.name, 'Direct'),
    COALESCE(u.full_name, u.name, 'Unassigned'),
    l.last_contact_at,
    l.next_followup_at,
    l.status,
    l.contact_method
  FROM sls_leads l
  LEFT JOIN sls_lead_sources ls ON l.lead_source_id = ls.id
  LEFT JOIN sls_lead_assignments a ON l.id = a.lead_id AND a.deleted_at IS NULL
  LEFT JOIN profiles u ON a.assigned_to = u.id
  WHERE l.deleted_at IS NULL
    AND l.lead_score >= 75
    AND (org_id_filter IS NULL OR l.org_id = org_id_filter)
  ORDER BY 
    CASE WHEN l.next_followup_at <= NOW() THEN 0 ELSE 1 END,
    l.next_followup_at ASC,
    l.lead_score DESC
  LIMIT limit_rows;
END;
$$ LANGUAGE plpgsql STABLE;

-- 7. Lead Scoring: Recalculate scores based on engagement
CREATE OR REPLACE FUNCTION recalculate_lead_score(lead_id UUID)
RETURNS INT AS $$
DECLARE
  v_base_score INT := 40; -- Base score for all leads
  v_engagement INT := 0;
  v_conversion_signals INT := 0;
  v_time_decay NUMERIC := 1.0;
  v_final_score INT;
BEGIN
  -- Assessment quality signals (0-20 pts)
  SELECT COALESCE(COUNT(*), 0) INTO v_engagement
  FROM sls_visitor_tracking
  WHERE lead_id = lead_id AND visited_at > NOW() - INTERVAL '30 days';
  
  v_engagement := LEAST(v_engagement * 2, 20);
  
  -- Conversion signals (0-20 pts): responses, interactions, site time
  SELECT COALESCE(COUNT(DISTINCT interaction_type), 0) INTO v_conversion_signals
  FROM (
    SELECT 'contact_form_submit' as interaction_type FROM inquiries WHERE created_at > NOW() - INTERVAL '7 days' UNION
    SELECT 'whatsapp_click' FROM sls_leads WHERE id = lead_id AND last_contact_at IS NOT NULL UNION
    SELECT 'assessment_complete' FROM sls_leads WHERE id = lead_id AND assessment_responses IS NOT NULL
  ) t;
  
  v_conversion_signals := LEAST(v_conversion_signals * 5, 20);
  
  -- Time decay: older leads decay slightly
  SELECT EXTRACT(EPOCH FROM (NOW() - created_at)) / (30 * 86400) INTO v_time_decay
  FROM sls_leads
  WHERE id = lead_id;
  
  v_time_decay := GREATEST(1.0 - (v_time_decay * 0.02), 0.7);
  
  v_final_score := GREATEST(10, LEAST(100, 
    ROUND((v_base_score + v_engagement + v_conversion_signals) * v_time_decay)
  ));
  
  UPDATE sls_leads SET lead_score = v_final_score WHERE id = lead_id;
  RETURN v_final_score;
END;
$$ LANGUAGE plpgsql;

-- 8. Index for performance: frequently filtered columns
CREATE INDEX IF NOT EXISTS idx_sls_leads_score_status ON sls_leads(lead_score, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sls_leads_source_org ON sls_leads(source, org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sls_lead_assignments_assigned_to ON sls_lead_assignments(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_payment_status_date ON orders(payment_status, created_at DESC) WHERE deleted_at IS NULL;

-- Grant access to anon/authenticated for readonly queries
GRANT EXECUTE ON FUNCTION get_dashboard_revenue_metrics TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_lead_metrics TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_order_trend TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_lead_source_performance TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_lead_assignment_status TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_hot_leads_priority_queue TO anon, authenticated;
GRANT EXECUTE ON FUNCTION recalculate_lead_score TO authenticated, service_role;
