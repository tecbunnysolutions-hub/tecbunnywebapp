import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  canAccess: vi.fn(),
  resolveScope: vi.fn(),
  requireRole: vi.fn(),
  createEvent: vi.fn(),
  markProcessing: vi.fn(),
  markDelivered: vi.fn(),
  markFailedAndScheduleRetry: vi.fn(),
  fetch: vi.fn(),
  insertMessage: vi.fn(),
  conversation: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({ supabase: { from: mocks.from } }));
vi.mock('@tecbunny/core/server-role-guard', () => ({ requireApiRole: mocks.requireRole }));
vi.mock('@/lib/authorization-scope', () => ({
  canAccessConversationSender: mocks.canAccess,
  resolveActorScope: mocks.resolveScope,
  getAccessibleConversationSenders: vi.fn(),
}));
vi.mock('@tecbunny/core', () => ({ OutboundEventService: mocks }));
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return { generateContent: async () => ({ response: { text: () => '{}' } }) };
    }
  },
}));

// Use the real send service to catch regressions that accidentally send templates.
import { POST } from './route';

const phone = '919876543210';
const lastInbound = new Date(Date.now() - 60 * 60 * 1000).toISOString();
const request = (body: unknown = { to: phone, text: 'Thanks for contacting us.' }) => new Request('https://waba.test/api/messages', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});

describe('Manual WhatsApp replies', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('META_ACCESS_TOKEN', 'test-token');
    vi.stubEnv('META_PHONE_NUMBER_ID', 'test-number-id');
    vi.stubGlobal('fetch', mocks.fetch);
    mocks.requireRole.mockResolvedValue({ role: 'superadmin', session: { user: { id: 'agent-1' } } });
    mocks.resolveScope.mockResolvedValue({});
    mocks.canAccess.mockResolvedValue(true);
    mocks.conversation.mockResolvedValue({ data: { id: 'conversation-1', last_interaction_timestamp: lastInbound }, error: null });
    mocks.createEvent.mockResolvedValue({ id: 'event-1', status: 'PENDING' });
    mocks.markProcessing.mockResolvedValue('processing-token');
    mocks.insertMessage.mockResolvedValue({ error: null });
    mocks.from.mockImplementation((table: string) => {
      if (table === 'Message') return { insert: mocks.insertMessage };
      if (table === 'FailedApiCall') return { insert: vi.fn().mockResolvedValue({ error: null }) };
      const query = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() };
      query.select.mockReturnValue(query);
      query.eq.mockReturnValue(query);
      query.maybeSingle = table === 'Conversation' ? mocks.conversation : vi.fn().mockResolvedValue({
        data: { status: 'PROCESSING', processing_token: 'processing-token', requires_consent: false }, error: null,
      });
      return query;
    });
    mocks.fetch.mockResolvedValue(Response.json({ messages: [{ id: 'wamid.reply-1' }] }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('sends an in-window manual reply as text and persists the Meta ID in history', async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    const payload = JSON.parse(mocks.fetch.mock.calls[0][1].body);
    expect(payload).toEqual({ messaging_product: 'whatsapp', to: phone, type: 'text', text: { body: 'Thanks for contacting us.' } });
    expect(mocks.createEvent).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      conversation_id: 'conversation-1', user_id: 'agent-1', message_type: 'text',
    }));
    expect(mocks.insertMessage).toHaveBeenCalledWith(expect.objectContaining({
      message_id: 'wamid.reply-1', sender_number: phone, message_content: 'Thanks for contacting us.',
      direction: 'OUTBOUND', status: 'SENT', sent_by: 'ADMIN',
    }));
  });

  it('returns a readable nested Meta rejection without adding a sent message', async () => {
    mocks.fetch.mockResolvedValue(Response.json({ error: {
      message: 'Invalid parameter', code: 100, error_data: { details: 'The recipient is invalid.' },
    } }, { status: 400 }));
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: 'Invalid parameter (code 100) — The recipient is invalid.' });
    expect(mocks.insertMessage).not.toHaveBeenCalled();
  });

  it('reports history failures as sent so the operator does not duplicate a delivered reply', async () => {
    mocks.insertMessage.mockResolvedValue({ error: { message: 'Database unavailable' } });
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, warning: expect.stringContaining('Do not resend') });
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
  });

  it('does not send when the conversation cannot be loaded', async () => {
    mocks.conversation.mockResolvedValue({ data: null, error: null });
    expect((await POST(request())).status).toBe(404);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it('keeps conversation authorization in front of all send operations', async () => {
    mocks.canAccess.mockResolvedValue(false);
    expect((await POST(request())).status).toBe(403);
    expect(mocks.from).not.toHaveBeenCalled();
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it('rejects empty drafts without calling the provider', async () => {
    expect((await POST(request({ to: phone, text: ' ' }))).status).toBe(400);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
});
