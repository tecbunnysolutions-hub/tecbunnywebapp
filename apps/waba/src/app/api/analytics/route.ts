import { NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';
import { requireApiRole } from '@tecbunny/core/server-role-guard';

export const dynamic = 'force-dynamic';

async function safeCount(query: PromiseLike<{ count: number | null; error: { message?: string } | null }>, label: string) {
  const { count, error } = await query;
  if (error) {
    console.warn('[WABA analytics] Count failed', { label, error: error.message });
    return 0;
  }
  return count ?? 0;
}

async function safeRows<T>(query: PromiseLike<{ data: T[] | null; error: { message?: string } | null }>, label: string) {
  const { data, error } = await query;
  if (error) {
    console.warn('[WABA analytics] Rows failed', { label, error: error.message });
    return [];
  }
  return data ?? [];
}

export async function GET() {
  const auth = await requireApiRole({ allowedRoles: ['admin', 'sales_manager', 'marketing_manager', 'superadmin', 'manager'] });
  if (auth.error) return auth.error;

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const since = startOfDay.toISOString();

  const [messagesToday, inboundToday, outboundToday, delivered, read, failed, optedIn, optedOut, recentCampaigns, recentEvents] = await Promise.all([
    safeCount(supabase.from('Message').select('*', { count: 'exact', head: true }).gte('timestamp', since), 'messages_today'),
    safeCount(supabase.from('Message').select('*', { count: 'exact', head: true }).eq('direction', 'INBOUND').gte('timestamp', since), 'inbound_today'),
    safeCount(supabase.from('Message').select('*', { count: 'exact', head: true }).eq('direction', 'OUTBOUND').gte('timestamp', since), 'outbound_today'),
    safeCount(supabase.from('Message').select('*', { count: 'exact', head: true }).eq('status', 'DELIVERED'), 'delivered'),
    safeCount(supabase.from('Message').select('*', { count: 'exact', head: true }).eq('status', 'READ'), 'read'),
    safeCount(supabase.from('Message').select('*', { count: 'exact', head: true }).eq('status', 'FAILED'), 'failed'),
    safeCount(supabase.from('waba_contact_consent').select('*', { count: 'exact', head: true }).eq('opted_in', true).is('opted_out_at', null), 'opted_in'),
    safeCount(supabase.from('waba_contact_consent').select('*', { count: 'exact', head: true }).eq('opted_in', false), 'opted_out'),
    safeRows<Record<string, unknown>>(supabase.from('mkt_campaign_analytics').select('campaign_id, phone, message_id, status, sent_at').order('sent_at', { ascending: false }).limit(20), 'recent_campaigns'),
    safeRows<Record<string, unknown>>(supabase.from('waba_message_status_events').select('message_id, status, occurred_at').order('occurred_at', { ascending: false }).limit(20), 'recent_events'),
  ]);

  const deliveryBase = delivered + read + failed;
  const deliveryRate = deliveryBase > 0 ? Math.round(((delivered + read) / deliveryBase) * 100) : 0;
  const readRate = deliveryBase > 0 ? Math.round((read / deliveryBase) * 100) : 0;

  return NextResponse.json({
    metrics: {
      messagesToday,
      inboundToday,
      outboundToday,
      delivered,
      read,
      failed,
      deliveryRate,
      readRate,
      optedIn,
      optedOut,
    },
    recentCampaigns,
    recentEvents,
    generatedAt: now.toISOString(),
  });
}