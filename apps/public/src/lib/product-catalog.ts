import { resolvePublicProductPrice } from '@tecbunny/core/product-visibility';

type CatalogProduct = { id: string | number };

const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const readField = (product: CatalogProduct, key: string) => (product as CatalogProduct & Record<string, unknown>)[key];

export function getCatalogProductDisplayName<T extends CatalogProduct>(product: T): string {
  let name = text(readField(product, 'title')) || text(readField(product, 'name')) || 'Product';
  const brand = text(readField(product, 'brand')) || text(readField(product, 'vendor'));
  while (brand && name.toLowerCase().startsWith(`${brand.toLowerCase()} `)) {
    name = name.slice(brand.length).trimStart();
  }
  return name || 'Product';
}

function productPrice(product: CatalogProduct): number {
  return resolvePublicProductPrice(product as CatalogProduct & Record<string, unknown>) || Number.POSITIVE_INFINITY;
}

function productIdentity(product: CatalogProduct): string {
  const brand = (text(readField(product, 'brand')) || text(readField(product, 'vendor'))).toLowerCase();
  const category = (text(readField(product, 'category')) || text(readField(product, 'product_type'))).toLowerCase();
  const name = getCatalogProductDisplayName(product).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  return brand && name ? `${brand}|${category}|${name}` : `id:${product.id}`;
}

export function deduplicateCatalogProducts<T extends CatalogProduct>(products: T[]): T[] {
  const unique = new Map<string, T>();
  for (const product of products) {
    const identity = productIdentity(product);
    const current = unique.get(identity);
    if (!current || productPrice(product) < productPrice(current)) {
      unique.set(identity, product);
    }
  }
  return [...unique.values()];
}
