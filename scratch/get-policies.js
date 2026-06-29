import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Service Role Key missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('--- POLICIES TABLE ---');
  const { data: policies, error: err1 } = await supabase
    .from('policies')
    .select('*');

  if (err1) {
    console.error('Error fetching policies:', err1);
  } else {
    console.log(JSON.stringify(policies, null, 2));
  }

  console.log('--- PAGE_CONTENT TABLE ---');
  const { data: pageContent, error: err2 } = await supabase
    .from('page_content')
    .select('*')
    .in('key', ['shipping_policy', 'return_policy', 'refund_cancellation_policy']);

  if (err2) {
    console.error('Error fetching page_content:', err2);
  } else {
    console.log(JSON.stringify(pageContent, null, 2));
  }
}

main();
