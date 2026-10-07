import { blogApi } from './blog';
import { productsApi } from './products';
import { createApiClient, type ApiClientOptions } from './client';

export * from './client';
export { BLOG_CACHE_TAG, blogApi } from './blog';
export { PRODUCTS_CACHE_TAG, productsApi } from './products';

export function createTecbunnyApi(options: ApiClientOptions = {}) {
  const client = createApiClient(options);
  return { client, blog: blogApi(client), products: productsApi(client) };
}
