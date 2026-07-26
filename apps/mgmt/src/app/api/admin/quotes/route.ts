import { createClient } from '@tecbunny/database';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from "@tecbunny/core/admin-auth";
import { createQuoteActionToken } from "@tecbunny/core/quotes/action-token";
import { logger } from '@tecbunny/core/logger';

// export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    logger.info('mgmt_quotes.audit.list_requested');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { isAdmin } = await requireAdmin(user, supabase);

    if (!isAdmin) {
      logger.warn('mgmt_quotes.audit.unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: quotes, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('mgmt_quotes.audit.query_failed', { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const quotesWithSecureLinks = (quotes || []).map((quote: any) => ({
      ...quote,
      secure_quote_token: createQuoteActionToken(quote.id, 'quote_customer'),
      secure_advance_token: createQuoteActionToken(quote.id, 'advance_payment'),
    }));

    logger.info('mgmt_quotes.audit.list_success', { count: quotesWithSecureLinks.length });
    return NextResponse.json(quotesWithSecureLinks);
  } catch (error) {
    logger.error('mgmt_quotes.audit.list_failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}
