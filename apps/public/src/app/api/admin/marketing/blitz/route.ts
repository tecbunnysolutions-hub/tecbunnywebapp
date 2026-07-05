import { NextResponse } from 'next/server';
import { z } from 'zod';
import { WhatsAppService } from '@/lib/whatsapp-service';
import { AdminAuthError, requireAdminContext } from '@/lib/auth/admin-guard';
import { logger } from '@/lib/logger';

const BlitzPayloadSchema = z.object({
  localArea: z.string().trim().min(1).max(80).default('North Goa'),
  targetLeads: z.array(z.object({
    phone: z.string().trim().regex(/^\+?\d{10,15}$/),
    name: z.string().trim().min(1).max(120),
    id: z.string().trim().min(1).max(120),
  })).min(1).max(50),
});

export async function POST(req: Request) {
  try {
    const { serviceSupabase: supabase } = await requireAdminContext();
    const parsed = BlitzPayloadSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid broadcast payload' }, { status: 400 });
    }

    const { targetLeads, localArea } = parsed.data;

    const whatsappService = new WhatsAppService();

    // Fire concurrently for instantaneous bulk cascade
    const broadcastPromises = targetLeads.map(async (lead: { phone: string; name: string; id: string }, index: number) => {
      const remainingSlots = 50 - index;
      if (remainingSlots <= 0) return null;

      const message = `🚨 *URGENT COMPLIANCE NOTICE FOR ${lead.name.toUpperCase()}* 🚨\n\nRecent GSTIN billing infrastructure updates require immediate technical compliance. Unverified POS setups in *${localArea}* are currently losing up to 28% in Input Tax Credits.\n\nTecBunny senior engineers are deployed in your sector for exactly 24 hours. We are offering a *FREE 15-Minute Technical & Security Grid Audit* (Normal Value: ₹4,500) to ensure your corporate infrastructure is 100% compliant.\n\n⚠️ *Only ${remainingSlots} priority slots remain for today.*\n\n👉 *Tap immediately to dispatch an engineer to your location under our 4-hour SLA:*\nhttps://tecbunny.com/local-audit?ref=${lead.id}&utm_source=wa_blitz`;

      try {
        await whatsappService.sendMessage(lead.phone, message, 'text');
        return true;
      } catch (e) {
        return false;
      }
    });

    const results = await Promise.all(broadcastPromises.filter(Boolean));
    const successCount = results.filter(r => r === true).length;

    // Log the blitz action for analytics
    const { error: campaignError } = await supabase.from('marketing_campaigns').insert({
      campaign_name: `24HR_BLITZ_${localArea.toUpperCase().replace(/\s+/g, '_')}`,
      leads_targeted: targetLeads.length,
      success_count: successCount,
      executed_at: new Date().toISOString(),
    });

    if (campaignError) {
      logger.error('marketing_blitz.log_failed', { error: campaignError.message });
    }

    return NextResponse.json({ success: true, message: `Blast deployed to ${successCount} local leads in ${localArea}.` });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    logger.error('marketing_blitz.unhandled', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Broadcast cascade failed' }, { status: 500 });
  }
}
