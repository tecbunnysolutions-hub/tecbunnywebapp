'use client';

import * as React from 'react';
import { RefreshCw, Mail, Star, Archive, Trash2, ChevronRight, Search } from 'lucide-react';

interface EmailThread {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  unread: boolean;
  starred: boolean;
}

type AuditEntry = {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
};

const MOCK_THREADS: EmailThread[] = [
  { id: '1', from: 'support@tecbunny.com', subject: 'Welcome to TecBunny', preview: 'Your account is ready...', date: '10:32 AM', unread: true, starred: false },
  { id: '2', from: 'billing@tecbunny.com', subject: 'Invoice INV-2026-001', preview: 'Please find attached...', date: 'Yesterday', unread: false, starred: true },
  { id: '3', from: 'noreply@infobip.com', subject: 'WABA Channel Approved', preview: 'Your WhatsApp Business Account...', date: 'Jul 15', unread: false, starred: false },
];

const mockWebmailEnabled = process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_WEBMAIL_ENABLE_MOCK === 'true';
const WEBMAIL_PROVIDER_REQUIREMENTS = [
  'WEBMAIL_IMAP_HOST',
  'WEBMAIL_SMTP_HOST',
  'WEBMAIL_MAILBOX_USER',
];

function emitProductTelemetry(event: string, payload: Record<string, string | number | boolean | null | undefined>) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('tecbunny:product-telemetry', {
    detail: { event, payload, timestamp: new Date().toISOString() },
  }));
}

export default function InboxPage() {
  const [threads, setThreads] = React.useState<EmailThread[]>(mockWebmailEnabled ? MOCK_THREADS : []);
  const [loading, setLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [replyDraft, setReplyDraft] = React.useState('');
  const [replyNotice, setReplyNotice] = React.useState<string | null>(null);
  const [archivedCount, setArchivedCount] = React.useState(0);
  const [actionNotice, setActionNotice] = React.useState<string | null>(null);
  const [auditTrail, setAuditTrail] = React.useState<AuditEntry[]>([]);

  const appendAuditEntry = (action: string, detail: string) => {
    setAuditTrail(entries => [
      { id: `${Date.now()}-${action}`, action, detail, timestamp: new Date().toISOString() },
      ...entries,
    ].slice(0, 8));
  };

  const toggleStar = (id: string) =>
    setThreads(prev => prev.map(t => t.id === id ? { ...t, starred: !t.starred } : t));

  const markRead = (id: string) =>
    setThreads(prev => prev.map(t => t.id === id ? { ...t, unread: false } : t));

  const selectedThread = threads.find(t => t.id === selected);
  const removeSelectedThread = (action: 'archived' | 'deleted') => {
    if (!selectedThread) return;
    setThreads(currentThreads => currentThreads.filter(thread => thread.id !== selectedThread.id));
    setSelected(null);
    setReplyDraft('');
    setReplyNotice(null);
    if (action === 'archived') setArchivedCount(count => count + 1);
    setActionNotice(`${selectedThread.subject} ${action}. Connect the mailbox provider to persist this change.`);
    appendAuditEntry(action === 'archived' ? 'Archive staged' : 'Delete staged', selectedThread.subject);
  };
  const unreadCount = threads.filter(t => t.unread).length;
  const filteredThreads = threads.filter((thread) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return [thread.from, thread.subject, thread.preview].join(' ').toLowerCase().includes(query);
  });

  if (!mockWebmailEnabled) {
    return (
      <div className="flex h-full items-center justify-center bg-muted px-6">
        <div className="max-w-xl rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-sm font-semibold text-foreground">Webmail requires a production mailbox provider</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Mock inbox data is disabled for production traffic. Configure the mailbox provider and verify health before routing customer conversations here.
              </p>
            </div>
          </div>
          <div className="mt-5 rounded-lg border border-border bg-muted p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Required provider settings</p>
            <ul className="mt-3 space-y-2">
              {WEBMAIL_PROVIDER_REQUIREMENTS.map((key) => (
                <li key={key} className="flex items-center justify-between gap-3 rounded-md bg-card px-3 py-2 text-xs font-mono text-foreground">
                  <span>{key}</span>
                  <span className="rounded-full bg-warning/10 px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-warning">required</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Health check: <span className="font-mono text-foreground">/api/health</span> reports <span className="font-mono text-foreground">configuration_required</span> until the provider contract is complete.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Thread list */}
      <div className={`flex flex-col border-r border-border ${selected ? 'hidden md:flex w-80' : 'w-full md:w-80'}`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card sticky top-0">
          <h1 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Mail className="w-4 h-4" /> Inbox
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">{unreadCount}</span>
            )}
            {archivedCount > 0 && (
              <span className="text-[10px] font-bold bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{archivedCount} archived</span>
            )}
          </h1>
          <button
            onClick={() => setLoading(true)}
            disabled={loading}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground"
            aria-label="Refresh inbox"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {actionNotice && (
          <div role="status" className="border-b border-primary/10 bg-primary/10 px-4 py-2 text-xs text-primary">
            {actionNotice}
          </div>
        )}
        <div className="border-b border-border bg-card px-4 py-3">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border border-border bg-muted py-2 pl-9 pr-3 text-xs text-foreground outline-none focus:border-primary focus:bg-card"
              placeholder="Search sender, subject, or preview"
              aria-label="Search email threads"
            />
          </label>
        </div>
        <div className="overflow-y-auto flex-1">
          {filteredThreads.map(thread => (
            <button
              key={thread.id}
              onClick={() => { setSelected(thread.id); markRead(thread.id); appendAuditEntry('Thread opened', thread.subject); }}
              className={`w-full text-left px-4 py-3 border-b border-border hover:bg-muted transition-colors ${
                selected === thread.id ? 'bg-primary/10 border-r-2 border-r-indigo-500' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className={`text-sm truncate ${thread.unread ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                  {thread.from}
                </span>
                <span className="text-[10px] text-muted-foreground shrink-0">{thread.date}</span>
              </div>
              <div className="flex items-center gap-2">
                {thread.unread && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 text-primary-foreground" />}
                <span className={`text-xs truncate ${thread.unread ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                  {thread.subject}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">{thread.preview}</p>
            </button>
          ))}
          {filteredThreads.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">
              No threads match this search.
            </div>
          )}
        </div>
      </div>

      {/* Thread view */}
      {selected && selectedThread ? (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card sticky top-0">
            <button
              className="md:hidden text-muted-foreground hover:text-foreground mr-2"
              onClick={() => setSelected(null)}
              aria-label="Back to inbox"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
            <h2 className="font-semibold text-sm text-foreground truncate flex-1">{selectedThread.subject}</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleStar(selected)} className="p-1.5 rounded hover:bg-muted" aria-label="Star">
                <Star className={`w-4 h-4 ${selectedThread.starred ? 'fill-warning text-warning' : 'text-muted-foreground'}`} />
              </button>
              <button
                onClick={() => removeSelectedThread('deleted')}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive"
                aria-label="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={() => removeSelectedThread('archived')} className="p-1.5 rounded hover:bg-muted text-muted-foreground" aria-label="Archive">
                <Archive className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid max-w-5xl gap-6 lg:grid-cols-[1fr_280px]">
              <div>
              <div className="mb-6 pb-4 border-b border-border">
                <p className="text-xs text-muted-foreground">From: <span className="font-medium text-foreground">{selectedThread.from}</span></p>
                <p className="text-xs text-muted-foreground mt-0.5">Date: {selectedThread.date}</p>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{selectedThread.preview}</p>
              <p className="mt-4 text-xs text-muted-foreground italic">
                This is a preview. Full email body integration requires IMAP/SMTP backend connection.
              </p>
              {replyNotice && (
                <div role="status" className="mt-4 rounded-lg border border-primary/20 bg-primary/10 p-3 text-xs text-primary">
                  {replyNotice}
                </div>
              )}
              </div>
              <aside className="space-y-4">
                <section className="rounded-xl border border-border bg-muted p-4" aria-label="Mailbox provider settings">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mailbox settings</p>
                  <div className="mt-3 space-y-2">
                    {WEBMAIL_PROVIDER_REQUIREMENTS.map((key) => (
                      <div key={key} className="flex items-center justify-between gap-2 rounded-lg bg-card px-3 py-2 text-[11px] text-muted-foreground">
                        <span className="font-mono">{key}</span>
                        <span className="rounded-full bg-warning/10 px-2 py-0.5 font-semibold text-warning">required</span>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="rounded-xl border border-border bg-card p-4" aria-label="Communication audit trail">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Audit trail</p>
                  <div className="mt-3 space-y-3">
                    {auditTrail.length > 0 ? auditTrail.map((entry) => (
                      <div key={entry.id} className="border-l-2 border-primary/20 pl-3">
                        <p className="text-xs font-semibold text-foreground">{entry.action}</p>
                        <p className="text-[11px] text-muted-foreground">{entry.detail}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(entry.timestamp).toLocaleTimeString()}</p>
                      </div>
                    )) : (
                      <p className="text-xs text-muted-foreground">Open or stage a thread action to create an audit entry.</p>
                    )}
                  </div>
                </section>
              </aside>
            </div>
          </div>
          {/* Reply bar */}
          <div className="border-t border-border p-4 bg-card">
            <div className="flex items-center gap-3 bg-muted rounded-xl px-4 py-2">
              <input
                type="text"
                placeholder="Quick reply..."
                value={replyDraft}
                onChange={(event) => {
                  setReplyDraft(event.target.value);
                  setReplyNotice(null);
                }}
                className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
                aria-label="Quick reply"
              />
              <button
                type="button"
                className="text-xs font-medium text-primary hover:text-primary disabled:text-muted-foreground shrink-0"
                disabled={!replyDraft.trim()}
                onClick={() => {
                  emitProductTelemetry('webmail_reply_staged', { threadId: selectedThread.id, draftLength: replyDraft.trim().length });
                  appendAuditEntry('Reply staged', selectedThread.subject);
                  setReplyNotice('Reply draft staged. Connect IMAP/SMTP provider to send production email.');
                  setReplyDraft('');
                }}
              >
                Stage Reply
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Mail className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Select an email to read</p>
          </div>
        </div>
      )}
    </div>
  );
}
