import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getUserDb } from "@tecbunny/core/db";
import { verifyQuoteActionToken } from "@tecbunny/core/quotes/action-token";
import { buildPdf, loadCompanyInfo } from "@tecbunny/core/pdf-generator";
import { requireAdmin } from "@tecbunny/core/admin-auth";

function lastTenDigits(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\D/g, '').slice(-10) : '';
}

function guestQuoteMatchesUser(quote: any, user: any): boolean {
  const channels: string[] | null = Array.isArray(user.app_metadata?.verified_channels) ? user.app_metadata.verified_channels : null;
  const emailVerified = Boolean(user.email && user.email_confirmed_at && (!channels || channels.includes('email')));
  const phoneVerified = Boolean(user.phone && user.phone_confirmed_at && (!channels || channels.includes('whatsapp')));
  const quoteEmail = typeof quote.customer_email === 'string' ? quote.customer_email.trim().toLowerCase() : '';
  if (emailVerified && quoteEmail && quoteEmail === String(user.email).trim().toLowerCase()) return true;
  const quotePhone = lastTenDigits(quote.customer_phone);
  return phoneVerified && quotePhone.length === 10 && quotePhone === lastTenDigits(user.phone);
}

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

    // Server-side authorization & IDOR protection. Quote numbers are short and
    // guessable, so knowing one is never enough: the caller must hold the
    // quote's signed customer link, own it, be an admin, or be signed in with a
    // verified email/phone that matches a guest quote's contact details.
    const actionToken = req.nextUrl.searchParams.get('token');
    const hasActionToken = verifyQuoteActionToken(actionToken, data.id, ['quote_customer', 'advance_payment']);

    if (!hasActionToken) {
      const userDb = await getUserDb();
      const { data: { user } } = await userDb.auth.getUser();

      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required to view quotes' },
          { status: 401 }
        );
      }

      const { isAdmin } = await requireAdmin(user, userDb.supabase);
      const isOwner = Boolean(data.user_id && data.user_id === user.id);
      const matchesGuestContact = !data.user_id && guestQuoteMatchesUser(data, user);
      if (!isAdmin && !isOwner && !matchesGuestContact) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
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
