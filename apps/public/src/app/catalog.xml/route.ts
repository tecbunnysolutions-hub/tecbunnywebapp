import { createClient } from '@supabase/supabase-js';
import { requireSupabasePublicEnv } from '@tecbunny/database';
import { logger } from '@tecbunny/core/logger';
import { getProductDisplayImage } from '@tecbunny/core/image-utils';
import { stripHtmlToPlainText } from '@tecbunny/core/strings';
import {
  applyPublicProductOrdering,
  applyPublicProductVisibilityFilters,
  ensureProductColumns,
  isPubliclyVisibleProduct,
  resolvePublicProductPrice,
} from '@tecbunny/core/product-visibility';
import { BRAND_LOGO_URL } from '@tecbunny/ui';

/**
 * Module 3 — Meta Commerce Manager / Google Merchant product catalog feed.
 *
 * Register this URL in Meta Commerce Manager:
 *   Catalog -> Data sources -> Add products -> Data feed ->
 *   https://www.tecbunny.com/catalog.xml  (scheduled hourly fetch)
 *
 * Format: RSS 2.0 with the Google Merchant namespace (xmlns:g), which Meta
 * Commerce ingests natively. Required tags per item: g:id, g:title,
 * g:description, g:availability, g:condition, g:price, link, g:image_link,
 * g:brand.
 *
 * No env vars required — reuses the public Supabase client configuration.
 */

export const revalidate = 3600;

const SITE_URL = 'https://www.tecbunny.com';
const FEED_ITEM_LIMIT = 1000;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

type CatalogProduct = Record<string, unknown> & {
  id?: string | number;
  sku?: string | null;
  title?: string | null;
  name?: string | null;
  description?: string | null;
  details?: string | null;
  brand?: string | null;
  stock_status?: string | null;
  stock_quantity?: number | null;
};

function buildItem(product: CatalogProduct): string | null {
  if (!product.id || !isPubliclyVisibleProduct(product)) return null;

  const price = resolvePublicProductPrice(product);
  if (!Number.isFinite(price) || price <= 0) return null; // Meta requires a positive price

  const title = stripHtmlToPlainText(product.title || product.name || product.sku || '', 150) || 'Product';
  const description =
    stripHtmlToPlainText(product.description || product.details || '', 5000) ||
    `${title} — available at TecBunny Solutions, Goa.`;
  const image = getProductDisplayImage(product) || BRAND_LOGO_URL;
  const availability =
    product.stock_status === 'out_of_stock' ||
    (typeof product.stock_quantity === 'number' && product.stock_quantity <= 0)
      ? 'out of stock'
      : 'in stock';
  const link = `${SITE_URL}/products/${product.id}`;

  return [
    '    <item>',
    `      <g:id>${escapeXml(String(product.id))}</g:id>`,
    `      <g:title>${escapeXml(title)}</g:title>`,
    `      <g:description>${escapeXml(description)}</g:description>`,
    `      <g:availability>${availability}</g:availability>`,
    '      <g:condition>new</g:condition>',
    `      <g:price>${price.toFixed(2)} INR</g:price>`,
    `      <link>${escapeXml(link)}</link>`,
    `      <g:image_link>${escapeXml(image)}</g:image_link>`,
    `      <g:brand>${escapeXml(product.brand?.trim() || 'TecBunny')}</g:brand>`,
    '    </item>',
  ].join('\n');
}

export async function GET() {
  const headers = {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
  };

  let itemsXml = '';
  try {
    const { url, publicKey } = requireSupabasePublicEnv();
    const supabase = createClient(url, publicKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const productColumns = await ensureProductColumns(supabase);
    const { data, error } = await applyPublicProductOrdering(
      applyPublicProductVisibilityFilters(supabase.from('products').select('*'), productColumns),
      productColumns,
    ).range(0, FEED_ITEM_LIMIT - 1);

    if (error) {
      logger.error('catalog_feed.query_failed', { error: error.message });
    } else {
      itemsXml = (Array.isArray(data) ? data : [])
        .map((product) => buildItem(product as CatalogProduct))
        .filter((item): item is string => Boolean(item))
        .join('\n');
    }
  } catch (error) {
    // Never hard-fail the public feed — Meta retries on schedule and keeps the
    // last good snapshot; an empty channel is safer than a 5xx loop.
    logger.error('catalog_feed.exception', { error: error instanceof Error ? error.message : String(error) });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>TecBunny Solutions Product Catalog</title>
    <link>${SITE_URL}/products</link>
    <description>CCTV, IT hardware, security systems and accessories from TecBunny Solutions, Goa, India.</description>
${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, { headers });
}
