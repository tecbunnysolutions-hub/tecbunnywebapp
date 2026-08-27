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

export function isPubliclyVisibleProduct(product: Record<string, unknown> | null | undefined) {
  if (!product) return false;

  const status = typeof product.status === 'string' ? product.status.trim().toLowerCase() : '';
  const isActive = !status || status === 'active' || status === 'published';
  const isEnabled = product.is_active !== false;
  const isNotDeleted = product.is_deleted !== true && product.deleted_at == null;
  const hasSalePrice = firstPositive(product, [...PUBLIC_PRODUCT_PRICE_COLUMNS]) !== null;

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

  if (columns?.has('is_active')) {
    next = next.or('is_active.is.null,is_active.eq.true');
  }

  if (!columns || columns.has('is_deleted')) {
    next = next.or('is_deleted.is.null,is_deleted.eq.false');
  }

  if (columns?.has('deleted_at')) {
    next = next.is('deleted_at', null);
  }

  const priceColumns = availableColumns(columns, PUBLIC_PRODUCT_PRICE_COLUMNS);
  if (priceColumns.length > 0) {
    next = next.or(priceColumns.map((column) => `${column}.gt.0`).join(','));
  }

  return next;
}
