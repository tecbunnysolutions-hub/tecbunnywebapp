import { createClient } from '@supabase/supabase-js';

// Internal service client that bypasses RLS for backend tasks
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);
