import { filterPubliclyVisibleProducts } from '@tecbunny/core/product-visibility';

import { getApi } from '@/lib/api';

type CatalogProduct = Record<string, unknown> & { id: string | number };

export type ProductCategory = { name: string; slug: string; count: number };

export const slugifyCategory = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const categoryOf = (product: Record<string, unknown>) => {
  const value = product.category ?? product.product_type;
  return typeof value === 'string' && value.trim() ? value.trim() : '';
};

// Hierarchical "Parent > Child" categories roll up so a parent page lists its children's products.
const categoryPaths = (category: string) => {
  const parts = category.split('>').map((part) => part.trim()).filter(Boolean);
  return parts.map((_, index) => parts.slice(0, index + 1).join(' > '));
};

export async function getCatalogByCategory() {
  const { products } = await getApi().products.list({ page: 1, pageSize: 500 });
  const visible = filterPubliclyVisibleProducts(products as CatalogProduct[]);

  const categories = new Map<string, ProductCategory>();
  for (const product of visible) {
    for (const path of categoryPaths(categoryOf(product))) {
      const slug = slugifyCategory(path);
      if (!slug) continue;
      const existing = categories.get(slug);
      if (existing) existing.count += 1;
      else categories.set(slug, { name: path, slug, count: 1 });
    }
  }

  return {
    products: visible,
    categories: [...categories.values()].sort((a, b) => a.name.localeCompare(b.name)),
    productsInCategory: (name: string) =>
      visible.filter((product) => {
        const category = categoryOf(product);
        return category === name || category.startsWith(`${name} > `);
      }),
  };
}
