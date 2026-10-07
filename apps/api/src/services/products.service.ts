import type { ProductListData, ProductListQuery } from '@tecbunny/contracts';
import {
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
