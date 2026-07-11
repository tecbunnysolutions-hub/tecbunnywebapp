import { NextRequest, NextResponse } from 'next/server';

import { AdminAuthError, requireAdminContext } from "@tecbunny/core/auth/admin-guard";
import { logger } from "@tecbunny/core";
import { prisma } from "@tecbunny/infra";

const PUBLIC_PAGE_CONTENT_CACHE_CONTROL = 'no-store, max-age=0';

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

async function upsertPageContent(payload: ContentPayload) {
  try {
    const timestamp = new Date();
    // Using Prisma to enforce parameterized queries automatically
    const result = await (prisma as any).pageContent.upsert({
      where: { key: payload.pageKey },
      update: {
        page_key: payload.pageKey,
        title: payload.title,
        content: payload.content,
        meta_description: payload.metaDescription,
        meta_keywords: payload.metaKeywords,
        status: payload.status,
        updated_at: timestamp,
      },
      create: {
        key: payload.pageKey,
        page_key: payload.pageKey,
        title: payload.title,
        content: payload.content,
        meta_description: payload.metaDescription,
        meta_keywords: payload.metaKeywords,
        status: payload.status,
        updated_at: timestamp,
        created_at: timestamp,
      }
    });
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

async function getPageByKey(pageKey: string) {
  try {
    const page = await (prisma as any).pageContent.findFirst({
      where: {
        OR: [
          { key: pageKey },
          { page_key: pageKey }
        ],
        status: 'published'
      }
    });

    if (!page) {
      // Fallback for draft/other statuses or just missing
      const fallback = await (prisma as any).pageContent.findFirst({
        where: {
          OR: [
            { key: pageKey },
            { page_key: pageKey }
          ]
        }
      });
      return { data: fallback, error: null };
    }

    return { data: page, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Get page content by key
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get('key');

    if (!pageKey) {
      return NextResponse.json({ error: 'Page key is required' }, { status: 400 });
    }

    const { data: pageContent, error } = await getPageByKey(pageKey);

    if (error) {
      logger.error('page_content_fetch_failed', { error, pageKey });
      return NextResponse.json({ error: 'Failed to fetch page content' }, { status: 500 });
    }

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

    const body = await request.json();
    let payload: ContentPayload;
    try {
      payload = extractPayload(body);
    } catch (err) {
      return NextResponse.json({ error: (err as Error).message }, { status: 400 });
    }

    const upsert = await upsertPageContent(payload);

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
    const body = await request.json();

    if (body?.action === 'list_all') {
      let pages: any[] = [];
      try {
        pages = await (prisma as any).pageContent.findMany({
          orderBy: { page_key: 'asc' }
        });
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
    const upsert = await upsertPageContent(payload);

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

    try {
      await (prisma as any).pageContent.deleteMany({
        where: {
          OR: [
            { key: pageKey },
            { page_key: pageKey }
          ]
        }
      });
    } catch (error) {
      logger.error('page_content_delete_failed', { error, pageKey });
      return NextResponse.json({ error: 'Failed to delete page content' }, { status: 500 });
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
