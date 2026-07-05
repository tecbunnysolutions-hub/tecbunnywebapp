import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { buildPdf, loadCompanyInfo } from '@/lib/pdf-generator';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin-auth';
import { requireSupabaseServiceEnv } from '@/lib/supabase/env';

let supabaseAdmin: any = null;

function getSupabaseAdmin(): any {
  if (!supabaseAdmin) {
    const { url, serviceKey } = requireSupabaseServiceEnv();
    supabaseAdmin = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseAdmin;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (!isUuid) {
      const supabaseAuth = await createServerClient();
      const { data: { user } } = await supabaseAuth.auth.getUser();

      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required to view quotes by sequential identifier' },
          { status: 401 }
        );
      }

      // Check if user is admin/staff
      const { isAdmin } = await requireAdmin(user, supabaseAuth);

      if (!isAdmin) {
        // Enforce owner check
        const { data: quoteCheck } = await supabase
          .from('quotes')
          .select('user_id')
          .eq('quote_number', id)
          .maybeSingle();

        if (!quoteCheck || quoteCheck.user_id !== user.id) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
      }
    }

    let query = supabase.from('quotes').select('*');
    if (isUuid) {
      query = query.eq('id', id);
    } else {
      query = query.eq('quote_number', id);
    }

    const { data, error } = await query.single();

    if (error || !data) throw error || new Error('Quote not found');

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
