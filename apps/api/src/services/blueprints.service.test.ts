import type { SupabaseClient } from '@tecbunny/database';
import { describe, expect, it } from 'vitest';

import { getPublishedBlueprint, listPublishedBlueprints } from './blueprints.service';

type Result = { data: unknown; error: unknown };

function fakeDb(result: Result) {
  const builder: Record<string, unknown> = {};
  for (const method of ['select', 'eq']) builder[method] = () => builder;
  builder.maybeSingle = async () => result;
  builder.then = (resolve: (value: Result) => unknown) => resolve(result);
  return { from: () => builder } as unknown as SupabaseClient;
}

describe('blueprints service', () => {
  it('lists published blueprints', async () => {
    expect(await listPublishedBlueprints(fakeDb({ data: [{ id: 'a' }], error: null }))).toEqual({ blueprints: [{ id: 'a' }] });
  });

  it('502s when listing fails', async () => {
    await expect(listPublishedBlueprints(fakeDb({ data: null, error: { code: '1' } }))).rejects.toMatchObject({ status: 502 });
  });

  it('returns a blueprint, 404s when missing or the id is malformed, 502s on other errors', async () => {
    expect(await getPublishedBlueprint(fakeDb({ data: { id: 'a' }, error: null }), 'a')).toMatchObject({ id: 'a' });
    await expect(getPublishedBlueprint(fakeDb({ data: null, error: null }), 'x')).rejects.toMatchObject({ status: 404 });
    await expect(getPublishedBlueprint(fakeDb({ data: null, error: { code: '22P02' } }), 'x')).rejects.toMatchObject({ status: 404 });
    await expect(getPublishedBlueprint(fakeDb({ data: null, error: { code: '500' } }), 'x')).rejects.toMatchObject({ status: 502 });
  });
});
