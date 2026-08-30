-- ============================================================================
-- 20260830000001_add_document_attachment_to_contact_messages.sql
-- Adds document attachment support to contact_messages table for 
-- technology assessment uploads (blueprints, floorplans, BOQ, etc.)
-- ============================================================================

-- Add document_url and document_metadata columns to contact_messages
alter table if exists public.contact_messages 
  add column if not exists document_url text,
  add column if not exists document_filename text,
  add column if not exists document_mime_type text,
  add column if not exists document_size_bytes integer;

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
