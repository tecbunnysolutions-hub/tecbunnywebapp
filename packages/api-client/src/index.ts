import { blogApi } from './blog';
import { createApiClient, type ApiClientOptions } from './client';

export * from './client';
export { BLOG_CACHE_TAG, blogApi } from './blog';

export function createTecbunnyApi(options: ApiClientOptions = {}) {
  const client = createApiClient(options);
  return { client, blog: blogApi(client) };
}
