import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withAuditEvent } from '@tecbunny/core/enterprise-analytics';
import { requireApiRole } from '@tecbunny/core/server-role-guard';
import { getBroadcastQueue } from '@tecbunny/core/queue';
import { getRedis } from '@tecbunny/core/redis';
import crypto from 'crypto';
import { hasBroadcastConsent } from '@/services/consentService';
import { dedupeCampaignRecipients, type CampaignRecipientInput } from '@/lib/campaignRecipients';

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

    const body = await req.json();
    const { targetStatus, templateName, recipients: importedRecipients, offer = '', preview = false } = body;

    if (!targetStatus || !templateName) {
      return NextResponse.json({ error: 'Missing targetStatus or templateName' }, { status: 400 });
    }

    if (importedRecipients !== undefined && (!Array.isArray(importedRecipients) || importedRecipients.length > 5000)) {
      return NextResponse.json({ error: 'Recipients must be an array of at most 5,000 rows.' }, { status: 400 });
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

    const campaignId = crypto.randomUUID();

    let contacts: Array<{ sender_number: string; contact_name: string | null; offer?: string }> = [];
    let invalid = 0;
    let duplicates = 0;

    if (Array.isArray(importedRecipients)) {
      const normalized = dedupeCampaignRecipients(importedRecipients as CampaignRecipientInput[]);
      invalid = normalized.invalid;
      duplicates = normalized.duplicates;
      contacts = normalized.recipients.map((recipient) => ({
        sender_number: recipient.phone,
        contact_name: recipient.name,
        offer: recipient.offer || String(offer).trim(),
      }));
    } else {
      let query = supabase.from('Conversation').select('sender_number, contact_name');
      if (targetStatus !== 'ALL') query = query.eq('status', targetStatus);
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      contacts = data ?? [];
    }

    if (!contacts || contacts.length === 0) {
      return NextResponse.json({ success: true, count: 0, eligible: 0, invalid, duplicates, optedOut: 0, message: 'No eligible contacts found.' });
    }

    const eligibleContacts: typeof contacts = [];
    let optedOut = 0;
    for (const contact of contacts) {
      if (await hasBroadcastConsent(contact.sender_number)) eligibleContacts.push(contact);
      else optedOut++;
    }

    if (preview) {
      return NextResponse.json({
        success: true,
        uploaded: contacts.length + invalid + duplicates,
        eligible: eligibleContacts.length,
        invalid,
        duplicates,
        optedOut,
        sample: eligibleContacts.slice(0, 5).map((contact) => ({
          name: contact.contact_name || contact.sender_number,
          phone: contact.sender_number,
          offer: contact.offer || String(offer).trim(),
        })),
      });
    }

    const queue = getBroadcastQueue();
    if (!queue) {
      return NextResponse.json({ error: 'Broadcast queue is unavailable. Configure Redis before sending campaigns.' }, { status: 503 });
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
      newValue: { campaignId, targetStatus, templateName, matchedContacts: eligibleContacts.length },
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
      for (const contact of eligibleContacts) {
        try {
          const to = contact.sender_number;
          const name = contact.contact_name || to;

          if (!(await hasBroadcastConsent(to))) {
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
              payload: { placeholders: [name, contact.offer || String(offer).trim()] },
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

    return NextResponse.json({ success: true, campaignId, queued: campaignResult.queued, count: campaignResult.queued, skipped: campaignResult.skipped, invalid, duplicates, optedOut });
  } catch (error) {
    console.error('Campaign Error:', error);
    return NextResponse.json({ error: 'Failed to execute campaign' }, { status: 500 });
  }
}
