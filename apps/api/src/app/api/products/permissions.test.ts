import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ session: vi.fn(), from: vi.fn(), update: vi.fn(), remove: vi.fn(), single: vi.fn(), existing: vi.fn(), service: vi.fn() }));
vi.mock('@tecbunny/core/auth/server-role', () => ({ getSessionWithRole: mocks.session }));
vi.mock('@tecbunny/database/server', () => ({ createSupabaseClient: vi.fn() }));
vi.mock('@tecbunny/database/admin', () => ({ createSupabaseServiceClient: mocks.service, isSupabaseServiceConfigured: true }));
vi.mock('@tecbunny/core/server', () => ({ createSupabaseServiceClient: mocks.service, isSupabaseServiceConfigured: true }));
vi.mock('@tecbunny/core', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('@tecbunny/core/ai/tax-classification', () => ({ classifyProductTax: vi.fn(), TaxClassificationError: class extends Error {} }));
vi.mock('@tecbunny/core/image-processor', () => ({ processAndUploadExternalImage: vi.fn() }));
vi.mock('../../../lib/revalidate-public', () => ({ withPublicRevalidation: (_tags: string[], handler: unknown) => handler }));
vi.mock('../../../../lib/revalidate-public', () => ({ withPublicRevalidation: (_tags: string[], handler: unknown) => handler }));
import { POST, PUT, DELETE } from './route';
import { PATCH } from './[id]/route';

const id = '00000000-0000-4000-8000-000000000001';
const request = (method: string, body?: object) => new NextRequest(`https://api.test/api/products?id=${id}`, {
  method, ...(body ? { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } } : {}),
});
const context = { params: Promise.resolve({ id }) };
beforeEach(() => {
  vi.resetAllMocks();
  const query: any = { select: vi.fn(() => query), eq: vi.fn(() => query), single: mocks.single, maybeSingle: mocks.existing, update: mocks.update, delete: mocks.remove,
    then: (resolve: (value: object) => unknown) => Promise.resolve({ error: null }).then(resolve) };
  mocks.update.mockReturnValue(query);
  mocks.remove.mockReturnValue(query);
  mocks.from.mockReturnValue(query);
  mocks.existing.mockResolvedValue({ data: { id, price: 100 }, error: null });
  mocks.single.mockResolvedValue({ data: { id, price: 200 }, error: null });
  mocks.service.mockReturnValue({ from: mocks.from });
});

const operations = [
  ['create', () => POST(request('POST', { title: 'Product', status: 'active', images: [] }), context)],
  ['update', () => PUT(request('PUT', { id, price: 200 }), context)],
  ['edit', () => PATCH(request('PATCH', { price: 200 }), context)],
  ['delete', () => DELETE(request('DELETE'), context)],
] as const;

describe('product write authorization', () => {
  it.each(['admin', 'superadmin'])('allows %s to edit and delete products', async role => {
    mocks.session.mockResolvedValue({ session: { user: { id } }, role });
    expect((await PATCH(request('PATCH', { price: 200 }), context))?.status).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ price: 200 }));
    expect((await DELETE(request('DELETE'), context))?.status).toBe(200);
    expect(mocks.remove).toHaveBeenCalled();
  });
  it.each(['admin', 'superadmin'])('allows %s through create authorization while preserving publication validation', async role => {
    mocks.session.mockResolvedValue({ session: { user: { id } }, role });
    expect((await POST(request('POST', { title: 'Product', status: 'active', images: [] }), context))?.status).toBe(422);
  });
  it.each(operations)('denies lower staff roles for %s', async (_name, invoke) => {
    for (const role of ['customer', 'sales_executive', 'sales_manager', 'service_manager']) {
      mocks.session.mockResolvedValue({ session: { user: { id } }, role });
      expect([401, 403]).toContain((await invoke())?.status);
    }
    expect(mocks.service).not.toHaveBeenCalled();
  });
  it.each(operations)('rejects anonymous %s requests before database access', async (_name, invoke) => {
    mocks.session.mockResolvedValue({ session: null, role: null });
    expect((await invoke())?.status).toBe(401);
    expect(mocks.service).not.toHaveBeenCalled();
  });
});
