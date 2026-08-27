import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@tecbunny/core/logger';

import { getProductDisplayImage } from '@tecbunny/core/image-utils';
import {
  PUBLIC_PRODUCT_STATUSES,
  applyPublicProductVisibilityFilters,
} from '@tecbunny/core/product-visibility';

const CACHE_CONTROL = 'no-store, max-age=0, must-revalidate';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function parsePositiveInt(value: string | null, fallback: number, max: number) {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, 1), max);
}

function json(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set('Cache-Control', CACHE_CONTROL);
  return NextResponse.json(body, { ...init, headers });
}

function fallback(page: number, limit: number, warning: string) {
  return json({
    success: true,
    data: [],
    pagination: { page, limit, total: 0, pages: 0 },
    warnings: [warning],
  });
}

function normalizeProduct(product: any) {
  if (!product || typeof product !== 'object') return product;

  return {
    ...product,
    image: getProductDisplayImage(product) || product.image || null,
  };
}

function cleanPostgrestFilterValue(value: string) {
  return value.trim().replace(/[%_*(),]/g, ' ').replace(/\s+/g, ' ').slice(0, 80);
}

export async function GET(request: NextRequest) {
  const page = parsePositiveInt(request.nextUrl.searchParams.get('page'), 1, 10_000);
  const limit = parsePositiveInt(request.nextUrl.searchParams.get('limit'), 20, 200);
  const status = request.nextUrl.searchParams.get('status');
  const vendor = request.nextUrl.searchParams.get('vendor');
  const search = (request.nextUrl.searchParams.get('search') ?? '').trim().slice(0, 80);
  const offset = (page - 1) * limit;
  const cleanStatus = status ? status.trim().toLowerCase() : '';
  const cleanVendor = vendor ? cleanPostgrestFilterValue(vendor) : '';
  const cleanSearch = cleanPostgrestFilterValue(search);

  logger.info('public_products.audit.requested', { page, limit, hasSearch: Boolean(search), status: status ?? null, vendor: vendor ?? null });

  if (cleanStatus && !PUBLIC_PRODUCT_STATUSES.some((publicStatus) => publicStatus === cleanStatus)) {
    return json({
      success: true,
      data: [],
      pagination: { page, limit, total: 0, pages: 0 },
    });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    logger.warn('public_products.audit.not_configured');
    return fallback(page, limit, 'Product service is not configured.');
  }

  try {
    const supabase = createClient(url, key);
    let query = applyPublicProductVisibilityFilters(
      supabase
        .from('products')
        .select('*', { count: 'exact' })
    );

    if (cleanStatus) {
      query = query.eq('status', cleanStatus);
    }

    if (cleanVendor) {
      query = query.or(`vendor.eq.${cleanVendor},brand.eq.${cleanVendor}`);
    }

    if (cleanSearch) {
      query = query.or([
        `title.ilike.%${cleanSearch}%`,
        `name.ilike.%${cleanSearch}%`,
        `category.ilike.%${cleanSearch}%`,
        `brand.ilike.%${cleanSearch}%`,
        `vendor.ilike.%${cleanSearch}%`,
      ].join(','));
    }

    const { data, error, count } = await query
      .order('prioritized', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('public_products.audit.query_failed', { error: error.message });
      return fallback(page, limit, 'Product service is temporarily unavailable.');
    }

    const products = (Array.isArray(data) ? data : []).map(normalizeProduct);

    logger.info('public_products.audit.success', { count: products.length, page, limit });
    return json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total: count ?? products.length,
        pages: Math.ceil((count ?? products.length) / limit),
      },
    });
  } catch (error) {
    logger.error('public_products.audit.exception', { error: error instanceof Error ? error.message : String(error) });
    return fallback(page, limit, 'Product service is temporarily unavailable.');
  }
}
