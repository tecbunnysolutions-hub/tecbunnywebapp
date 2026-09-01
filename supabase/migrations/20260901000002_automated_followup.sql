-- Automated Follow-up System: Task queue and automation rules

-- 1. Lead Follow-up Tasks Table
CREATE TABLE IF NOT EXISTS lead_followup_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES sls_leads(id),
  assigned_to UUID NOT NULL REFERENCES profiles(id),
  task_type TEXT NOT NULL, -- 'urgent_contact', 'scheduled_call', 'email_sequence', 'drip_campaign', 'quote_followup', 'payment_reminder'
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed', 'cancelled', 'snoozed'
  priority INT DEFAULT 3, -- 1=critical, 2=high, 3=normal, 4=low
  due_at TIMESTAMPTZ NOT NULL,
  scheduled_for TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_reason TEXT,
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  attempt_method TEXT, -- 'whatsapp', 'call', 'email', 'sms', 'manual'
  metadata JSONB,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 2. Follow-up Automation Rules
CREATE TABLE IF NOT EXISTS followup_automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  trigger_event TEXT NOT NULL, -- 'lead_created', 'assessment_completed', 'form_submitted', 'quote_sent', 'payment_failed', 'days_since_contact'
  trigger_condition JSONB, -- e.g., {"days_since": 3, "status": ["warm", "hot"]}
  action_type TEXT NOT NULL, -- 'create_task', 'send_email', 'send_whatsapp', 'assign_lead', 'escalate'
  action_config JSONB, -- e.g., {"template_id": "xyz", "priority": 2}
  is_active BOOLEAN DEFAULT TRUE,
  is_system BOOLEAN DEFAULT FALSE,
  priority INT DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Follow-up Communication Log
CREATE TABLE IF NOT EXISTS followup_communication_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES sls_leads(id),
  task_id UUID REFERENCES lead_followup_tasks(id),
  communication_type TEXT NOT NULL, -- 'whatsapp', 'call', 'email', 'sms'
  status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'read', 'bounced', 'failed'
  recipient TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  external_id TEXT, -- for tracking with third-party services
  metadata JSONB,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  response_received_at TIMESTAMPTZ,
  response_text TEXT
);

-- 4. Create automatic follow-up tasks based on lead lifecycle
CREATE OR REPLACE FUNCTION create_lead_followup_tasks(
  lead_id UUID,
  trigger_event TEXT DEFAULT 'lead_created'
)
RETURNS TABLE(task_id UUID, task_type TEXT) AS $$
DECLARE
  v_lead RECORD;
  v_rules RECORD;
  v_assigned_to UUID;
  v_task_id UUID;
BEGIN
  -- Fetch lead data
  SELECT * INTO v_lead FROM sls_leads WHERE id = lead_id AND deleted_at IS NULL;
  IF v_lead IS NULL THEN
    RETURN;
  END IF;
  
  -- Get assigned sales person (or assign to first available)
  SELECT assigned_to INTO v_assigned_to FROM sls_lead_assignments
  WHERE lead_id = lead_id AND deleted_at IS NULL
  LIMIT 1;
  
  IF v_assigned_to IS NULL THEN
    SELECT id INTO v_assigned_to FROM profiles
    WHERE role = 'sales_agent' AND org_id = v_lead.org_id
    LIMIT 1;
  END IF;
  
  IF v_assigned_to IS NULL THEN
    RETURN;
  END IF;
  
  -- Loop through applicable automation rules
  FOR v_rules IN
    SELECT * FROM followup_automation_rules
    WHERE is_active = TRUE
      AND trigger_event = trigger_event
      AND (trigger_condition IS NULL OR
           (trigger_condition->>'status' LIKE '%' || v_lead.status || '%'))
  LOOP
    -- Create task based on rule action
    IF v_rules.action_type = 'create_task' THEN
      INSERT INTO lead_followup_tasks (
        lead_id,
        assigned_to,
        task_type,
        title,
        description,
        priority,
        due_at,
        attempt_method,
        metadata,
        created_by
      ) VALUES (
        lead_id,
        v_assigned_to,
        COALESCE(v_rules.action_config->>'task_type', 'contact'),
        COALESCE(v_rules.action_config->>'title', v_rules.name),
        v_rules.description,
        COALESCE((v_rules.action_config->>'priority')::INT, v_rules.priority),
        NOW() + (COALESCE(v_rules.action_config->>'hours_delay', '2')::INT || ' hours')::INTERVAL,
        COALESCE(v_rules.action_config->>'method', 'whatsapp'),
        v_rules.action_config,
        v_assigned_to
      )
      RETURNING id INTO v_task_id;
      
      RETURN QUERY SELECT v_task_id, COALESCE(v_rules.action_config->>'task_type', 'contact')::TEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 5. Mark follow-up task as completed
CREATE OR REPLACE FUNCTION complete_followup_task(
  task_id UUID,
  notes TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
  v_task RECORD;
BEGIN
  SELECT * INTO v_task FROM lead_followup_tasks WHERE id = task_id;
  
  IF v_task IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Task not found';
    RETURN;
  END IF;
  
  UPDATE lead_followup_tasks
  SET
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = task_id;
  
  -- Update lead's last_contact_at if applicable
  UPDATE sls_leads
  SET last_contact_at = NOW()
  WHERE id = v_task.lead_id;
  
  -- Trigger next automation rules if configured
  PERFORM create_lead_followup_tasks(v_task.lead_id, 'contact_completed');
  
  RETURN QUERY SELECT TRUE, 'Task completed successfully';
END;
$$ LANGUAGE plpgsql;

-- 6. Snooze a follow-up task (temporarily defer)
CREATE OR REPLACE FUNCTION snooze_followup_task(
  task_id UUID,
  snooze_hours INT DEFAULT 24
)
RETURNS TABLE(success BOOLEAN, new_due_at TIMESTAMPTZ) AS $$
DECLARE
  v_new_due_at TIMESTAMPTZ;
BEGIN
  v_new_due_at := NOW() + (snooze_hours || ' hours')::INTERVAL;
  
  UPDATE lead_followup_tasks
  SET
    status = 'snoozed',
    due_at = v_new_due_at,
    updated_at = NOW()
  WHERE id = task_id;
  
  RETURN QUERY SELECT TRUE, v_new_due_at;
END;
$$ LANGUAGE plpgsql;

-- 7. Get pending tasks for a sales person
CREATE OR REPLACE FUNCTION get_pending_followup_tasks(
  sales_person_id UUID,
  include_overdue BOOLEAN DEFAULT TRUE
)
RETURNS TABLE(
  id UUID,
  lead_id UUID,
  lead_name TEXT,
  company TEXT,
  task_type TEXT,
  title TEXT,
  due_at TIMESTAMPTZ,
  priority INT,
  is_overdue BOOLEAN,
  attempt_method TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.lead_id,
    l.name,
    l.company,
    t.task_type,
    t.title,
    t.due_at,
    t.priority,
    (t.due_at < NOW())::BOOLEAN,
    t.attempt_method
  FROM lead_followup_tasks t
  LEFT JOIN sls_leads l ON t.lead_id = l.id
  WHERE t.assigned_to = sales_person_id
    AND t.status IN ('pending', 'snoozed')
    AND t.deleted_at IS NULL
    AND (NOT include_overdue OR t.due_at <= NOW() + INTERVAL '1 day')
  ORDER BY
    CASE WHEN t.due_at < NOW() THEN 0 ELSE 1 END,
    t.priority,
    t.due_at ASC;
END;
$$ LANGUAGE plpgsql;

-- 8. Initialize default automation rules
INSERT INTO followup_automation_rules (name, trigger_event, action_type, action_config, is_system, priority) VALUES
  (
    'Immediate Hot Lead Contact',
    'lead_created',
    'create_task',
    '{"task_type": "urgent_contact", "title": "Contact HOT lead immediately", "hours_delay": 0, "method": "whatsapp", "priority": 1}',
    TRUE,
    1
  ),
  (
    'Assessment Complete Follow-up',
    'assessment_completed',
    'create_task',
    '{"task_type": "scheduled_call", "title": "Call to discuss assessment results", "hours_delay": 2, "method": "call", "priority": 2}',
    TRUE,
    2
  ),
  (
    '24h Post-Quote Follow-up',
    'quote_sent',
    'create_task',
    '{"task_type": "quote_followup", "title": "Follow up on sent quote", "hours_delay": 24, "method": "whatsapp", "priority": 2}',
    TRUE,
    2
  ),
  (
    '3 Days Without Contact',
    'days_since_contact',
    'create_task',
    '{"task_type": "scheduled_call", "title": "Check in with warm lead", "days_since": 3, "method": "whatsapp", "priority": 3}',
    TRUE,
    3
  ),
  (
    'Payment Reminder',
    'payment_failed',
    'create_task',
    '{"task_type": "payment_reminder", "title": "Follow up on payment", "hours_delay": 1, "method": "email", "priority": 1}',
    TRUE,
    1
  )
ON CONFLICT (name) DO NOTHING;

-- 9. Indexes
CREATE INDEX IF NOT EXISTS idx_lead_followup_tasks_assigned_to ON lead_followup_tasks(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lead_followup_tasks_lead_id ON lead_followup_tasks(lead_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lead_followup_tasks_status_due ON lead_followup_tasks(status, due_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_followup_communication_log_lead_id ON followup_communication_log(lead_id);

-- Grants
GRANT EXECUTE ON FUNCTION create_lead_followup_tasks TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION complete_followup_task TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION snooze_followup_task TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_pending_followup_tasks TO authenticated, service_role;
