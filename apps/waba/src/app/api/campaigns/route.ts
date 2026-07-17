import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendTemplateMessage } from '@/services/infobipService';
import { requireApiRole } from '@tecbunny/core/server-role-guard';
import { getRedis } from '@tecbunny/core/redis';
import crypto from 'crypto';

const BROADCAST_PER_RECIPIENT_TTL_SECS = 86_400; // 24 h — prevent same number twice in one day

/**
 * Returns true if the phone number is allowed to receive a broadcast today.
 * Marks the number as sent when allowed.
 */
async function checkAndMarkBroadcastQuota(phone: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return true; // fallback: allow if Redis unavailable
  const key = `waba_broadcast:${phone}`;
  // NX = only set if not exists, EX = TTL in seconds
  const result = await redis.set(key, '1', 'EX', BROADCAST_PER_RECIPIENT_TTL_SECS, 'NX');
  // result is 'OK' when key was set (first broadcast today), null when key already existed
  return result === 'OK';
}

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const auth = await requireApiRole({ allowedRoles: ['admin', 'sales_manager', 'marketing_manager', 'superadmin', 'manager'] });
    if (auth.error) return auth.error;

    const { targetStatus, templateName } = await req.json();

    if (!targetStatus || !templateName) {
      return NextResponse.json({ error: 'Missing targetStatus or templateName' }, { status: 400 });
    }

    // Find all conversations matching the target status
    let query = supabase.from('Conversation').select('sender_number, contact_name');
    
    if (targetStatus !== 'ALL') {
      query = query.eq('status', targetStatus);
    }

    const { data: contacts, error: fetchError } = await query;
    if (fetchError) throw fetchError;

    if (!contacts || contacts.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'No contacts found for this audience.' });
    }

    // In a real production system with thousands of contacts, 
    // you would use a background job/queue here (like BullMQ or Inngest).
    // For MVP, we will iterate and send them asynchronously in batches.
    
    let successCount = 0;
    let skippedCount = 0;
    
    // Broadcast the template to everyone — per-recipient rate limit (1 per 24h)
    for (const contact of contacts) {
      try {
        const to = contact.sender_number;
        const name = contact.contact_name || to;

        // Guard: skip if this number already received a broadcast today
        const allowed = await checkAndMarkBroadcastQuota(to);
        if (!allowed) {
          skippedCount++;
          continue;
        }
        
        // Use the Infobip Template API
        // For MVP we just use the hardcoded 'registration_confirmation' 
        // with the user's name as the placeholder.
        await sendTemplateMessage(to, templateName, [name]);
        
        // Log the outbound message to the database
        await supabase
          .from('Message')
          .insert({
            id: crypto.randomUUID(),
            sender_number: to,
            direction: 'OUTBOUND',
            message_content: `[Campaign Template Sent: ${templateName}]`,
            timestamp: new Date().toISOString(),
            status: 'SENT'
          });
          
        successCount++;
      } catch (err) {
        console.error(`Failed to send campaign message to ${contact.sender_number}:`, err);
      }
    }

    return NextResponse.json({ success: true, count: successCount, skipped: skippedCount });
  } catch (error) {
    console.error('Campaign Error:', error);
    return NextResponse.json({ error: 'Failed to execute campaign' }, { status: 500 });
  }
}
