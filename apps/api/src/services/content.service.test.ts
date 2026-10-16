import type { SupabaseClient } from '@tecbunny/database';
import { describe, expect, it } from 'vitest';

import { getHomeContent, listActiveFaqs, listServices } from './content.service';

type Result = { data: unknown; error: unknown };

function fakeDb(tables: Record<string, Result>) {
  return {
    from: (table: string) => {
      const result = tables[table];
      const builder: Record<string, unknown> = {};
      for (const method of ['select', 'eq', 'is', 'order']) builder[method] = () => builder;
      builder.maybeSingle = async () => result;
      builder.then = (resolve: (value: Result) => unknown) => resolve(result);
      return builder;
    },
  } as unknown as SupabaseClient;
}

describe('getHomeContent', () => {
  it('unwraps settings and page_content values', async () => {
    const db = fakeDb({
      settings: { data: { value: [{ name: 'A' }] }, error: null },
      page_content: { data: { data: { slides: [] } }, error: null },
    });
    expect(await getHomeContent(db)).toEqual({ partnerBrands: [{ name: 'A' }], heroCarousel: { slides: [] } });
  });

  it('returns nulls instead of failing when rows are missing or erroring', async () => {
    const db = fakeDb({
      settings: { data: null, error: null },
      page_content: { data: null, error: { message: 'x' } },
    });
    expect(await getHomeContent(db)).toEqual({ partnerBrands: null, heroCarousel: null });
  });
});

describe('listActiveFaqs', () => {
  it('defaults category and display order', async () => {
    const db = fakeDb({
      cms_faqs: { data: [{ id: '1', category: null, question: 'q', answer: 'a', display_order: null }], error: null },
    });
    expect((await listActiveFaqs(db)).faqs[0]).toMatchObject({ category: 'General', display_order: 0 });
  });

  it('treats a missing table as empty and other errors as 502', async () => {
    const missing = fakeDb({ cms_faqs: { data: null, error: { code: 'PGRST205' } } });
    expect(await listActiveFaqs(missing)).toEqual({ faqs: [] });
    const broken = fakeDb({ cms_faqs: { data: null, error: { code: '500' } } });
    await expect(listActiveFaqs(broken)).rejects.toMatchObject({ status: 502 });
  });
});

describe('listServices', () => {
  it('returns rows, empty for a missing table, 502 otherwise', async () => {
    expect(await listServices(fakeDb({ services: { data: [{ id: 1 }], error: null } }))).toEqual({ services: [{ id: 1 }] });
    expect(await listServices(fakeDb({ services: { data: null, error: { code: 'PGRST205' } } }))).toEqual({ services: [] });
    await expect(listServices(fakeDb({ services: { data: null, error: { code: '1' } } }))).rejects.toMatchObject({ status: 502 });
  });
});
