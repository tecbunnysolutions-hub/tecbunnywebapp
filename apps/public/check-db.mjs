import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: msgs } = await supabase.from('whatsapp_messages').select('*').limit(5);
  console.log('Messages:', msgs);
  const { data: contacts } = await supabase.from('whatsapp_contacts').select('*').limit(5);
  console.log('Contacts:', contacts);
}
check();
