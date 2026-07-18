import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { getProductDisplayImage } from '@tecbunny/core/image-utils';
import { filterPubliclyVisibleProducts } from '@tecbunny/core/product-visibility';

const CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=900';

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

function productMatchesSearch(product: any, search: string) {
  if (!search) return true;
  const normalized = search.toLowerCase();
  return [product.title, product.name, product.category, product.brand, product.vendor]
    .some((value) => typeof value === 'string' && value.toLowerCase().includes(normalized));
}

export async function GET(request: NextRequest) {
  const page = parsePositiveInt(request.nextUrl.searchParams.get('page'), 1, 10_000);
  const limit = parsePositiveInt(request.nextUrl.searchParams.get('limit'), 20, 200);
  const status = request.nextUrl.searchParams.get('status');
  const vendor = request.nextUrl.searchParams.get('vendor');
  const search = (request.nextUrl.searchParams.get('search') ?? '').trim().slice(0, 80);
  const offset = (page - 1) * limit;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return fallback(page, limit, 'Product service is not configured.');
  }

  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .range(offset, offset + limit - 1);

    if (error) {
      return fallback(page, limit, 'Product service is temporarily unavailable.');
    }

    const products = filterPubliclyVisibleProducts(Array.isArray(data) ? data : [])
      .filter((product: any) => !status || product.status === status)
      .filter((product: any) => !vendor || product.vendor === vendor || product.brand === vendor)
      .filter((product: any) => productMatchesSearch(product, search))
      .map(normalizeProduct)
      .sort((left: any, right: any) => {
        const priorityDelta = Number(Boolean(right.prioritized)) - Number(Boolean(left.prioritized));
        if (priorityDelta !== 0) return priorityDelta;
        return new Date(right.created_at ?? 0).getTime() - new Date(left.created_at ?? 0).getTime();
      });

    return json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total: products.length,
        pages: Math.ceil(products.length / limit),
      },
    });
  } catch {
    return fallback(page, limit, 'Product service is temporarily unavailable.');
  }
}