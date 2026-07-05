import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createQuoteActionToken } from '@/lib/quotes/action-token';

// export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { isAdmin } = await requireAdmin(user, supabase);

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: quotes, error } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const quotesWithSecureLinks = (quotes || []).map((quote: any) => ({
    ...quote,
    secure_quote_token: createQuoteActionToken(quote.id, 'quote_customer'),
    secure_advance_token: createQuoteActionToken(quote.id, 'advance_payment'),
  }));

  return NextResponse.json(quotesWithSecureLinks);
}
