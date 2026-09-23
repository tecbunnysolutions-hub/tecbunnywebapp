import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ auth: vi.fn(), scope: vi.fn(), canAccess: vi.fn(), upload: vi.fn(), createBucket: vi.fn(), send: vi.fn() }));
vi.mock('@tecbunny/core/server-role-guard', () => ({ requireApiRole: mocks.auth }));
vi.mock('@/lib/authorization-scope', () => ({ resolveActorScope: mocks.scope, canAccessConversationSender: mocks.canAccess }));
vi.mock('@/services/infobipService', () => ({ sendWhatsAppMedia: mocks.send }));
vi.mock('@/lib/supabase', () => ({ supabase: { storage: {
  createBucket: mocks.createBucket,
  from: () => ({ upload: mocks.upload, getPublicUrl: () => ({ data: { publicUrl: 'https://storage.test/file.pdf' } }) }),
} } }));
import { POST } from './route';

function request() {
  const form = new FormData();
  form.set('to', '919876543210');
  form.set('type', 'document');
  form.set('file', new File(['%PDF-test'], 'test.pdf', { type: 'application/pdf' }));
  return new Request('https://waba.test/api/messages/media', { method: 'POST', body: form });
}

describe('WhatsApp media authorization', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.auth.mockResolvedValue({ role: 'sales_agent', session: { user: { id: 'agent-1' } } });
    mocks.scope.mockResolvedValue({ isGlobal: false, organizationId: 'org-1', branchId: 'branch-1' });
    mocks.canAccess.mockResolvedValue(true);
    mocks.createBucket.mockResolvedValue({});
    mocks.upload.mockResolvedValue({ error: null });
    mocks.send.mockResolvedValue({ success: true });
  });

  it('blocks other organizations and branches before creating or uploading files', async () => {
    mocks.canAccess.mockResolvedValue(false);
    expect((await POST(request())).status).toBe(403);
    expect(mocks.canAccess).toHaveBeenCalledWith(expect.objectContaining({ organizationId: 'org-1' }), '919876543210');
    expect(mocks.createBucket).not.toHaveBeenCalled();
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it('fails closed if the actor scope cannot be resolved', async () => {
    mocks.scope.mockResolvedValue(null);
    expect((await POST(request())).status).toBe(403);
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it('sends attachments to an authorized conversation', async () => {
    expect((await POST(request())).status).toBe(200);
    expect(mocks.send).toHaveBeenCalledWith('919876543210', 'document', 'https://storage.test/file.pdf');
  });

  it('continues to deny customer accounts', async () => {
    mocks.auth.mockResolvedValue({ role: 'customer', session: { user: { id: 'customer-1' } } });
    expect((await POST(request())).status).toBe(403);
    expect(mocks.scope).not.toHaveBeenCalled();
  });
});
