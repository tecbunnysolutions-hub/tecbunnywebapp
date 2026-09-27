import { createSupabaseClient as createClient } from '@tecbunny/database/server';
import { NextResponse, NextRequest } from 'next/server';

import { logger } from "@tecbunny/core/logger";
import { isAtLeast, normalizeRole } from "@tecbunny/core/roles";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    logger.info('admin_quote_respond.audit.requested');
    const supabase = await createClient();
    // getUser() verifies the session server-side; getSession() data is not trusted.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Auth Check
    const { data: userData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = normalizeRole(userData?.role);
    if (!role || !isAtLeast(role, 'sales_executive')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { action, counterPrice, clauses } = body;
    const { id } = await params;

    const STATUS_BY_ACTION: Record<string, string> = { approve: 'accepted', counter: 'countered', reject: 'rejected' };
    const newStatus = STATUS_BY_ACTION[action];
    if (!newStatus) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    if (action === 'counter' && !(Number(counterPrice) > 0)) {
      return NextResponse.json({ error: 'A positive counter price is required' }, { status: 400 });
    }

    const { error } = await supabase.from('quotes').update({
      counter_price: counterPrice,
      negotiation_clauses: clauses,
      status: newStatus
    }).eq('id', id);

    if (error) throw error;

    logger.info('admin_quote_respond.audit.success', { quoteId: id, status: newStatus });
    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    logger.error('admin_quote_respond.audit.failed', { error: error instanceof Error ? error.message : String(error) });
    logger.error('Failed to update quote bid', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
