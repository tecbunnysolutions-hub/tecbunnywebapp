import { createClient } from '@tecbunny/database';
import { createServiceClient, isSupabaseServiceConfigured } from '@tecbunny/database/admin';
import { NextRequest, NextResponse } from 'next/server';
import { LeadEngineService, logger } from '@tecbunny/core';

export async function POST(request: NextRequest) {
  try {
    logger.info('ai_price_request.audit.requested');
    const body = await request.json();
    const productId = typeof body?.productId === 'string' ? body.productId : null;
    const query = typeof body?.query === 'string' ? body.query.trim() : '';
    const notes = typeof body?.notes === 'string' ? body.notes.trim() : '';
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
    const companyName = typeof body?.companyName === 'string' ? body.companyName.trim() : null;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Login required.' }, { status: 401 });
    }

    if (!isSupabaseServiceConfigured) {
      return NextResponse.json({ error: 'Service unavailable.' }, { status: 500 });
    }

    const service = createServiceClient();
    const requirement = query || notes || 'AI price request';
    const result = await LeadEngineService.createLeadFromIntake(service, {
      first_name: user.user_metadata?.full_name || 'Visitor',
      last_name: '',
      email: user.email || undefined,
      phone: phone || undefined,
      company_name: companyName || undefined,
      source_name: 'website',
      requirement,
      message: notes || query || 'AI price request',
      service_interest: 'AI price request',
      form_identifier: 'ai_price_request',
      origin_path: '/ai-research',
      metadata: {
        product_id: productId,
        query,
        notes,
        source: 'ai-research',
        user_id: user.id,
        created_at: new Date().toISOString(),
      },
    });

    logger.info('ai_price_request.audit.success', { userId: user.id, productId, leadId: result.lead.id });
    return NextResponse.json({ success: true, leadId: result.lead.id, isNew: result.isNew });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit price request.';
    logger.error('ai_price_request.audit.failed', { error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
