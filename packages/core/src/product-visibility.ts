export const PUBLIC_PRODUCT_PRICE_COLUMNS = [
  'price',
  'selling_price',
  'sale_price',
  'offer_price',
  'discount_price',
  'unit_price',
] as const;

export const PUBLIC_PRODUCT_STATUSES = ['active', 'published'] as const;

function toPositiveNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : null;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
  return null;
}

function firstPositive(product: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = toPositiveNumber(product[key]);
    if (value !== null) return value;
  }
  return null;
}

export function resolvePublicProductPrice(product: Record<string, unknown> | null | undefined): number {
  if (!product) return 0;
  return firstPositive(product, [...PUBLIC_PRODUCT_PRICE_COLUMNS]) ?? 0;
}

export function isPubliclyVisibleProduct(product: Record<string, unknown> | null | undefined) {
  if (!product) return false;

  const status = typeof product.status === 'string' ? product.status.trim().toLowerCase() : '';
  const isActive = !status || status === 'active' || status === 'published';
  const isEnabled = product.is_active !== false;
  const isNotDeleted = product.is_deleted !== true && product.deleted_at == null;
  const hasSalePrice = resolvePublicProductPrice(product) > 0;

  return isActive && isEnabled && isNotDeleted && hasSalePrice;
}

export function filterPubliclyVisibleProducts<T extends Record<string, unknown>>(products: T[]) {
  return products.filter(isPubliclyVisibleProduct);
}

function availableColumns(columns: Set<string> | null | undefined, candidates: readonly string[]) {
  return columns ? candidates.filter((column) => columns.has(column)) : [...candidates];
}

export function applyPublicProductVisibilityFilters(
  query: any,
  columns?: Set<string> | null
): any {
  let next = query;

  if (!columns || columns.has('status')) {
    next = next.or('status.is.null,status.eq.active,status.eq.published');
  }

  if (!columns || columns.has('is_active')) {
    next = next.or('is_active.is.null,is_active.eq.true');
  }

  if (!columns || columns.has('is_deleted')) {
    next = next.or('is_deleted.is.null,is_deleted.eq.false');
  }

  if (!columns || columns.has('deleted_at')) {
    next = next.is('deleted_at', null);
  }

  const priceColumns = availableColumns(columns, PUBLIC_PRODUCT_PRICE_COLUMNS);
  if (priceColumns.length > 0) {
    next = next.or(priceColumns.map((column) => `${column}.gt.0`).join(','));
  }

  return next;
}

/**
 * Order by `prioritized` desc (then `created_at` desc) only when the live
 * products table actually has the column. The production table is legacy and
 * has drifted, so an unconditional ORDER BY on a missing column makes PostgREST
 * return an error and the whole catalog render the "temporarily unavailable"
 * fallback. Pass the known column set (from a schema probe) or omit to skip
 * the prioritized sort when it can't be confirmed.
 */
export function applyPublicProductOrdering(
  query: any,
  columns?: Set<string> | null
): any {
  if (columns && columns.has('prioritized')) {
    return query
      .order('prioritized', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
  }
  return query.order('created_at', { ascending: false });
}

/**
 * Probe the live products table schema and return the set of column names
 * that actually exist, or null when the schema can't be determined.
 *
 * The production products table is legacy and has drifted from the local
 * migrations (missing columns such as is_active, sale_price, discount_price).
 * Passing this column set into applyPublicProductVisibilityFilters /
 * applyPublicProductOrdering keeps those helpers from referencing columns
 * that don't exist, which is what makes PostgREST return 42703 errors and
 * the whole catalog render the "temporarily unavailable" fallback.
 */
export async function ensureProductColumns(supabase: any): Promise<Set<string> | null> {
  try {
    // 1. Try the public schema view, when it exists.
    const { data: viewData, error: viewError } = await supabase
      .from('products_columns_view')
      .select('column_name');

    if (!viewError && viewData && viewData.length > 0) {
      return new Set<string>(viewData.map((c: any) => String(c.column_name)));
    }

    // 2. Fall back to selecting a single row and reading its keys.
    const { data: rowData, error: rowError } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (!rowError && rowData && rowData.length > 0) {
      return new Set<string>(Object.keys(rowData[0]));
    }

    return null;
  } catch {
    return null;
  }
}
