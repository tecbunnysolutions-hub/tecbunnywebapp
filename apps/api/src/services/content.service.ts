import type { FaqListData, HomeContentData, ServiceListData } from '@tecbunny/contracts';
import type { SupabaseClient } from '@tecbunny/database';

import { ServiceError } from './errors';

const MISSING_TABLE_CODES = new Set(['PGRST205', '42P01']);

/** Partner brands and hero carousel for the home page. Missing rows are null, not errors. */
export async function getHomeContent(db: SupabaseClient): Promise<HomeContentData> {
  const [brands, hero] = await Promise.all([
    db.from('settings').select('value').eq('key', 'partnerBrands').maybeSingle(),
    db.from('page_content').select('data').eq('key', 'hero-carousels').maybeSingle(),
  ]);

  return {
    partnerBrands: brands.error ? null : ((brands.data as { value?: unknown } | null)?.value ?? null),
    heroCarousel: hero.error ? null : ((hero.data as { data?: unknown } | null)?.data ?? null),
  };
}

export async function listActiveFaqs(db: SupabaseClient): Promise<FaqListData> {
  const { data, error } = await db
    .from('cms_faqs')
    .select('id, category, question, answer, display_order')
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('category', { ascending: true })
    .order('display_order', { ascending: true });

  if (error) {
    if (MISSING_TABLE_CODES.has(error.code)) return { faqs: [] };
    throw new ServiceError(502, 'UPSTREAM_ERROR', 'Failed to load FAQs.');
  }

  type Row = { id: string; category: string | null; question: string; answer: string; display_order: number | null };
  return {
    faqs: ((data ?? []) as Row[]).map((faq) => ({
      ...faq,
      category: faq.category ?? 'General',
      display_order: faq.display_order ?? 0,
    })),
  };
}

export async function listServices(db: SupabaseClient): Promise<ServiceListData> {
  const { data, error } = await db.from('services').select('*');
  if (error) {
    if (MISSING_TABLE_CODES.has(error.code)) return { services: [] };
    throw new ServiceError(502, 'UPSTREAM_ERROR', 'Failed to load services.');
  }
  return { services: (data ?? []) as ServiceListData['services'] };
}
