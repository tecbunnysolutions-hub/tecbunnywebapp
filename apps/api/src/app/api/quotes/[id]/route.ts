import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getUserDb } from "@tecbunny/core/db";
import { buildPdf, loadCompanyInfo } from "@tecbunny/core/pdf-generator";
import { requireAdmin } from "@tecbunny/core/admin-auth";
import { verifyQuoteActionToken } from "@tecbunny/core/quotes/action-token";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getAdminDb();

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = db.from('quotes').select('*');
    if (isUuid) {
      query = query.eq('id', id);
    } else {
      query = query.eq('quote_number', id);
    }

    const data = await db.executeMaybe(query.maybeSingle());

    if (!data) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const userDb = await getUserDb();
    const { data: { user } } = await userDb.auth.getUser();
    const actionToken =
      req.nextUrl.searchParams.get('token') ||
      req.headers.get('x-quote-action-token');
    const hasActionToken = verifyQuoteActionToken(actionToken, data.id, ['quote_customer', 'advance_payment']);

    if (!user && !hasActionToken) {
      return NextResponse.json(
        { error: 'Authentication required to view quotes' },
        { status: 401 }
      );
    }

    const { isAdmin } = user ? await requireAdmin(user, userDb.supabase) : { isAdmin: false };
    const isOwner = Boolean(user && data.user_id && data.user_id === user.id);
    if (!isAdmin && !hasActionToken && !isOwner) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const formatParam = req.nextUrl.searchParams.get('format');
    if (formatParam === 'pdf') {
      const company = await loadCompanyInfo();
      const pdfBuffer = await buildPdf({
        company,
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        gstIncluded: data.gst_included,
        summary: data.summary,
        selections: data.selections,
        quoteNumber: data.quote_number,
      });

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="quote-${data.quote_number || data.id}.pdf"`,
        },
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch quote' },
      { status: 400 }
    );
  }
}
