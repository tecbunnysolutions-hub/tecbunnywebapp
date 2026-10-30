import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => {
  const select = vi.fn().mockResolvedValue({ data: [{ id: 'published-id', updated_at: null }], error: null });
  const from = vi.fn(() => ({ select }));
  return { select, from };
});
vi.mock('@tecbunny/database/admin', () => ({ createServiceClient: () => db }));
vi.mock('@tecbunny/database/server', () => ({
  createPublicClient: () => { throw new Error('Browser role cannot read published_blueprints'); },
}));

import { GET } from './route';

describe('public blueprint sitemap listing', () => {
  it('uses the server client with only the published ID and timestamp projection', async () => {
    const response = await GET(new NextRequest('https://api.tecbunny.com/api/v1/blueprints'));
    expect(response.status).toBe(200);
    expect(db.from).toHaveBeenCalledWith('published_blueprints');
    expect(db.select).toHaveBeenCalledWith('id, updated_at');
    const body = await response.json();
    expect(body.data).toEqual({ blueprints: [{ id: 'published-id', updated_at: null }] });
  });
});
