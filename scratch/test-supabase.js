import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key exists:", !!supabaseAnonKey);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testHttp() {
  try {
    const { data, error } = await supabase.from('upcoming_projects').select('*').limit(1);
    console.log("Response data:", data);
    console.log("Response error:", error);
  } catch (err) {
    console.error("HTTP client failed:", err);
  }
}

testHttp();
