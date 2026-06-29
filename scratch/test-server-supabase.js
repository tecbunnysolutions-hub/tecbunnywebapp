import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testClients() {
  console.log("Supabase URL:", url);

  // 1. Test Anon Client
  console.log("\nTesting with ANON KEY...");
  try {
    const anonClient = createClient(url, anonKey);
    const { data, error } = await anonClient.from('upcoming_projects').select('*');
    if (error) {
      console.log("Anon Client Error:", error);
    } else {
      console.log("Anon Client Success! Data length:", data.length);
    }
  } catch (e) {
    console.error("Anon client exception:", e);
  }

  // 2. Test Service Client
  console.log("\nTesting with SERVICE ROLE KEY...");
  try {
    const serviceClient = createClient(url, serviceKey);
    const { data, error } = await serviceClient.from('upcoming_projects').select('*');
    if (error) {
      console.log("Service Client Error:", error);
    } else {
      console.log("Service Client Success! Data length:", data.length);
    }
  } catch (e) {
    console.error("Service client exception:", e);
  }
}

testClients();
