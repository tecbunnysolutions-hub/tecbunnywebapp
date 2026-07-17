'use client';

import * as React from 'react';
import { RefreshCw, Mail, Star, Archive, Trash2, ChevronRight } from 'lucide-react';

interface EmailThread {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  unread: boolean;
  starred: boolean;
}

const MOCK_THREADS: EmailThread[] = [
  { id: '1', from: 'support@tecbunny.com', subject: 'Welcome to TecBunny', preview: 'Your account is ready...', date: '10:32 AM', unread: true, starred: false },
  { id: '2', from: 'billing@tecbunny.com', subject: 'Invoice INV-2026-001', preview: 'Please find attached...', date: 'Yesterday', unread: false, starred: true },
  { id: '3', from: 'noreply@infobip.com', subject: 'WABA Channel Approved', preview: 'Your WhatsApp Business Account...', date: 'Jul 15', unread: false, starred: false },
];

export default function InboxPage() {
  const [threads, setThreads] = React.useState<EmailThread[]>(MOCK_THREADS);
  const [loading, setLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<string | null>(null);

  const toggleStar = (id: string) =>
    setThreads(prev => prev.map(t => t.id === id ? { ...t, starred: !t.starred } : t));

  const markRead = (id: string) =>
    setThreads(prev => prev.map(t => t.id === id ? { ...t, unread: false } : t));

  const selectedThread = threads.find(t => t.id === selected);
  const unreadCount = threads.filter(t => t.unread).length;

  return (
    <div className="flex h-full">
      {/* Thread list */}
      <div className={`flex flex-col border-r border-slate-200 ${selected ? 'hidden md:flex w-80' : 'w-full md:w-80'}`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white sticky top-0">
          <h1 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
            <Mail className="w-4 h-4" /> Inbox
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </h1>
          <button
            onClick={() => setLoading(true)}
            disabled={loading}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-500"
            aria-label="Refresh inbox"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {threads.map(thread => (
            <button
              key={thread.id}
              onClick={() => { setSelected(thread.id); markRead(thread.id); }}
              className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                selected === thread.id ? 'bg-indigo-50 border-r-2 border-r-indigo-500' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className={`text-sm truncate ${thread.unread ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                  {thread.from}
                </span>
                <span className="text-[10px] text-slate-400 shrink-0">{thread.date}</span>
              </div>
              <div className="flex items-center gap-2">
                {thread.unread && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />}
                <span className={`text-xs truncate ${thread.unread ? 'font-medium text-slate-800' : 'text-slate-500'}`}>
                  {thread.subject}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{thread.preview}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Thread view */}
      {selected && selectedThread ? (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white sticky top-0">
            <button
              className="md:hidden text-slate-500 hover:text-slate-800 mr-2"
              onClick={() => setSelected(null)}
              aria-label="Back to inbox"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
            <h2 className="font-semibold text-sm text-slate-800 truncate flex-1">{selectedThread.subject}</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleStar(selected)} className="p-1.5 rounded hover:bg-slate-100" aria-label="Star">
                <Star className={`w-4 h-4 ${selectedThread.starred ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
              </button>
              <button
                onClick={() => { setThreads(t => t.filter(x => x.id !== selected)); setSelected(null); }}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-red-500"
                aria-label="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded hover:bg-slate-100 text-slate-400" aria-label="Archive">
                <Archive className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl">
              <div className="mb-6 pb-4 border-b border-slate-100">
                <p className="text-xs text-slate-500">From: <span className="font-medium text-slate-700">{selectedThread.from}</span></p>
                <p className="text-xs text-slate-500 mt-0.5">Date: {selectedThread.date}</p>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{selectedThread.preview}</p>
              <p className="mt-4 text-xs text-slate-400 italic">
                This is a preview. Full email body integration requires IMAP/SMTP backend connection.
              </p>
            </div>
          </div>
          {/* Reply bar */}
          <div className="border-t border-slate-200 p-4 bg-white">
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2">
              <input
                type="text"
                placeholder="Quick reply..."
                className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400"
                aria-label="Quick reply"
              />
              <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 shrink-0">Send</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-slate-400">
          <div className="text-center">
            <Mail className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Select an email to read</p>
          </div>
        </div>
      )}
    </div>
  );
}
