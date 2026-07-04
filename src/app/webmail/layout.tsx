'use client';

import { useState, useEffect } from 'react';
import { Mail, Send, File, Trash, LogOut, Edit } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { X, Minus, Maximize2, Loader2 } from 'lucide-react';

export default function WebmailLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const handleOpenCompose = () => setIsComposeOpen(true);
    window.addEventListener('open-compose', handleOpenCompose);
    return () => window.removeEventListener('open-compose', handleOpenCompose);
  }, []);

  const handleSend = async () => {
    if (!to) {
      toast.error('Recipient is required');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/webmail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, text: body })
      });
      if (!res.ok) throw new Error('Failed to send email');
      toast.success('Email sent!');
      setIsComposeOpen(false);
      setTo(''); setSubject(''); setBody('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  if (pathname === '/webmail/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <h1 className="font-semibold text-lg flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-400" />
            Webmail
          </h1>
        </div>
        
        <div className="p-4">
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => window.dispatchEvent(new CustomEvent('open-compose'))}>
            <Edit className="w-4 h-4 mr-2" />
            Compose
          </Button>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          <Link href="/webmail/inbox">
            <span className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              pathname.includes('/inbox') ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
            }`}>
              <Mail className="w-4 h-4" />
              Inbox
            </span>
          </Link>
          <Link href="/webmail/sent">
            <span className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              pathname.includes('/sent') ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
            }`}>
              <Send className="w-4 h-4" />
              Sent
            </span>
          </Link>
          <Link href="/webmail/drafts">
            <span className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              pathname.includes('/drafts') ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
            }`}>
              <File className="w-4 h-4" />
              Drafts
            </span>
          </Link>
          <Link href="/webmail/trash">
            <span className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              pathname.includes('/trash') ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
            }`}>
              <Trash className="w-4 h-4" />
              Trash
            </span>
          </Link>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-red-400 hover:bg-red-400/10" onClick={() => router.push('/webmail/login')}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {children}

        {/* Compose Modal */}
        {isComposeOpen && (
          <div className="absolute bottom-0 right-16 w-[500px] h-[600px] bg-zinc-900 border border-zinc-800 rounded-t-xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="h-10 bg-zinc-800 flex items-center justify-between px-3">
              <span className="text-sm font-medium">New Message</span>
              <div className="flex items-center gap-2">
                <button className="text-zinc-400 hover:text-zinc-100"><Minus className="w-4 h-4" /></button>
                <button className="text-zinc-400 hover:text-zinc-100"><Maximize2 className="w-4 h-4" /></button>
                <button className="text-zinc-400 hover:text-zinc-100" onClick={() => setIsComposeOpen(false)}><X className="w-4 h-4" /></button>
              </div>
            </div>
            
            {/* Form */}
            <div className="flex-1 flex flex-col p-4 gap-2">
              <Input 
                placeholder="To" 
                className="bg-transparent border-0 border-b border-zinc-800 rounded-none px-0 focus-visible:ring-0 text-sm"
                value={to} onChange={e => setTo(e.target.value)}
              />
              <Input 
                placeholder="Subject" 
                className="bg-transparent border-0 border-b border-zinc-800 rounded-none px-0 focus-visible:ring-0 text-sm font-semibold"
                value={subject} onChange={e => setSubject(e.target.value)}
              />
              <textarea 
                className="flex-1 w-full bg-transparent resize-none outline-none mt-2 text-sm text-zinc-300"
                placeholder="Write your email..."
                value={body} onChange={e => setBody(e.target.value)}
              />
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/50">
              <Button onClick={handleSend} disabled={sending} className="bg-indigo-600 hover:bg-indigo-700 px-6">
                {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Send
              </Button>
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-400" onClick={() => setIsComposeOpen(false)}>
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
