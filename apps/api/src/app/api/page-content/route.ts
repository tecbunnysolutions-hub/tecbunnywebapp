import { NextRequest, NextResponse } from 'next/server';

import { AdminAuthError, requireAdminContext } from "@tecbunny/core/auth/admin-guard";
import { logger } from "@tecbunny/core";
import { getAdminDb, DatabaseError } from "@tecbunny/core/server";

const PUBLIC_PAGE_CONTENT_CACHE_CONTROL = 'no-store, max-age=0';
const PAGE_CONTENT_PUBLIC_SELECTS = {
  pageKeyStatus: 'id,page_key,title,content,status,meta_description,meta_keywords,created_at,updated_at',
  keyStatus: 'id,key,title,content,status,meta_description,meta_keywords,created_at,updated_at',
  keyActive: 'id,key,title,content,is_active,meta_description,meta_keywords,created_at,updated_at',
  pageKeyMinimal: 'id,page_key,title,content,created_at,updated_at',
  keyMinimal: 'id,key,title,content,created_at,updated_at',
};


function normalizePage(row: any | null) {
  if (!row) return null;
  const page_key = row.page_key ?? row.key ?? null;
  const status = row.status ?? (row.is_active === true ? 'published' : row.is_active === false ? 'draft' : undefined);
  let content = row.content ?? row.data ?? null;
  if (typeof content === 'string') {
    try {
      content = JSON.parse(content);
    } catch (_error) {
      // leave as string
    }
  }
  return { ...row, page_key, status, content };
}

function jsonWithCache(body: unknown, cacheControl: string, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set('Cache-Control', cacheControl);
  return NextResponse.json(body, {
    ...init,
    headers,
  });
}

function parseContentValue(content: unknown) {
  if (typeof content === 'string') {
    try {
      return JSON.parse(content);
    } catch (_error) {
      throw new Error('Invalid JSON content payload');
    }
  }
  return content;
}

interface ContentPayload {
  pageKey: string;
  title: string;
  content: any;
  metaDescription: string | null;
  metaKeywords: string | null;
  status: string;
}

function extractPayload(body: any): ContentPayload {
  const pageKey = body?.pageKey || body?.page_key || body?.key;
  const title = body?.title;
  const metaDescription = body?.metaDescription ?? body?.meta_description ?? null;
  const metaKeywords = body?.metaKeywords ?? body?.meta_keywords ?? null;
  const status = body?.status || 'published';

  if (!pageKey || !title || body?.content == null) {
    throw new Error('Page key, title, and content are required');
  }

  const content = parseContentValue(body.content);

  return { pageKey, title, content, metaDescription, metaKeywords, status };
}

async function upsertPageContent(db: any, payload: ContentPayload) {
  const timestamp = new Date().toISOString();

  const strategies: Array<{
    data: Record<string, any>;
    conflict: 'page_key' | 'key';
    select: 'single' | 'maybeSingle';
  }> = [
    {
      data: {
        page_key: payload.pageKey,
        title: payload.title,
        content: payload.content,
        meta_description: payload.metaDescription,
        meta_keywords: payload.metaKeywords,
        status: payload.status,
        updated_at: timestamp
      },
      conflict: 'page_key',
      select: 'single'
    },
    {
      data: {
        page_key: payload.pageKey,
        title: payload.title,
        content: payload.content,
        status: payload.status,
        updated_at: timestamp
      },
      conflict: 'page_key',
      select: 'single'
    },
    {
      data: {
        key: payload.pageKey,
        title: payload.title,
        content: payload.content,
        meta_description: payload.metaDescription,
        meta_keywords: payload.metaKeywords,
        updated_at: timestamp
      },
      conflict: 'key',
      select: 'maybeSingle'
    },
    {
      data: {
        key: payload.pageKey,
        title: payload.title,
        content: payload.content,
        updated_at: timestamp
      },
      conflict: 'key',
      select: 'maybeSingle'
    }
  ];

  for (const strategy of strategies) {
    const baseQuery = db.from('page_content')
      .upsert(strategy.data, { onConflict: strategy.conflict })
      .select();

    try {
      const result = await (strategy.select === 'single'
        ? db.execute(baseQuery.single())
        : db.executeMaybe(baseQuery.maybeSingle(), true));
        
      if (result) return { data: result, error: null };
    } catch (error) {
      if (error instanceof DatabaseError && error.isSchemaError()) {
        continue;
      }
      return { data: null, error };
    }
  }

  return { data: null, error: new Error('Failed to upsert using any schema strategy') };
}

async function getPageByKey(pageKey: string, db: any) {
  // Try a sequence of strategies to accommodate different schemas
  const tries: Array<() => PromiseLike<any>> = [
    // Modern: page_key + status
    () => db.executeMaybe(db.from('page_content').select(PAGE_CONTENT_PUBLIC_SELECTS.pageKeyStatus).eq('page_key', pageKey).eq('status', 'published').maybeSingle(), true),
    // Mixed: key + status
    () => db.executeMaybe(db.from('page_content').select(PAGE_CONTENT_PUBLIC_SELECTS.keyStatus).eq('key', pageKey).eq('status', 'published').maybeSingle(), true),
    // Legacy: key + is_active
    () => db.executeMaybe(db.from('page_content').select(PAGE_CONTENT_PUBLIC_SELECTS.keyActive).eq('key', pageKey).eq('is_active', true).maybeSingle(), true),
    // Minimal: page_key only
    () => db.executeMaybe(db.from('page_content').select(PAGE_CONTENT_PUBLIC_SELECTS.pageKeyMinimal).eq('page_key', pageKey).maybeSingle(), true),
    // Minimal legacy: key only
    () => db.executeMaybe(db.from('page_content').select(PAGE_CONTENT_PUBLIC_SELECTS.keyMinimal).eq('key', pageKey).maybeSingle(), true),
  ];

  for (const run of tries) {
    try {
      const data = await run();
      if (data) return { data, error: null };
    } catch (error) {
      if (error instanceof DatabaseError && error.isSchemaError()) {
        continue;
      }
      return { data: null, error };
    }
  }
  return { data: null, error: null };
}

// Get page content by key
export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get('key');

    if (!pageKey) {
      return NextResponse.json({ error: 'Page key is required' }, { status: 400 });
    }

    const { data: pageContent, error } = await getPageByKey(pageKey, db);

    if (error) {
      if (error instanceof DatabaseError && error.isFetchFailure()) {
        logger.warn('page_content_fetch_failed', { error, pageKey });
        return jsonWithCache({ success: true, data: null, warning: 'Content service unavailable' }, PUBLIC_PAGE_CONTENT_CACHE_CONTROL);
      }
      logger.error('page_content_fetch_failed', { error, pageKey });
      return NextResponse.json({ error: 'Failed to fetch page content' }, { status: 500 });
    }

    // Return 200 with null data when not found; normalize field names
    return jsonWithCache({ success: true, data: normalizePage(pageContent ?? null) }, PUBLIC_PAGE_CONTENT_CACHE_CONTROL);

  } catch (error) {
  logger.error('page_content_api_error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update page content (admin only)
export async function PUT(request: NextRequest) {
  try {
    await requireAdminContext();
    const db = getAdminDb();

    const body = await request.json();
    let payload: ContentPayload;
    try {
      payload = extractPayload(body);
    } catch (err) {
      return NextResponse.json({ error: (err as Error).message }, { status: 400 });
    }

    const upsert = await upsertPageContent(db, payload);

    if (upsert.error) {
      logger.error('page_content_update_failed', { error: upsert.error, payload });
      return NextResponse.json({
        error: (upsert.error as Error).message || 'Failed to update page content',
        details: upsert.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Page content updated successfully',
      data: normalizePage(upsert.data)
    });

  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logger.error('page_content_update_exception', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get all page contents (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdminContext();
    const db = getAdminDb();

    const body = await request.json();

    if (body?.action === 'list_all') {
      let pages: any[] = [];
      
      try {
        pages = await db.executeMaybe(db.from('page_content').select('*').order('page_key'), true) || [];
        if (pages.length === 0) {
          pages = await db.executeMaybe(db.from('page_content').select('*').order('key'), true) || [];
        }
        if (pages.length === 0) {
          pages = await db.executeMaybe(db.from('page_content').select('*'), true) || [];
        }
      } catch (error) {
        logger.error('page_content_list_failed', { error });
        return NextResponse.json({ error: 'Failed to fetch page contents' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: pages.map(normalizePage)
      });
    }

    let payload: ContentPayload;
    try {
      payload = extractPayload(body);
    } catch (err) {
      return NextResponse.json({ error: (err as Error).message }, { status: 400 });
    }
    const upsert = await upsertPageContent(db, payload);

    if (upsert.error) {
      logger.error('page_content_create_failed', { error: upsert.error, payload });
      return NextResponse.json({
        error: (upsert.error as Error).message || 'Failed to save page content',
        details: upsert.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Page content saved successfully',
      data: normalizePage(upsert.data)
    }, { status: 201 });

  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logger.error('page_content_list_exception', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdminContext();
    const db = getAdminDb();

    const url = new URL(request.url);
    let pageKey = url.searchParams.get('key') || url.searchParams.get('pageKey');

    if (!pageKey) {
      try {
        const body = await request.json();
        pageKey = body?.pageKey || body?.page_key || body?.key || null;
      } catch (_error) {
        // ignore body parse errors for DELETE without payload
      }
    }

    if (!pageKey) {
      return NextResponse.json({ error: 'Page key is required' }, { status: 400 });
    }

    const attempts: Array<'page_key' | 'key'> = ['page_key', 'key'];
    let removed = false;
    let lastError: any = null;

    for (const column of attempts) {
      try {
        const data = await db.executeMaybe(
          db.from('page_content').delete().eq(column, pageKey).select().maybeSingle(),
          true
        );

        if (data) {
          removed = true;
          break;
        }
      } catch (error) {
        lastError = error;
        break;
      }
    }

    if (lastError) {
      logger.error('page_content_delete_failed', { error: lastError, pageKey });
      return NextResponse.json({ error: 'Failed to delete page content' }, { status: 500 });
    }

    if (!removed) {
      return NextResponse.json({ error: 'Page content not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Page content deleted successfully' });

  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logger.error('page_content_delete_exception', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
