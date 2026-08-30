-- ============================================================================
-- 20260830000001_add_document_attachment_to_contact_messages.sql
-- Adds document attachment support to contact_messages table for 
-- technology assessment uploads (blueprints, floorplans, BOQ, etc.)
-- Also adds lead scoring columns for automatic lead qualification
-- ============================================================================

-- Add document_url and document_metadata columns to contact_messages
alter table if exists public.contact_messages 
  add column if not exists document_url text,
  add column if not exists document_filename text,
  add column if not exists document_mime_type text,
  add column if not exists document_size_bytes integer,
  add column if not exists lead_score integer default 0,
  add column if not exists lead_priority text default 'COLD';

-- Create storage bucket for contact message attachments
insert into storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
values (
  'contact-message-attachments',
  'contact-message-attachments',
  false,
  false,
  10485760, -- 10MB limit
  array['application/pdf', 'image/png', 'image/jpeg', 'image/webp']::text[]
)
on conflict (id) do nothing;

-- Create RLS policy for storage (if not exists - storage doesn't support IF NOT EXISTS for policies)
-- Only authenticated users and service role can upload; anyone cannot read without explicit grant
-- This is handled by service role in the API

-- Index the document fields for faster queries
create index if not exists idx_contact_messages_document_url 
  on public.contact_messages(document_url) 
  where document_url is not null;

create index if not exists idx_contact_messages_document_filename 
  on public.contact_messages(document_filename) 
  where document_filename is not null;

-- Index lead scoring columns for dashboard filtering
create index if not exists idx_contact_messages_lead_priority 
  on public.contact_messages(lead_priority);

create index if not exists idx_contact_messages_lead_score 
  on public.contact_messages(lead_score desc);

-- Create composite index for filtering HOT leads by date
create index if not exists idx_contact_messages_hot_recent 
  on public.contact_messages(created_at desc) 
  where lead_priority = 'HOT';
