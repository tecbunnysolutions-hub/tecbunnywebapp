-- Link public contact submissions to the canonical CRM lead record.
ALTER TABLE IF EXISTS public.contact_messages
  ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES public.sls_leads(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS lead_source VARCHAR(100),
  ADD COLUMN IF NOT EXISTS lead_priority VARCHAR(50) DEFAULT 'COLD',
  ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_contact_messages_lead_id
  ON public.contact_messages(lead_id)
  WHERE lead_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contact_messages_lead_source
  ON public.contact_messages(lead_source);

CREATE INDEX IF NOT EXISTS idx_contact_messages_lead_priority
  ON public.contact_messages(lead_priority);

CREATE INDEX IF NOT EXISTS idx_contact_messages_lead_score
  ON public.contact_messages(lead_score DESC);
