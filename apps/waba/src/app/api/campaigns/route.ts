import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withAuditEvent } from '@tecbunny/core/enterprise-analytics';
import { requireApiRole } from '@tecbunny/core/server-role-guard';
import { getBroadcastQueue } from '@tecbunny/core/queue';
import { getRedis } from '@tecbunny/core/redis';
import crypto from 'crypto';
import { hasBroadcastConsent } from '@/services/consentService';

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

    const { data: template, error: templateError } = await supabase
      .from('Template')
      .select('name, status, provider_status')
      .eq('name', templateName)
      .maybeSingle();

    if (templateError) throw templateError;
    if (!template || template.status !== 'APPROVED' || template.provider_status !== 'APPROVED') {
      return NextResponse.json({ error: 'Template must be approved by the provider before broadcast.' }, { status: 400 });
    }

    const queue = getBroadcastQueue();
    if (!queue) {
      return NextResponse.json({ error: 'Broadcast queue is unavailable. Configure Redis before sending campaigns.' }, { status: 503 });
    }

    const campaignId = crypto.randomUUID();

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

    const campaignResult = await withAuditEvent({
      application: 'waba',
      module: 'campaigns',
      screen: '/api/campaigns',
      action: 'whatsapp_campaign_broadcast',
      description: `Queued WhatsApp campaign ${campaignId} using template ${templateName}`,
      entityType: 'mkt_campaign',
      entityId: campaignId,
      oldValue: null,
      newValue: { campaignId, targetStatus, templateName, matchedContacts: contacts.length },
      reason: 'waba_campaign_broadcast',
      context: { userId: auth.session?.user?.id, userEmail: auth.session?.user?.email, role: auth.role },
      apiEndpoint: '/api/campaigns',
      httpMethod: 'POST',
      databaseTable: 'mkt_campaigns',
      priority: 'critical',
    }, async () => {
      await supabase.from('mkt_campaigns').insert({
        id: campaignId,
        name: `WABA ${templateName} ${new Date().toISOString()}`,
        status: 'RUNNING',
        created_by: auth.session?.user?.id,
      }).then(({ error }) => {
        if (error) console.warn('Failed to create campaign record:', error.message);
      });

      let queuedCount = 0;
      let skippedCount = 0;

      // Broadcast the template to everyone — per-recipient rate limit (1 per 24h)
      for (const contact of contacts) {
        try {
          const to = contact.sender_number;
          const name = contact.contact_name || to;

          const hasConsent = await hasBroadcastConsent(to);
          if (!hasConsent) {
            skippedCount++;
            continue;
          }

          // Guard: skip if this number already received a broadcast today
          const allowed = await checkAndMarkBroadcastQuota(to);
          if (!allowed) {
            skippedCount++;
            continue;
          }
          
          await queue.add(
            'send-template',
            {
              campaign_id: campaignId,
              phone: to,
              template_name: templateName,
              language: 'en',
              payload: { placeholders: [name] },
            },
            { jobId: `${campaignId}:${to}` },
          );
          queuedCount++;
        } catch (err) {
          console.error(`Failed to queue campaign message to ${contact.sender_number}:`, err);
        }
      }

      if (queuedCount === 0) {
        await supabase.from('mkt_campaigns').update({ status: 'COMPLETED' }).eq('id', campaignId).then(({ error }) => {
          if (error) console.warn('Failed to close empty campaign record:', error.message);
        });
      }

      return { queued: queuedCount, skipped: skippedCount };
    });

    return NextResponse.json({ success: true, campaignId, queued: campaignResult.queued, count: campaignResult.queued, skipped: campaignResult.skipped });
  } catch (error) {
    console.error('Campaign Error:', error);
    return NextResponse.json({ error: 'Failed to execute campaign' }, { status: 500 });
  }
}
