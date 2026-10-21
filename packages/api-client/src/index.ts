import { adminApi } from './admin';
import { blogApi } from './blog';
import { blueprintsApi } from './blueprints';
import { configApi } from './config';
import { contentApi } from './content';
import { invoicesApi } from './invoices';
import { meApi } from './me';
import { superadminApi } from './superadmin';
import { productsApi } from './products';
import { createApiClient, type ApiClientOptions } from './client';

export * from './client';
export { LOCAL_API_URL, PRODUCTION_API_URL, STAGING_API_URL, resolveApiBaseUrl } from './base-url.mjs';
export { BLOG_CACHE_TAG, blogApi } from './blog';
export { PRODUCTS_CACHE_TAG, productsApi } from './products';
export { BLUEPRINTS_CACHE_TAG, blueprintsApi } from './blueprints';
export { CONTENT_CACHE_TAG, contentApi } from './content';
export { configApi } from './config';

export function createTecbunnyApi(options: ApiClientOptions = {}) {
  const client = createApiClient(options);
  return { client, blog: blogApi(client), products: productsApi(client), content: contentApi(client), config: configApi(client), blueprints: blueprintsApi(client), me: meApi(client), invoices: invoicesApi(client), superadmin: superadminApi(client), admin: adminApi(client) };
}
