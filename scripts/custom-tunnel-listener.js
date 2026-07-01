// scripts/custom-tunnel-listener.js
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load local environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const PORT = 9003;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Supabase credentials (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) missing in .env.local.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

console.log('-----------------------------------------------------------');
console.log('🐰 TecBunny Self-Hosted CUSTOM Webhook Tunnel Listener 🐰');
console.log(`Supabase Project URL: ${SUPABASE_URL}`);
console.log(`Local Base URL:      http://localhost:${PORT}/api/webhooks/`);
console.log('-----------------------------------------------------------');
console.log('Connecting to Supabase Realtime channel...');

const channel = supabase
  .channel('custom_webhook_tunnel_channel')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'custom_webhook_tunnel_queue'
    },
    async (payload) => {
      const { id, target_path, signature, source, payload: eventData } = payload.new;
      const targetUrl = `http://localhost:${PORT}/api/webhooks/${target_path}`;
      
      console.log(`\n⚡ [${new Date().toLocaleTimeString()}] Intercepted webhook for subpath: "/api/webhooks/${target_path}"`);
      console.log(`Forwarding to ${targetUrl} ...`);

      try {
        const headers = {
          'Content-Type': 'application/json',
          'x-correlation-id': `custom_tunnel_fwd_${Date.now()}`
        };

        if (signature) {
          headers['x-webhook-signature'] = signature;
          headers['stripe-signature'] = signature; // Compatibility fallback
        }
        if (source) {
          headers['x-webhook-source'] = source;
        }

        const res = await fetch(targetUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(eventData)
        });

        const resText = await res.text();
        console.log(`Forward Response: ${res.status} ${res.statusText}`);
        if (resText) {
          console.log(`Forward Details: ${resText.substring(0, 500)}`);
        }

        if (res.ok) {
          console.log(`✅ Webhook processed successfully locally. Cleaning queue item #${id}...`);
          const { error } = await supabase
            .from('custom_webhook_tunnel_queue')
            .delete()
            .eq('id', id);

          if (error) {
            console.error(`⚠️ Failed to clean up queue item #${id}:`, error.message);
          } else {
            console.log(`🧹 Queue item #${id} deleted successfully.`);
          }
        } else {
          console.error(`❌ Local webhook returned error status. Row #${id} kept in DB for inspection.`);
        }
      } catch (err) {
        console.error('❌ Failed to forward event to localhost:', err.message);
      }
    }
  )
  .subscribe((status, error) => {
    if (error) {
      console.error('❌ Realtime connection error:', error.message);
    } else {
      console.log(`📡 Subscription Status: ${status}`);
      if (status === 'SUBSCRIBED') {
        console.log('🟢 Listener is active! Waiting for events...');
      }
    }
  });

// Handle graceful termination
process.on('SIGINT', () => {
  console.log('\nStopping Tunnel Listener...');
  channel.unsubscribe();
  process.exit(0);
});
