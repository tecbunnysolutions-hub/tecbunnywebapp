import type { ProductListData, ProductListQuery } from '@tecbunny/contracts';
import {
  isPubliclyVisibleProduct,
  applyPublicProductOrdering,
  applyPublicProductVisibilityFilters,
  ensureProductColumns,
} from '@tecbunny/core/product-visibility';
import type { SupabaseClient } from '@tecbunny/database';

import { ServiceError } from './errors';

/** Publicly visible products (visibility rules shared with the storefront) plus active auto offers. */
export async function listPublicProducts(db: SupabaseClient, query: ProductListQuery): Promise<ProductListData> {
  const from = (query.page - 1) * query.pageSize;
  const columns = await ensureProductColumns(db);

  const productQuery = applyPublicProductOrdering(
    applyPublicProductVisibilityFilters(db.from('products').select('*', { count: 'exact' }), columns),
    columns,
  ).range(from, from + query.pageSize - 1);

  const [productsRes, offersRes] = await Promise.all([
    productQuery,
    db.from('auto_offers').select('*').eq('is_active', true),
  ]);

  if (productsRes.error) throw new ServiceError(502, 'UPSTREAM_ERROR', 'Failed to load products.');

  const products = (productsRes.data ?? []) as ProductListData['products'];
  return {
    products,
    // Offers are decorative; a failure must not take the catalogue down.
    offers: offersRes.error ? [] : ((offersRes.data ?? []) as ProductListData['offers']),
    total: productsRes.count ?? products.length,
    page: query.page,
    pageSize: query.pageSize,
  };
}

/** A single publicly visible product; hidden, deleted or unknown ids are all 404. */
export async function getPublicProductById(db: SupabaseClient, id: string): Promise<ProductListData['products'][number]> {
  const { data, error } = await db.from('products').select('*').eq('id', id).maybeSingle();
  if (error) throw new ServiceError(502, 'UPSTREAM_ERROR', 'Failed to load product.');
  if (!data || !isPubliclyVisibleProduct(data)) throw new ServiceError(404, 'NOT_FOUND', 'Product not found.');
  return data as ProductListData['products'][number];
}
