-- Storage Security Hardening
-- Migration: 20260621000000_storage_security_hardening.sql

BEGIN;

-- Ensure the images bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies for images bucket to prevent duplicates
DROP POLICY IF EXISTS "Public Read Access on Images Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Staff Manage Access on Images Bucket" ON storage.objects;

-- Create policy to allow public read access to 'images' bucket
CREATE POLICY "Public Read Access on Images Bucket" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'images');

-- Create policy to allow staff to manage (insert, update, delete) items in 'images' bucket
CREATE POLICY "Staff Manage Access on Images Bucket" ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'images' AND public.is_staff_member())
  WITH CHECK (bucket_id = 'images' AND public.is_staff_member());

COMMIT;
