-- supabase/migrations/20260701200000_create_custom_webhook_tunnel.sql
-- Create table for custom webhook tunnel queue
CREATE TABLE IF NOT EXISTS public.custom_webhook_tunnel_queue (
  id BIGSERIAL PRIMARY KEY,
  target_path TEXT NOT NULL,
  signature TEXT,
  source TEXT,
  payload JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  processed BOOLEAN DEFAULT false NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.custom_webhook_tunnel_queue ENABLE ROW LEVEL SECURITY;

-- Create policy to allow full access for the service role (admin) key
CREATE POLICY "Allow full access to service_role" ON public.custom_webhook_tunnel_queue
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Enable Supabase Realtime for the custom webhook tunnel queue table
BEGIN;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_webhook_tunnel_queue;
EXCEPTION WHEN OTHERS THEN
  -- Fallback if publication doesn't exist or table is already in it
  NULL;
END;
