import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const CACHE_CONTROL = 'no-store, max-age=0';

function json(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set('Cache-Control', CACHE_CONTROL);
  return NextResponse.json(body, { ...init, headers });
}

function normalizePage(row: Record<string, unknown> | null) {
  if (!row) return null;

  let content = row.content ?? row.data ?? null;
  if (typeof content === 'string') {
    try {
      content = JSON.parse(content);
    } catch {
      // Preserve non-JSON content as stored.
    }
  }

  return {
    ...row,
    page_key: row.page_key ?? row.key ?? null,
    status: row.status ?? (row.is_active === false ? 'draft' : 'published'),
    content,
  };
}

export async function GET(request: NextRequest) {
  const pageKey = request.nextUrl.searchParams.get('key');
  if (!pageKey) {
    return json({ error: 'Page key is required' }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return json({ success: true, data: null });
  }

  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from('page_content')
      .select('*')
      .eq('key', pageKey)
      .maybeSingle();

    if (error) {
      return json({ success: true, data: null });
    }

    return json({ success: true, data: normalizePage(data) });
  } catch {
    return json({ success: true, data: null });
  }
}